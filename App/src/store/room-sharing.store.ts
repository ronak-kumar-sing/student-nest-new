import { create } from 'zustand';
import { api } from '@/services/api';
import { RoomShare, RoomSharingFilters, Application } from '@/types/roomSharing';

interface RoomSharingState {
  shares: RoomShare[];
  applications: Application[];
  selectedShare: RoomShare | null;
  filters: RoomSharingFilters;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  totalPages: number;
  // Stats
  stats: {
    totalShares: number;
    activeShares: number;
    myApplications: number;
    matchedApplications: number;
  };
  // Actions
  fetchRoomShares: (filters?: RoomSharingFilters) => Promise<void>;
  fetchShareById: (id: string) => Promise<void>;
  createShare: (propertyId: string, data: any) => Promise<void>;
  applyToShare: (shareId: string, message: string, moveInDate: string) => Promise<void>;
  fetchApplications: () => Promise<void>;
  respondToApplication: (applicationId: string, action: 'accept' | 'reject', message?: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: RoomSharingFilters) => void;
  resetFilters: () => void;
  loadMore: () => Promise<void>;
}

export const useRoomSharingStore = create<RoomSharingState>((set, get) => ({
  shares: [],
  applications: [],
  selectedShare: null,
  filters: {},
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  stats: {
    totalShares: 0,
    activeShares: 0,
    myApplications: 0,
    matchedApplications: 0,
  },

  fetchRoomShares: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getRoomShares(filters);

      set({
        shares: response.shares,
        page: response.page,
        totalPages: response.totalPages,
        filters: filters || {},
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch room shares',
        isLoading: false 
      });
    }
  },

  fetchShareById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const share = await api.getRoomShareById(id);
      set({ selectedShare: share, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch room share details',
        isLoading: false,
      });
    }
  },

  createShare: async (propertyId: string, data) => {
    try {
      set({ isLoading: true, error: null });
      await api.createRoomShare(propertyId, data);
      await get().fetchRoomShares(get().filters);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create room share',
        isLoading: false,
      });
      throw error;
    }
  },

  applyToShare: async (shareId: string, message: string, moveInDate: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.applyToRoomShare(shareId, message, moveInDate);
      await get().fetchApplications();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to apply to room share',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      const applications = await api.getMyRoomSharingApplications();
      set({ applications, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch applications',
        isLoading: false,
      });
    }
  },

  respondToApplication: async (applicationId: string, action: 'accept' | 'reject', message?: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.respondToApplication(applicationId, action, message);
      await get().fetchApplications();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to respond to application',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const stats = await api.getRoomSharingStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch statistics',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchRoomShares(filters);
  },

  resetFilters: () => {
    set({ filters: {} });
    get().fetchRoomShares();
  },

  loadMore: async () => {
    const { page, totalPages, shares, filters } = get();
    if (page >= totalPages) return;

    try {
      set({ isLoading: true, error: null });
      const response = await api.getRoomShares({
        ...filters,
        page: page + 1,
      });

      set({
        shares: [...shares, ...response.shares],
        page: response.page,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load more shares',
        isLoading: false,
      });
    }
  },
}));