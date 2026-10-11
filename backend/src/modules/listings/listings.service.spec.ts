import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ListingsService } from './listings.service.js';
import { ListingStatus, RoomType, Role } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ListingsService (Unit)', () => {
  let service: ListingsService;
  let prismaMock: any;
  let searchMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      user: {
        findUnique: vi.fn(),
      },
      listing: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    };

    searchMock = {
      syncListing: vi.fn().mockResolvedValue(undefined),
      removeListing: vi.fn().mockResolvedValue(undefined),
      searchListings: vi.fn().mockResolvedValue(null), // Default fallback to DB
    };

    notificationsMock = {
      send: vi.fn().mockResolvedValue({ delivered: true }),
    };

    service = new ListingsService(prismaMock, searchMock, notificationsMock);
  });

  describe('create', () => {
    it('should create listing with PENDING status and sync to search index', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'owner-uuid-1',
        role: Role.OWNER,
      });

      const mockListing = {
        id: 'listing-uuid-1',
        ownerId: 'owner-uuid-1',
        title: 'Spacious PG near Pune University',
        description: 'Single occupancy with study desk and fast WiFi',
        address: 'FC Road, Shivaji Nagar',
        city: 'Pune',
        latitude: 18.5204,
        longitude: 73.8567,
        pricePerMonth: 8500,
        securityDeposit: 15000,
        roomType: RoomType.SINGLE,
        amenities: ['WIFI', 'AC'],
        photoUrls: ['https://r2.studentnest.com/photo1.jpg'],
        isAvailable: true,
        status: ListingStatus.PENDING,
        createdAt: new Date(),
      };

      prismaMock.listing.create.mockResolvedValue(mockListing);

      const res = await service.create('owner-uuid-1', {
        title: mockListing.title,
        description: mockListing.description,
        address: mockListing.address,
        city: mockListing.city,
        latitude: mockListing.latitude,
        longitude: mockListing.longitude,
        pricePerMonth: mockListing.pricePerMonth,
        securityDeposit: mockListing.securityDeposit,
        roomType: mockListing.roomType,
        amenities: mockListing.amenities,
        photoUrls: mockListing.photoUrls,
      });

      expect(res.id).toBe('listing-uuid-1');
      expect(res.status).toBe(ListingStatus.PENDING);
      expect(searchMock.syncListing).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'listing-uuid-1',
          city: 'Pune',
          pricePerMonth: 8500,
          location: [18.5204, 73.8567],
        }),
      );
    });
  });

  describe('update', () => {
    it('should allow owner to update their own listing', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        ownerId: 'owner-uuid-1',
      });

      prismaMock.listing.update.mockResolvedValue({
        id: 'listing-uuid-1',
        ownerId: 'owner-uuid-1',
        pricePerMonth: 9000,
        latitude: 18.5204,
        longitude: 73.8567,
        createdAt: new Date(),
      });

      const res = await service.update(
        'listing-uuid-1',
        'owner-uuid-1',
        Role.OWNER,
        { pricePerMonth: 9000 },
      );

      expect(res.pricePerMonth).toBe(9000);
      expect(searchMock.syncListing).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner or admin', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        ownerId: 'different-owner',
      });

      await expect(
        service.update('listing-uuid-1', 'intruder-user', Role.OWNER, {
          pricePerMonth: 9000,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete listing and remove from search index', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        ownerId: 'owner-uuid-1',
      });

      prismaMock.listing.delete.mockResolvedValue({ id: 'listing-uuid-1' });

      const res = await service.remove('listing-uuid-1', 'owner-uuid-1', Role.OWNER);

      expect(res.message).toContain('successfully');
      expect(prismaMock.listing.delete).toHaveBeenCalledWith({
        where: { id: 'listing-uuid-1' },
      });
      expect(searchMock.removeListing).toHaveBeenCalledWith('listing-uuid-1');
    });
  });

  describe('admin verification workflow', () => {
    it('should verify listing, sync to search index, and notify owner', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        title: 'PG Room',
        owner: { email: 'owner@example.com' },
      });

      prismaMock.listing.update.mockResolvedValue({
        id: 'listing-uuid-1',
        status: ListingStatus.VERIFIED,
        latitude: 18.52,
        longitude: 73.85,
        createdAt: new Date(),
      });

      const res = await service.verifyListing('listing-uuid-1');

      expect(res.status).toBe(ListingStatus.VERIFIED);
      expect(searchMock.syncListing).toHaveBeenCalled();
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VERIFICATION_APPROVED',
          recipient: 'owner@example.com',
        }),
      );
    });

    it('should reject listing with reason, remove from search index, and notify owner', async () => {
      prismaMock.listing.findUnique.mockResolvedValue({
        id: 'listing-uuid-1',
        title: 'PG Room',
        owner: { email: 'owner@example.com' },
      });

      prismaMock.listing.update.mockResolvedValue({
        id: 'listing-uuid-1',
        status: ListingStatus.REJECTED,
        rejectionReason: 'Blurry room photos',
      });

      const res = await service.rejectListing('listing-uuid-1', 'Blurry room photos');

      expect(res.status).toBe(ListingStatus.REJECTED);
      expect(searchMock.removeListing).toHaveBeenCalledWith('listing-uuid-1');
      expect(notificationsMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'VERIFICATION_REJECTED',
          recipient: 'owner@example.com',
          data: expect.objectContaining({ reason: 'Blurry room photos' }),
        }),
      );
    });
  });
});
