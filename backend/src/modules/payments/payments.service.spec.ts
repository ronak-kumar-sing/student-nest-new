import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import crypto from 'node:crypto';

describe('PaymentsService (Unit)', () => {
  let service: PaymentsService;
  let prismaMock: any;
  let configMock: any;
  let eventEmitterMock: any;

  const testKeySecret = 'test_razorpay_secret_key_123';
  const testWebhookSecret = 'test_webhook_secret_key_123';

  beforeEach(() => {
    prismaMock = {
      booking: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation(async (promises) => Promise.all(promises)),
    };

    configMock = {
      get: vi.fn().mockImplementation((key: string, defaultValue?: string) => {
        const map: Record<string, string> = {
          RAZORPAY_KEY_ID: 'rzp_test_12345678',
          RAZORPAY_KEY_SECRET: testKeySecret,
          RAZORPAY_WEBHOOK_SECRET: testWebhookSecret,
        };
        return map[key] || defaultValue;
      }),
    };

    eventEmitterMock = {
      emit: vi.fn(),
    };

    service = new PaymentsService(prismaMock, configMock, eventEmitterMock);
  });

  describe('createOrder', () => {
    it('should create Razorpay order and pending payment record for ACCEPTED booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        listingId: 'listing-uuid-1',
        totalAmount: 25000,
        status: BookingStatus.ACCEPTED,
        listing: { title: 'PG Room' },
      });

      prismaMock.payment.create.mockResolvedValue({
        id: 'payment-uuid-1',
        bookingId: 'booking-uuid-1',
        amount: 25000,
        currency: 'INR',
        provider: 'RAZORPAY',
        providerOrderId: 'order_test_123',
        status: PaymentStatus.PENDING,
      });

      const res = await service.createOrder('booking-uuid-1', 'student-uuid-1');

      expect(res.bookingId).toBe('booking-uuid-1');
      expect(res.amount).toBe(25000 * 100); // 2500000 paise
      expect(res.currency).toBe('INR');
      expect(prismaMock.payment.create).toHaveBeenCalled();
    });
  });

  describe('verifyPayment', () => {
    it('should verify signature, update payment to RELEASED, transition booking to PAID, and emit event', async () => {
      const orderId = 'order_123456';
      const paymentId = 'pay_123456';
      const signature = crypto
        .createHmac('sha256', testKeySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'payment-uuid-1',
        bookingId: 'booking-uuid-1',
        providerOrderId: orderId,
        amount: 25000,
        status: PaymentStatus.PENDING,
        booking: {
          id: 'booking-uuid-1',
          studentId: 'student-uuid-1',
          listingId: 'listing-uuid-1',
          status: BookingStatus.ACCEPTED,
        },
      });

      prismaMock.payment.update.mockResolvedValue({
        id: 'payment-uuid-1',
        status: PaymentStatus.RELEASED,
        amount: 25000,
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        listingId: 'listing-uuid-1',
        status: BookingStatus.PAID,
      });

      const res = await service.verifyPayment('student-uuid-1', {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      expect(res.success).toBe(true);
      expect(res.status).toBe(BookingStatus.PAID);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.paid',
        expect.objectContaining({
          bookingId: 'booking-uuid-1',
          studentId: 'student-uuid-1',
          paymentId: 'payment-uuid-1',
        }),
      );
    });
  });

  describe('handleWebhook', () => {
    it('should verify webhook signature, transition booking to PAID, and emit event on payment.captured', async () => {
      const payloadObj = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_999',
              order_id: 'order_webhook_888',
              amount: 2500000,
            },
          },
        },
      };

      const rawBody = JSON.stringify(payloadObj);
      const signature = crypto
        .createHmac('sha256', testWebhookSecret)
        .update(rawBody)
        .digest('hex');

      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'payment-uuid-1',
        bookingId: 'booking-uuid-1',
        providerOrderId: 'order_webhook_888',
        amount: 25000,
        status: PaymentStatus.PENDING,
        booking: {
          id: 'booking-uuid-1',
          studentId: 'student-uuid-1',
          listingId: 'listing-uuid-1',
        },
      });

      prismaMock.payment.update.mockResolvedValue({});
      prismaMock.booking.update.mockResolvedValue({});

      const res = await service.handleWebhook(rawBody, signature);

      expect(res.received).toBe(true);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.paid',
        expect.objectContaining({
          bookingId: 'booking-uuid-1',
        }),
      );
    });
  });

  describe('refundPayment', () => {
    it('should update payment record to REFUNDED status', async () => {
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'payment-uuid-1',
        providerPaymentId: 'mock_pay_123',
        status: PaymentStatus.RELEASED,
      });

      prismaMock.payment.update.mockResolvedValue({
        id: 'payment-uuid-1',
        status: PaymentStatus.REFUNDED,
      });

      const res = await service.refundPayment('booking-uuid-1', 'Student requested cancellation');

      expect(res?.refunded).toBe(true);
      expect(prismaMock.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-uuid-1' },
        data: { status: PaymentStatus.REFUNDED },
      });
    });
  });
});
