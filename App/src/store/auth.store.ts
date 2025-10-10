import { create } from 'zustand';
import { api } from '@services/api';
import { secureStorage } from '@utils/secureStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner';
  profileImage?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'owner';
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,

  initialize: async () => {
    try {
      const [token, userData] = await Promise.all([
        secureStorage.getAuthToken(),
        secureStorage.getUserData(),
      ]);

      if (token && userData) {
        set({ isAuthenticated: true, token, user: userData, isLoading: false });
      } else {
        set({ isAuthenticated: false, token: null, user: null, isLoading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, token: null, user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const { token, user } = response.data;

      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setUserData(user),
      ]);

      set({ isAuthenticated: true, token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true });
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const { token, user } = response.data;

      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setUserData(user),
      ]);

      set({ isAuthenticated: true, token, user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await secureStorage.clearAuth();
      set({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      });
    }
  },

  updateUser: async (userData) => {
    try {
      set({ isLoading: true });
      const response = await api.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const updatedUser = { ...get().user, ...response.data.user };
      await secureStorage.setUserData(updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));