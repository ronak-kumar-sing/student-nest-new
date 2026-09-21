import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReviewsService } from './reviews.service.js';
import { BookingStatus } from '@prisma/client';
import { ForbiddenException, ConflictException } from '@nestjs/common';

describe('ReviewsService (Unit)', () => {
  let service: ReviewsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      booking: {
        findUnique: vi.fn(),
      },
      review: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new ReviewsService(prismaMock);
  });

  describe('create', () => {
    it('should allow student to submit a review for a COMPLETED booking', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        listingId: 'listing-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.COMPLETED,
      });

      prismaMock.review.findUnique.mockResolvedValue(null);

      prismaMock.review.create.mockResolvedValue({
        id: 'review-uuid-1',
        listingId: 'listing-uuid-1',
        studentId: 'student-uuid-1',
        bookingId: 'booking-uuid-1',
        rating: 5,
        comment: 'Fantastic stay, clean room and fast WiFi!',
        createdAt: new Date(),
      });

      const res = await service.create('student-uuid-1', {
        bookingId: 'booking-uuid-1',
        rating: 5,
        comment: 'Fantastic stay, clean room and fast WiFi!',
      });

      expect(res.id).toBe('review-uuid-1');
      expect(res.rating).toBe(5);
      expect(prismaMock.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            listingId: 'listing-uuid-1',
            bookingId: 'booking-uuid-1',
            rating: 5,
          }),
        }),
      );
    });

    it('should reject review with ForbiddenException if booking is NOT COMPLETED (e.g. still PAID)', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-2',
        studentId: 'student-uuid-1',
        status: BookingStatus.PAID, // Stay not completed yet
      });

      await expect(
        service.create('student-uuid-1', {
          bookingId: 'booking-uuid-2',
          rating: 4,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject review with ForbiddenException if caller is not the student who stayed', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-3',
        studentId: 'student-uuid-1',
        status: BookingStatus.COMPLETED,
      });

      await expect(
        service.create('different-student', {
          bookingId: 'booking-uuid-3',
          rating: 5,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject duplicate review with ConflictException if already reviewed', async () => {
      prismaMock.booking.findUnique.mockResolvedValue({
        id: 'booking-uuid-1',
        studentId: 'student-uuid-1',
        status: BookingStatus.COMPLETED,
      });

      prismaMock.review.findUnique.mockResolvedValue({
        id: 'existing-review-id',
      });

      await expect(
        service.create('student-uuid-1', {
          bookingId: 'booking-uuid-1',
          rating: 5,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByListing', () => {
    it('should return reviews, count, and correctly computed average rating', async () => {
      prismaMock.review.findMany.mockResolvedValue([
        { id: '1', rating: 5, comment: 'Great', student: {} },
        { id: '2', rating: 4, comment: 'Good', student: {} },
      ]);

      const res = await service.findByListing('listing-uuid-1');

      expect(res.count).toBe(2);
      expect(res.averageRating).toBe(4.5);
      expect(res.reviews).toHaveLength(2);
    });
  });
});
