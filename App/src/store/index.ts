import { create } from 'zustand';
import { User, AuthResponse, Property, Booking, Notification } from '@/types';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
export { useNavigationStore } from './navigation.store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface PropertyState {
  properties: Property[];
  favorites: string[];
  recentSearches: string[];
  filters: any;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchProperties: (filters?: any) => Promise<void>;
  toggleFavorite: (propertyId: string) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  setFilters: (filters: any) => void;
}

interface BookingState {
  bookings: Booking[];
  activeBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<void>;
  updateBooking: (bookingId: string, data: Partial<Booking>) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
}

// Create stores with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // API call would go here
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
          });
          const data: AuthResponse = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // API call would go here
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
          });
          const data: AuthResponse = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Registration failed', isLoading: false });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // API call would go here
          const response = await fetch('/api/user/update', {
            method: 'PUT',
            body: JSON.stringify(userData),
          });
          const updatedUser: User = await response.json();
          
          set({
            user: { ...get().user, ...updatedUser },
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Update failed', isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [],
      favorites: [],
      recentSearches: [],
      filters: {},
      isLoading: false,
      error: null,

      fetchProperties: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          // API call would go here
          const response = await fetch('/api/properties?' + new URLSearchParams(filters));
          const data: Property[] = await response.json();
          
          set({
            properties: data,
            isLoading: false,
          });
        } catch (error) {
          set({ error: 'Failed to fetch properties', isLoading: false });
        }
      },

      toggleFavorite: (propertyId) => {
        set((state) => ({
          favorites: state.favorites.includes(propertyId)
            ? state.favorites.filter(id => id !== propertyId)
            : [...state.favorites, propertyId],
        }));
      },

      addRecentSearch: (search) => {
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter(s => s !== search),
          ].slice(0, 10),
        }));
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      setFilters: (filters) => {
        set({ filters });
      },
    }),
    {
      name: 'property-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  activeBooking: null,
  isLoading: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      const response = await fetch('/api/bookings');
      const data: Booking[] = await response.json();
      
      set({
        bookings: data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to fetch bookings', isLoading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      const response = await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      const newBooking: Booking = await response.json();
      
      set((state) => ({
        bookings: [...state.bookings, newBooking],
        activeBooking: newBooking,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create booking', isLoading: false });
    }
  },

  updateBooking: async (bookingId, data) => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const updatedBooking: Booking = await response.json();
      
      set((state) => ({
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? updatedBooking : booking
        ),
        activeBooking: state.activeBooking?.id === bookingId
          ? updatedBooking
          : state.activeBooking,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update booking', isLoading: false });
    }
  },

  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      // API call would go here
      await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      
      set((state) => ({
        bookings: state.bookings.filter(booking => booking.id !== bookingId),
        activeBooking: state.activeBooking?.id === bookingId
          ? null
          : state.activeBooking,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to cancel booking', isLoading: false });
    }
  },
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      // API call would go here
      const response = await fetch('/api/notifications');
      const data: Notification[] = await response.json();
      
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.read).length,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      // API call would go here
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      }));
    } catch (error) {
      // Handle error
    }
  },

  markAllAsRead: async () => {
    try {
      // API call would go here
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      });
      
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      // Handle error
    }
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));