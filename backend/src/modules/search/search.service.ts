import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';

export interface SearchListingDocument {
  id: string;
  title: string;
  description: string;
  city: string;
  pricePerMonth: number;
  securityDeposit: number;
  roomType: string;
  amenities: string[];
  status: string;
  isAvailable: boolean;
  location: [number, number]; // [lat, lng] for Typesense geopoint
  ownerId: string;
  createdAt: number;
}

export interface SearchQueryParams {
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  verifiedOnly?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: Client | null = null;
  private isConnected = false;
  private readonly collectionName = 'listings';

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('TYPESENSE_HOST', 'localhost');
    const port = this.configService.get<number>('TYPESENSE_PORT', 8108);
    const protocol = this.configService.get<string>('TYPESENSE_PROTOCOL', 'http');
    const apiKey = this.configService.get<string>('TYPESENSE_API_KEY', 'xyz123');

    try {
      this.client = new Client({
        nodes: [{ host, port, protocol }],
        apiKey,
        connectionTimeoutSeconds: 2,
      });

      await this.ensureCollection();
      this.isConnected = true;
      this.logger.log(`Typesense search client connected successfully to ${protocol}://${host}:${port}`);
    } catch (error) {
      this.logger.warn(
        `Typesense not available at ${host}:${port} (${(error as Error).message}). Search will use PostgreSQL fallback.`,
      );
      this.isConnected = false;
    }
  }

  private async ensureCollection(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.collections(this.collectionName).retrieve();
    } catch {
      // Create collection if it doesn't exist
      await this.client.collections().create({
        name: this.collectionName,
        fields: [
          { name: 'id', type: 'string' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'city', type: 'string', facet: true },
          { name: 'pricePerMonth', type: 'int32', facet: true },
          { name: 'securityDeposit', type: 'int32' },
          { name: 'roomType', type: 'string', facet: true },
          { name: 'amenities', type: 'string[]', facet: true },
          { name: 'status', type: 'string', facet: true },
          { name: 'isAvailable', type: 'bool', facet: true },
          { name: 'location', type: 'geopoint' },
          { name: 'ownerId', type: 'string' },
          { name: 'createdAt', type: 'int64' },
        ],
        default_sorting_field: 'createdAt',
      });
      this.logger.log(`Created Typesense collection: ${this.collectionName}`);
    }
  }

  async syncListing(doc: SearchListingDocument): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client
        .collections(this.collectionName)
        .documents()
        .upsert(doc);
      this.logger.log(`Synced listing ${doc.id} to Typesense index`);
    } catch (error) {
      this.logger.warn(`Failed to sync listing ${doc.id} to Typesense: ${(error as Error).message}`);
    }
  }

  async removeListing(listingId: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client
        .collections(this.collectionName)
        .documents(listingId)
        .delete();
      this.logger.log(`Removed listing ${listingId} from Typesense index`);
    } catch (error) {
      this.logger.warn(`Failed to remove listing ${listingId} from Typesense: ${(error as Error).message}`);
    }
  }

  async searchListings(params: SearchQueryParams): Promise<{ ids: string[]; total: number } | null> {
    if (!this.client || !this.isConnected) {
      return null; // Signals controller/service to use DB fallback
    }

    try {
      const filters: string[] = ['isAvailable:=true'];

      if (params.verifiedOnly) {
        filters.push('status:=VERIFIED');
      } else {
        filters.push('status:[PENDING, VERIFIED]');
      }

      if (params.city) {
        filters.push(`city:=${params.city}`);
      }

      if (params.roomType) {
        filters.push(`roomType:=${params.roomType}`);
      }

      if (params.minPrice !== undefined) {
        filters.push(`pricePerMonth:>=${params.minPrice}`);
      }

      if (params.maxPrice !== undefined) {
        filters.push(`pricePerMonth:<=${params.maxPrice}`);
      }

      // Geo-radius filter: location:(lat, lng, radius km)
      if (params.lat !== undefined && params.lng !== undefined && params.radiusKm) {
        filters.push(`location:(${params.lat}, ${params.lng}, ${params.radiusKm} km)`);
      }

      let sortBy = 'createdAt:desc';
      if (params.lat !== undefined && params.lng !== undefined) {
        sortBy = `location(${params.lat}, ${params.lng}):asc`;
      }

      const searchResult = await this.client
        .collections(this.collectionName)
        .documents()
        .search({
          q: params.q || '*',
          query_by: 'title,description,city,amenities',
          filter_by: filters.join(' && '),
          sort_by: sortBy,
          page: params.page || 1,
          per_page: params.limit || 20,
        });

      const ids = (searchResult.hits || [])
        .map((hit) => (hit.document as SearchListingDocument).id)
        .filter(Boolean);

      return {
        ids,
        total: searchResult.found || 0,
      };
    } catch (error) {
      this.logger.warn(`Typesense search error: ${(error as Error).message}`);
      return null;
    }
  }

  getStatus() {
    return {
      module: 'search',
      provider: 'Typesense',
      connected: this.isConnected,
    };
  }
}
