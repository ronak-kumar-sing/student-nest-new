import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service.js';
import {
  BookingPaidEvent,
  BookingCancelledEvent,
} from '../../bookings/events/booking.events.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class BookingNotificationsListener {
  private readonly logger = new Logger(BookingNotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('booking.paid')
  async handleBookingPaid(event: BookingPaidEvent) {
    this.logger.log(`[Event Handler] booking.paid received for booking ${event.bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: event.bookingId },
      include: {
        student: true,
        listing: { include: { owner: true } },
      },
    });

    if (!booking) return;

    // Notify student
    await this.notificationsService.send({
      recipient: booking.student.email,
      type: 'PAYMENT_RECEIVED',
      data: {
        bookingId: booking.id,
        amount: event.amount,
        listingTitle: booking.listing.title,
      },
    });

    // Notify owner
    await this.notificationsService.send({
      recipient: booking.listing.owner.email,
      type: 'PAYMENT_RECEIVED',
      data: {
        bookingId: booking.id,
        amount: event.amount,
        listingTitle: booking.listing.title,
      },
    });
  }

  @OnEvent('booking.cancelled')
  async handleBookingCancelled(event: BookingCancelledEvent) {
    this.logger.log(`[Event Handler] booking.cancelled received for booking ${event.bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: event.bookingId },
      include: {
        student: true,
        listing: { include: { owner: true } },
      },
    });

    if (!booking) return;

    await this.notificationsService.send({
      recipient: booking.student.email,
      type: 'BOOKING_CANCELLED',
      data: {
        bookingId: booking.id,
        reason: event.reason,
        refundIssued: event.refundIssued,
      },
    });
  }
}
