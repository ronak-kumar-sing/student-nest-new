import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { BookingStatus } from '@prisma/client';
import { BookingCancelledEvent } from '../../bookings/events/booking.events.js';

@Injectable()
export class BookingExpiryProcessor {
  private readonly logger = new Logger(BookingExpiryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async process(bookingId: string): Promise<{ expired: boolean; reason?: string }> {
    this.logger.log(`[Job Processor] Inspecting booking ${bookingId} for payment expiry`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return { expired: false, reason: 'Booking not found' };
    }

    // Only cancel if still unpaid (PENDING or ACCEPTED)
    if (
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.ACCEPTED
    ) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });

      this.logger.warn(`[Job Processor] Booking ${booking.id} auto-cancelled due to payment timeout`);

      this.eventEmitter.emit(
        'booking.cancelled',
        new BookingCancelledEvent(
          booking.id,
          booking.studentId,
          booking.listingId,
          'Auto-cancelled due to payment timeout (BullMQ expiry job)',
          false,
        ),
      );

      return { expired: true, reason: 'Auto-cancelled due to payment timeout' };
    }

    this.logger.log(`[Job Processor] Booking ${booking.id} is already in status '${booking.status}', skipping expiry`);
    return { expired: false, reason: `Booking is already ${booking.status}` };
  }
}
