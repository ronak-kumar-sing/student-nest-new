import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from './admin.service.js';

describe('AdminService (Unit)', () => {
  let service: AdminService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      listing: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      booking: {
        count: vi.fn(),
        findMany: vi.fn(),
      },
      user: {
        count: vi.fn(),
      },
      payment: {
        aggregate: vi.fn(),
      },
    };

    service = new AdminService(prismaMock);
  });

  describe('getDashboardSummary', () => {
    it('should calculate pending verifications, active bookings, and total GMV correctly', async () => {
      // Mock listing counts: 12 pending, 45 verified
      prismaMock.listing.count
        .mockResolvedValueOnce(12) // pending
        .mockResolvedValueOnce(45); // verified

      // Mock booking counts: 8 active, 30 total
      prismaMock.booking.count
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(30); // total

      // Mock user counts: 150 students, 25 owners
      prismaMock.user.count
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(25);

      // Mock GMV sum: ₹1,85,000
      prismaMock.payment.aggregate.mockResolvedValue({
        _sum: { amount: 185000 },
      });

      prismaMock.listing.findMany.mockResolvedValue([]);
      prismaMock.booking.findMany.mockResolvedValue([]);

      const res = await service.getDashboardSummary();

      expect(res.metrics.pendingVerifications).toBe(12);
      expect(res.metrics.verifiedListings).toBe(45);
      expect(res.metrics.activeBookings).toBe(8);
      expect(res.metrics.totalBookings).toBe(30);
      expect(res.metrics.totalStudents).toBe(150);
      expect(res.metrics.totalOwners).toBe(25);
      expect(res.metrics.totalGMV).toBe(185000);
      expect(res.timestamp).toBeDefined();
    });
  });
});
