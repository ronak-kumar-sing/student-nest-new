import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SearchService } from '../search/search.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { UpdateListingDto } from './dto/update-listing.dto.js';
import { SearchListingsDto } from './dto/search-listings.dto.js';
import { ListingStatus, Role } from '@prisma/client';
import { FALLBACK_LISTINGS } from './fallback-listings.js';

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private mapToSearchDoc(listing: any) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      city: listing.city,
      pricePerMonth: listing.pricePerMonth,
      securityDeposit: listing.securityDeposit,
      roomType: listing.roomType,
      amenities: listing.amenities,
      status: listing.status,
      isAvailable: listing.isAvailable,
      location: [listing.latitude, listing.longitude] as [number, number],
      ownerId: listing.ownerId,
      createdAt: Math.floor(new Date(listing.createdAt).getTime() / 1000),
    };
  }

  async create(ownerId: string, dto: CreateListingDto) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      include: { ownerProfile: true },
    });

    if (!owner) {
      throw new NotFoundException('Owner account not found');
    }

    const listing = await this.prisma.listing.create({
      data: {
        ownerId,
        title: dto.title,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        pricePerMonth: dto.pricePerMonth,
        securityDeposit: dto.securityDeposit || 0,
        roomType: dto.roomType,
        amenities: dto.amenities || [],
        photoUrls: dto.photoUrls || [],
        isAvailable: dto.isAvailable ?? true,
        status: ListingStatus.PENDING,
      },
    });

    // Sync to search index
    await this.searchService.syncListing(this.mapToSearchDoc(listing));

    return listing;
  }

  async findAll(query: SearchListingsDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Try Typesense search first
    const typesenseResult = await this.searchService.searchListings({
      q: query.q,
      city: query.city,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      roomType: query.roomType,
      verifiedOnly: query.verifiedOnly,
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      page,
      limit,
    });

    if (typesenseResult && typesenseResult.ids.length > 0) {
      const listings = await this.prisma.listing.findMany({
        where: { id: { in: typesenseResult.ids } },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              ownerProfile: {
                select: {
                  fullName: true,
                  isPhoneVerified: true,
                  isAadhaarVerified: true,
                },
              },
            },
          },
        },
      });

      // Preserve Typesense ranking order
      const idMap = new Map(listings.map((l) => [l.id, l]));
      const ordered = typesenseResult.ids.map((id) => idMap.get(id)).filter(Boolean);

      return {
        listings: ordered,
        total: typesenseResult.total,
        page,
        limit,
        source: 'typesense',
      };
    }

    // Fallback: Database query via Prisma
    const where: any = {
      isAvailable: true,
      status: query.verifiedOnly
        ? ListingStatus.VERIFIED
        : { in: [ListingStatus.PENDING, ListingStatus.VERIFIED] },
    };

    if (query.city) {
      where.city = { equals: query.city, mode: 'insensitive' };
    }

    if (query.roomType) {
      where.roomType = query.roomType;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerMonth = {};
      if (query.minPrice !== undefined) where.pricePerMonth.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.pricePerMonth.lte = query.maxPrice;
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { address: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    try {
      const [listings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                ownerProfile: {
                  select: {
                    fullName: true,
                    isPhoneVerified: true,
                    isAadhaarVerified: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.listing.count({ where }),
      ]);

      return {
        listings,
        total,
        page,
        limit,
        source: 'database',
      };
    } catch (err: any) {
      this.logger.warn(`Database unreachable (${err.message}). Serving StudentNest in-memory curated listings.`);
      let filtered = [...FALLBACK_LISTINGS];
      if (query.city) {
        filtered = filtered.filter((l) => l.city.toLowerCase() === query.city!.toLowerCase());
      }
      if (query.minPrice !== undefined) {
        filtered = filtered.filter((l) => l.pricePerMonth >= query.minPrice!);
      }
      if (query.maxPrice !== undefined) {
        filtered = filtered.filter((l) => l.pricePerMonth <= query.maxPrice!);
      }
      if (query.q) {
        const qLow = query.q.toLowerCase();
        filtered = filtered.filter(
          (l) => l.title.toLowerCase().includes(qLow) || l.description.toLowerCase().includes(qLow),
        );
      }

      return {
        listings: filtered.slice(skip, skip + limit),
        total: filtered.length,
        page,
        limit,
        source: 'in-memory-fallback',
      };
    }
  }

  async findOne(id: string) {
    try {
      const listing = await this.prisma.listing.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              ownerProfile: {
                select: {
                  fullName: true,
                  phone: true,
                  isPhoneVerified: true,
                  isAadhaarVerified: true,
                },
              },
            },
          },
          reviews: {
            include: {
              student: {
                select: {
                  id: true,
                  studentProfile: { select: { fullName: true } },
                },
              },
            },
          },
        },
      });

      if (listing) {
        return listing;
      }
    } catch (err: any) {
      this.logger.warn(`Database unreachable on findOne (${err.message}). Checking in-memory fallback.`);
    }

    const fallback = FALLBACK_LISTINGS.find((l) => l.id === id);
    if (fallback) {
      return fallback;
    }

    throw new NotFoundException(`Listing with ID ${id} not found`);
  }

  async findMyListings(ownerId: string) {
    return this.prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, userRole: Role, dto: UpdateListingDto) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    if (userRole !== Role.ADMIN && listing.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to modify this listing');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.address && { address: dto.address }),
        ...(dto.city && { city: dto.city }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.pricePerMonth !== undefined && { pricePerMonth: dto.pricePerMonth }),
        ...(dto.securityDeposit !== undefined && { securityDeposit: dto.securityDeposit }),
        ...(dto.roomType && { roomType: dto.roomType }),
        ...(dto.amenities && { amenities: dto.amenities }),
        ...(dto.photoUrls && { photoUrls: dto.photoUrls }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
      },
    });

    // Update search index
    await this.searchService.syncListing(this.mapToSearchDoc(updated));

    return updated;
  }

  async remove(id: string, userId: string, userRole: Role) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    if (userRole !== Role.ADMIN && listing.ownerId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this listing');
    }

    await this.prisma.listing.delete({ where: { id } });

    // Remove from search index
    await this.searchService.removeListing(id);

    return { message: 'Listing deleted successfully' };
  }

  // --- Admin Verification Workflow ---

  async verifyListing(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.VERIFIED,
        rejectionReason: null,
      },
    });

    // Sync verified state to search index
    await this.searchService.syncListing(this.mapToSearchDoc(updated));

    // Notify owner
    await this.notificationsService.send({
      recipient: listing.owner.email,
      type: 'VERIFICATION_APPROVED',
      data: {
        listingId: listing.id,
        title: listing.title,
      },
    });

    return updated;
  }

  async rejectListing(id: string, reason: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        status: ListingStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    // Remove from active search index
    await this.searchService.removeListing(id);

    // Notify owner
    await this.notificationsService.send({
      recipient: listing.owner.email,
      type: 'VERIFICATION_REJECTED',
      data: {
        listingId: listing.id,
        title: listing.title,
        reason,
      },
    });

    return updated;
  }
}
