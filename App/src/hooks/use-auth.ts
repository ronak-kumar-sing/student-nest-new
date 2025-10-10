import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { secureStorage } from '@/utils/secureStorage';

interface AuthState {
  isLoading: boolean;
  isSignedIn: boolean;
  userData: any | null;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'owner';
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isSignedIn: false,
    userData: null,
  });

  // Initialize auth state
  const initialize = useCallback(async () => {
    try {
      const [token, userData] = await Promise.all([
        secureStorage.getAuthToken(),
        secureStorage.getUserData(),
      ]);

      setState({
        isLoading: false,
        isSignedIn: !!token,
        userData,
      });
    } catch (error) {
      setState({
        isLoading: false,
        isSignedIn: false,
        userData: null,
      });
    }
  }, []);

  // Login
  const login = useCallback(async (data: LoginData) => {
    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const { token, refreshToken, user } = response.data;

      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setRefreshToken(refreshToken),
        secureStorage.setUserData(user),
      ]);

      setState({
        isLoading: false,
        isSignedIn: true,
        userData: user,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }, []);

  // Register
  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      const { token, refreshToken, user } = response.data;

      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setRefreshToken(refreshToken),
        secureStorage.setUserData(user),
      ]);

      setState({
        isLoading: false,
        isSignedIn: true,
        userData: user,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.request('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await secureStorage.clearAuth();
      setState({
        isLoading: false,
        isSignedIn: false,
        userData: null,
      });
    }
  }, []);

  return {
    ...state,
    initialize,
    login,
    register,
    logout,
  };
}