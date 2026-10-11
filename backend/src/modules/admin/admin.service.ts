import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { BookingStatus, ListingStatus, PaymentStatus, Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [
      pendingVerifications,
      verifiedListings,
      activeBookings,
      totalBookings,
      totalStudents,
      totalOwners,
      gmvAggregate,
      recentPendingListings,
      recentBookings,
    ] = await Promise.all([
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
      this.prisma.listing.count({ where: { status: ListingStatus.VERIFIED } }),
      this.prisma.booking.count({
        where: {
          status: {
            in: [
              BookingStatus.CONFIRMED,
              BookingStatus.PAID,
              BookingStatus.CHECKED_IN,
            ],
          },
        },
      }),
      this.prisma.booking.count(),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.OWNER } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.RELEASED },
      }),
      this.prisma.listing.findMany({
        where: { status: ListingStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              ownerProfile: { select: { fullName: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true, city: true } },
          student: {
            select: {
              id: true,
              email: true,
              studentProfile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    const totalGMV = gmvAggregate._sum.amount || 0;

    return {
      metrics: {
        pendingVerifications,
        verifiedListings,
        activeBookings,
        totalBookings,
        totalStudents,
        totalOwners,
        totalGMV,
      },
      recentPendingListings,
      recentBookings,
      timestamp: new Date().toISOString(),
    };
  }

  async getPendingVerificationsQueue(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { status: ListingStatus.PENDING },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              ownerProfile: true,
            },
          },
        },
      }),
      this.prisma.listing.count({ where: { status: ListingStatus.PENDING } }),
    ]);

    return {
      listings,
      total,
      page,
      limit,
    };
  }

  getStatus() {
    return { module: 'admin', status: 'ready' };
  }
}
