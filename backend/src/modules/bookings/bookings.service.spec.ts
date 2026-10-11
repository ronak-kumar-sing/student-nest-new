import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BookingsService } from './bookings.service.js';
import { BookingStatus, Role } from '@prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('BookingsService (Unit)', () => {
  let service: BookingsService;
  let prismaMock: any;
  let paymentsMock: any;
  let notificationsMock: any;
  let eventEmitterMock: any;

  beforeEach(() => {
    prismaMock = {
      listing: {
        findUnique: vi.fn(),
      },
      booking: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };

    paymentsMock = {
      createOrder: vi.fn().mockResolvedValue({
        orderId: 'order_mock123',
        amount: 2350000,
        currency: 'INR',
        keyId: 'rzp_test_123',
      }),
      refundPayment: vi.fn().mockResolvedValue({
        refunded: true,
        paymentId: 'payment-uuid-1',
      }),
    };

    notificationsMock = {
      send: vi.fn().mockResolvedValue({ delivered: true }),
    };

    const jobsMock = {
      scheduleBookingExpiry: vi.fn().mockResolvedValue({ scheduled: true }),
    };

    eventEmitterMock = {
      emit: vi.fn(),
    };

    service = new BookingsService(
      prismaMock,
      paymentsMock,
      notificationsMock,
      jobsMock as any,
      eventEmitterMock,
    );
  });

  describe('create (Happy Path - Step 1)', () => {
    it('should create a booking in PENDING status, calculate totalAmount, and emit event', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        title: 'PG Room',
        pricePerMonth: 8500,
        securityDeposit: 15000,
        isAvailable: true,
        owner: { email: 'owner@example.com' },
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 5);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 90); // ~3 months

      prismaMock.booking.create.mockResolvedValue({
        id: 'booking-uuid-1',
        listingId: 'listing-uuid-1',
        studentId: 'student-uuid-1',
        startDate,
        endDate,
        totalAmount: 8500 * 3 + 15000, // 40500
        status: BookingStatus.PENDING,
      });

      const res = await service.create('student-uuid-1', {
        listingId: 'listing-uuid-1',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      expect(res.id).toBe('booking-uuid-1');
      expect(res.status).toBe(BookingStatus.PENDING);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.created',
        expect.objectContaining({
          bookingId: 'booking-uuid-1',
          studentId: 'student-uuid-1',
        }),
      );
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'BOOKING_REQUESTED',
          recipient: 'owner@example.com',
        }),
      );
    });

    it('should reject if end date is before start date', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        isAvailable: true,
      });

      await expect(
        service.create('student-uuid-1', {
          listingId: 'listing-uuid-1',
          startDate: '2026-10-15T00:00:00.000Z',
          endDate: '2026-10-10T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('accept (Happy Path - Step 2)', () => {
    it('should transition PENDING -> ACCEPTED, generate Razorpay order, and notify student', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        listingId: 'listing-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.PENDING,
        listing: { ownerId: 'owner-uuid-1', title: 'PG Room' },
        student: { email: 'student@example.com' },
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.ACCEPTED,
      });

      const res = await service.accept('booking-uuid-1', 'owner-uuid-1');

      expect(res.booking.status).toBe(BookingStatus.ACCEPTED);
      expect(paymentsMock.createOrder).toHaveBeenCalledWith(
        'booking-uuid-1',
        'student-uuid-1',
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.accepted',
        expect.objectContaining({ bookingId: 'booking-uuid-1' }),
      );
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'BOOKING_ACCEPTED',
          recipient: 'student@example.com',
        }),
      );
    });

    it('should throw ForbiddenException if user is not the listing owner', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.PENDING,
        listing: { ownerId: 'owner-uuid-1' },
      });

      await expect(
        service.accept('booking-uuid-1', 'intruder-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reject (Rejection Path)', () => {
    it('should transition PENDING -> REJECTED, emit event, and notify student with reason', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        listingId: 'listing-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.PENDING,
        listing: { ownerId: 'owner-uuid-1', title: 'PG Room' },
        student: { email: 'student@example.com' },
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.REJECTED,
      });

      const res = await service.reject('booking-uuid-1', 'owner-uuid-1', 'Dates conflict');

      expect(res.status).toBe(BookingStatus.REJECTED);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.rejected',
        expect.objectContaining({
          bookingId: 'booking-uuid-1',
          reason: 'Dates conflict',
        }),
      );
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'BOOKING_REJECTED',
          recipient: 'student@example.com',
          data: expect.objectContaining({ reason: 'Dates conflict' }),
        }),
      );
    });
  });

  describe('cancel & refund (Refund Path)', () => {
    it('should cancel a PAID booking and trigger Razorpay refund', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        listingId: 'listing-uuid-1',
        status: BookingStatus.PAID,
        listing: { ownerId: 'owner-uuid-1' },
        student: { email: 'student@example.com' },
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.CANCELLED,
      });

      const res = await service.cancel(
        'booking-uuid-1',
        'student-uuid-1',
        Role.STUDENT,
        'Personal emergency',
      );

      expect(res.booking.status).toBe(BookingStatus.CANCELLED);
      expect(res.refundIssued).toBe(true);
      expect(paymentsMock.refundPayment).toHaveBeenCalledWith(
        'booking-uuid-1',
        'Personal emergency',
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        'booking.cancelled',
        expect.objectContaining({
          bookingId: 'booking-uuid-1',
          refundIssued: true,
        }),
      );
    });
  });

  describe('checkIn and complete', () => {
    it('should allow checkIn for PAID booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.PAID,
        listing: { ownerId: 'owner-uuid-1' },
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.CHECKED_IN,
      });

      const res = await service.checkIn('booking-uuid-1', 'student-uuid-1', Role.STUDENT);
      expect(res.status).toBe(BookingStatus.CHECKED_IN);
    });

    it('should complete stay for CHECKED_IN booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.CHECKED_IN,
        listing: { ownerId: 'owner-uuid-1' },
      });

      prismaMock.booking.update.mockResolvedValue({
        id: 'booking-uuid-1',
        status: BookingStatus.COMPLETED,
      });

      const res = await service.complete('booking-uuid-1', 'student-uuid-1', Role.STUDENT);
      expect(res.status).toBe(BookingStatus.COMPLETED);
    });
  });
});
