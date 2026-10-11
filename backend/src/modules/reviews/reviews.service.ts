import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { BookingStatus, Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(studentId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { listing: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${dto.bookingId} not found`);
    }

    // Must be the student who stayed
    if (booking.studentId !== studentId) {
      throw new ForbiddenException('You can only review a stay that you booked personally');
    }

    // Enforce business rule: must be COMPLETED
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new ForbiddenException(
        `Reviews can only be submitted after a completed stay. Current booking status is '${booking.status}'.`,
      );
    }

    // Check if review already exists for this booking
    const existing = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existing) {
      throw new ConflictException('You have already submitted a review for this booking');
    }

    const review = await this.prisma.review.create({
      data: {
        listingId: booking.listingId,
        studentId,
        bookingId: booking.id,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true } },
          },
        },
      },
    });

    return review;
  }

  async findByListing(listingId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      include: {
        student: {
          select: {
            id: true,
            studentProfile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const count = reviews.length;
    const averageRating =
      count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : 0;

    return {
      reviews,
      count,
      averageRating,
    };
  }

  async remove(reviewId: string, userId: string, role: Role) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    if (role !== Role.ADMIN && review.studentId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this review');
    }

    await this.prisma.review.delete({ where: { id: reviewId } });

    return { message: 'Review deleted successfully' };
  }
}
