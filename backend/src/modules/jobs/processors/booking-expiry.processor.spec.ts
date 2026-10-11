import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingExpiryProcessor } from './booking-expiry.processor.js';
import { BookingStatus } from '@prisma/client';

describe('BookingExpiryProcessor (Unit)', () => {
  let processor: BookingExpiryProcessor;
  let prismaMock: any;
  let eventEmitterMock: any;

  beforeEach(() => {
    prismaMock = {
      booking: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    eventEmitterMock = {
      emit: vi.fn(),
    };

    processor = new BookingExpiryProcessor(prismaMock, eventEmitterMock);
  });

  it('should auto-cancel an unpaid PENDING booking and emit booking.cancelled', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      id: 'booking-uuid-1',
      studentId: 'student-uuid-1',
      listingId: 'listing-uuid-1',
      status: BookingStatus.PENDING,
    });

    prismaMock.booking.update.mockResolvedValue({
      id: 'booking-uuid-1',
      status: BookingStatus.CANCELLED,
    });

    const result = await processor.process('booking-uuid-1');

    expect(result.expired).toBe(true);
    expect(prismaMock.booking.update).toHaveBeenCalledWith({
      where: { id: 'booking-uuid-1' },
      data: { status: BookingStatus.CANCELLED },
    });
    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      'booking.cancelled',
      expect.objectContaining({
        bookingId: 'booking-uuid-1',
      }),
    );
  });

  it('should auto-cancel an unpaid ACCEPTED booking after delay expires', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      id: 'booking-uuid-2',
      studentId: 'student-uuid-1',
      listingId: 'listing-uuid-1',
      status: BookingStatus.ACCEPTED,
    });

    prismaMock.booking.update.mockResolvedValue({
      id: 'booking-uuid-2',
      status: BookingStatus.CANCELLED,
    });

    const result = await processor.process('booking-uuid-2');

    expect(result.expired).toBe(true);
    expect(prismaMock.booking.update).toHaveBeenCalled();
  });

  it('should NOT cancel a booking that has already been PAID', async () => {
    prismaMock.booking.findUnique.mockResolvedValue({
      id: 'booking-uuid-3',
      studentId: 'student-uuid-1',
      listingId: 'listing-uuid-1',
      status: BookingStatus.PAID,
    });

    const result = await processor.process('booking-uuid-3');

    expect(result.expired).toBe(false);
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
  });
});
