import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { JobsService } from '../jobs/jobs.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { BookingStatus, Role } from '@prisma/client';
import { BookingStateMachine } from './state-machine/booking-state-machine.js';
import {
  BookingCreatedEvent,
  BookingAcceptedEvent,
  BookingRejectedEvent,
  BookingCancelledEvent,
  BookingCheckedInEvent,
  BookingCompletedEvent,
} from './events/booking.events.js';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
    private readonly jobsService: JobsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(studentId: string, dto: CreateBookingDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${dto.listingId} not found`);
    }

    if (!listing.isAvailable) {
      throw new BadRequestException('This property listing is currently not available for booking');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid start or end date');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Calculate stay duration in months (minimum 1 month)
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    const totalAmount = listing.pricePerMonth * months + listing.securityDeposit;

    const booking = await this.prisma.booking.create({
      data: {
        listingId: dto.listingId,
        studentId,
        startDate,
        endDate,
        totalAmount,
        status: BookingStatus.PENDING,
      },
      include: {
        listing: true,
      },
    });

    // Emit domain event
    this.eventEmitter.emit(
      'booking.created',
      new BookingCreatedEvent(booking.id, studentId, listing.id, totalAmount),
    );

    // Schedule BullMQ booking auto-expiry job (auto-cancel if unpaid after 24h)
    await this.jobsService.scheduleBookingExpiry(booking.id, 24 * 60 * 60 * 1000);

    // Notify listing owner
    await this.notificationsService.send({
      recipient: listing.owner.email,
      type: 'BOOKING_REQUESTED',
      data: {
        bookingId: booking.id,
        listingTitle: listing.title,
        totalAmount,
      },
    });

    return booking;
  }

  async findAll(userId: string, role: Role) {
    const where: any = {};

    if (role === Role.STUDENT) {
      where.studentId = userId;
    } else if (role === Role.OWNER) {
      where.listing = { ownerId: userId };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            pricePerMonth: true,
            photoUrls: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true, phone: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                ownerProfile: { select: { fullName: true, phone: true } },
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            studentProfile: { select: { fullName: true, phone: true } },
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (
      role !== Role.ADMIN &&
      booking.studentId !== userId &&
      booking.listing.ownerId !== userId
    ) {
      throw new ForbiddenException('You do not have permission to view this booking');
    }

    return booking;
  }

  async accept(id: string, ownerId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
        student: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.listing.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this listing');
    }

    BookingStateMachine.validateTransition(booking.status, BookingStatus.ACCEPTED);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.ACCEPTED },
    });

    // Create Razorpay payment order for deposit
    const paymentOrder = await this.paymentsService.createOrder(booking.id, booking.studentId);

    // Emit domain event
    this.eventEmitter.emit(
      'booking.accepted',
      new BookingAcceptedEvent(booking.id, booking.studentId, booking.listingId),
    );

    // Notify student that booking was accepted and payment order is ready
    await this.notificationsService.send({
      recipient: booking.student.email,
      type: 'BOOKING_ACCEPTED',
      data: {
        bookingId: booking.id,
        listingTitle: booking.listing.title,
        paymentOrder,
      },
    });

    return {
      booking: updated,
      paymentOrder,
    };
  }

  async reject(id: string, ownerId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        listing: true,
        student: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (booking.listing.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this listing');
    }

    BookingStateMachine.validateTransition(booking.status, BookingStatus.REJECTED);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.REJECTED },
    });

    this.eventEmitter.emit(
      'booking.rejected',
      new BookingRejectedEvent(booking.id, booking.studentId, booking.listingId, reason),
    );

    await this.notificationsService.send({
      recipient: booking.student.email,
      type: 'BOOKING_REJECTED',
      data: {
        bookingId: booking.id,
        listingTitle: booking.listing.title,
        reason,
      },
    });

    return updated;
  }

  async cancel(id: string, userId: string, role: Role, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true, student: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (
      role !== Role.ADMIN &&
      booking.studentId !== userId &&
      booking.listing.ownerId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to cancel this booking');
    }

    BookingStateMachine.validateTransition(booking.status, BookingStatus.CANCELLED);

    let refundResult = null;
    if (booking.status === BookingStatus.PAID) {
      refundResult = await this.paymentsService.refundPayment(booking.id, reason);
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    this.eventEmitter.emit(
      'booking.cancelled',
      new BookingCancelledEvent(
        booking.id,
        booking.studentId,
        booking.listingId,
        reason,
        !!refundResult,
      ),
    );

    return {
      booking: updated,
      refundIssued: !!refundResult,
    };
  }

  async checkIn(id: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (
      role !== Role.ADMIN &&
      booking.studentId !== userId &&
      booking.listing.ownerId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to check in for this booking');
    }

    BookingStateMachine.validateTransition(booking.status, BookingStatus.CHECKED_IN);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CHECKED_IN },
    });

    this.eventEmitter.emit(
      'booking.checked_in',
      new BookingCheckedInEvent(booking.id, booking.studentId, booking.listingId),
    );

    return updated;
  }

  async complete(id: string, userId: string, role: Role) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (
      role !== Role.ADMIN &&
      booking.studentId !== userId &&
      booking.listing.ownerId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to complete this booking');
    }

    BookingStateMachine.validateTransition(booking.status, BookingStatus.COMPLETED);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.COMPLETED },
    });

    this.eventEmitter.emit(
      'booking.completed',
      new BookingCompletedEvent(booking.id, booking.studentId, booking.listingId),
    );

    return updated;
  }
}
