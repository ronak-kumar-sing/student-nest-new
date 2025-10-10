import { create } from 'zustand';
import { api } from '@/services/api';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: string[];
  images: string[];
  ownerId: string;
  availability: {
    status: 'available' | 'occupied' | 'pending';
    availableFrom: string;
    minimumStay?: string;
  };
  propertyType: 'apartment' | 'house' | 'room' | 'hostel';
  amenities: string[];
  rules: string[];
  verified: boolean;
  rating?: number;
  reviews?: {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface PropertyFilters {
  city?: string;
  maxPrice?: number;
  propertyType?: Property['propertyType'];
  amenities?: string[];
  availableFrom?: string;
  verified?: boolean;
}

interface PropertyState {
  properties: Property[];
  favorites: string[];
  selectedProperty: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  totalPages: number;
  // Actions
  fetchProperties: (filters?: PropertyFilters) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  setFilters: (filters: PropertyFilters) => void;
  resetFilters: () => void;
  loadMore: () => Promise<void>;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  favorites: [],
  selectedProperty: null,
  filters: {},
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,

  fetchProperties: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const queryParams = new URLSearchParams();
      
      if (filters?.city) queryParams.append('city', filters.city);
      if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters?.propertyType) queryParams.append('type', filters.propertyType);
      if (filters?.availableFrom) queryParams.append('availableFrom', filters.availableFrom);
      if (filters?.verified) queryParams.append('verified', 'true');
      if (filters?.amenities?.length) {
        filters.amenities.forEach(amenity => 
          queryParams.append('amenities', amenity)
        );
      }

      queryParams.append('page', '1');
      const query = queryParams.toString();
      
      const response = await api.request<{
        properties: Property[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/properties?${query}`);

      if (!response.success) {
        throw new Error(response.error);
      }

      set({
        properties: response.data.properties,
        page: response.data.page,
        totalPages: response.data.totalPages,
        filters: filters || {},
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch properties',
        isLoading: false 
      });
    }
  },

  fetchPropertyById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.request<Property>(`/properties/${id}`);

      if (!response.success) {
        throw new Error(response.error);
      }

      set({ selectedProperty: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch property details',
        isLoading: false,
      });
    }
  },

  toggleFavorite: async (propertyId: string) => {
    try {
      const favorites = get().favorites;
      const isFavorite = favorites.includes(propertyId);
      
      const response = await api.request(`/properties/${propertyId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      set({
        favorites: isFavorite
          ? favorites.filter(id => id !== propertyId)
          : [...favorites, propertyId],
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update favorites' });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchProperties(filters);
  },

  resetFilters: () => {
    set({ filters: {} });
    get().fetchProperties();
  },

  loadMore: async () => {
    const { page, totalPages, properties, filters } = get();
    if (page >= totalPages) return;

    try {
      set({ isLoading: true, error: null });
      const nextPage = page + 1;
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
      
      queryParams.append('page', nextPage.toString());
      const query = queryParams.toString();

      const response = await api.request<{
        properties: Property[];
        page: number;
        totalPages: number;
      }>(`/properties?${query}`);

      if (!response.success) {
        throw new Error(response.error);
      }

      set({
        properties: [...properties, ...response.data.properties],
        page: response.data.page,
        totalPages: response.data.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load more properties',
        isLoading: false,
      });
    }
  },
}));