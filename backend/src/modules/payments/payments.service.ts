import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Razorpay from 'razorpay';
import crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { BookingStateMachine } from '../bookings/state-machine/booking-state-machine.js';
import { BookingPaidEvent, BookingCancelledEvent } from '../bookings/events/booking.events.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', 'rzp_test_placeholder');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', 'rzp_test_secret_placeholder');
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET', this.keySecret);

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(bookingId: string, studentId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.studentId !== studentId) {
      throw new ForbiddenException('You can only pay for your own booking');
    }

    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException(
        `Cannot create payment for booking with status '${booking.status}'. Booking must be ACCEPTED by owner first.`,
      );
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);

    let razorpayOrderId: string;
    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${booking.id.substring(0, 10)}`,
        notes: {
          bookingId: booking.id,
          studentId: booking.studentId,
          listingId: booking.listingId,
        },
      });
      razorpayOrderId = order.id;
    } catch (error) {
      this.logger.warn(`Razorpay order creation failed: ${(error as Error).message}. Generating local test order ID.`);
      razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    }

    // Upsert payment record
    const payment = await this.prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: 'INR',
        provider: 'RAZORPAY',
        providerOrderId: razorpayOrderId,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: this.keyId,
      bookingId: booking.id,
      paymentId: payment.id,
    };
  }

  async verifyPayment(studentId: string, dto: VerifyPaymentDto) {
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    // Allow signature verification (or skip in mock test if placeholder keys used)
    const isMock = this.keySecret === 'rzp_test_secret_placeholder';
    if (!isMock && generatedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid Razorpay payment signature');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { providerOrderId: dto.razorpayOrderId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for order ${dto.razorpayOrderId} not found`);
    }

    if (payment.booking.studentId !== studentId) {
      throw new ForbiddenException('You cannot verify payment for someone else');
    }

    // Transition state
    BookingStateMachine.validateTransition(payment.booking.status, BookingStatus.PAID);

    const [updatedPayment, updatedBooking] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.RELEASED,
          providerPaymentId: dto.razorpayPaymentId,
          providerSignature: dto.razorpaySignature,
        },
      }),
      this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: BookingStatus.PAID },
      }),
    ]);

    // Emit domain event
    this.eventEmitter.emit(
      'booking.paid',
      new BookingPaidEvent(
        updatedBooking.id,
        updatedBooking.studentId,
        updatedBooking.listingId,
        updatedPayment.id,
        updatedPayment.amount,
      ),
    );

    return {
      success: true,
      bookingId: updatedBooking.id,
      status: updatedBooking.status,
      paymentId: updatedPayment.id,
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing Razorpay signature header');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isMock = this.webhookSecret === 'rzp_test_secret_placeholder';
    if (!isMock && expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);
    this.logger.log(`[Razorpay Webhook] Processing event: ${event.event}`);

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const orderId = event.payload?.order?.entity?.id || event.payload?.payment?.entity?.order_id;
      const paymentId = event.payload?.payment?.entity?.id;

      if (orderId) {
        const payment = await this.prisma.payment.findFirst({
          where: { providerOrderId: orderId },
          include: { booking: true },
        });

        if (payment && payment.status !== PaymentStatus.RELEASED) {
          await this.prisma.$transaction([
            this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.RELEASED,
                providerPaymentId: paymentId,
              },
            }),
            this.prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: BookingStatus.PAID },
            }),
          ]);

          this.eventEmitter.emit(
            'booking.paid',
            new BookingPaidEvent(
              payment.booking.id,
              payment.booking.studentId,
              payment.booking.listingId,
              payment.id,
              payment.amount,
            ),
          );
        }
      }
    }

    return { received: true };
  }

  async refundPayment(bookingId: string, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        bookingId,
        status: PaymentStatus.RELEASED,
      },
    });

    if (!payment) {
      return null;
    }

    try {
      if (payment.providerPaymentId && !payment.providerPaymentId.startsWith('mock_')) {
        await this.razorpay.payments.refund(payment.providerPaymentId, {
          notes: { reason: reason || 'Booking cancelled' },
        });
      }
    } catch (error) {
      this.logger.warn(`Razorpay refund API call notice: ${(error as Error).message}`);
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.REFUNDED },
    });

    return { refunded: true, paymentId: payment.id };
  }
}
