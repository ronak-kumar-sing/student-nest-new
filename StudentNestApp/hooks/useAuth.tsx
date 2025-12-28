import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, userApi } from '../lib/api';
import { tokenStorage, userStorage, secureStorage } from '../lib/storage';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; phone: string; password: string; role: 'student' | 'owner' }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [accessToken, refreshToken, user] = await Promise.all([
        tokenStorage.getAccessToken(),
        tokenStorage.getRefreshToken(),
        userStorage.getUser(),
      ]);

      if (accessToken && user) {
        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        // Refresh user data in background
        try {
          const response = await userApi.getProfile();
          if (response.success && response.data) {
            await userStorage.setUser(response.data);
            setState(prev => ({ ...prev, user: response.data! }));
          }
        } catch (error) {
          // Token might be expired, will be handled by interceptor
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        await Promise.all([
          tokenStorage.setTokens(accessToken, refreshToken),
          userStorage.setUser(user),
        ]);

        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  }, []);

  const loginWithPhone = useCallback(async (phone: string, password: string) => {
    try {
      const response = await authApi.loginWithPhone(phone, password);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        await Promise.all([
          tokenStorage.setTokens(accessToken, refreshToken),
          userStorage.setUser(user),
        ]);

        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  }, []);

  const signup = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'student' | 'owner';
  }) => {
    try {
      const response = await authApi.signup(data);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        await Promise.all([
          tokenStorage.setTokens(accessToken, refreshToken),
          userStorage.setUser(user),
        ]);

        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Signup failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Signup failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with local logout even if API fails
    }

    await Promise.all([
      tokenStorage.clearTokens(),
      userStorage.clearUser(),
    ]);

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await userApi.getProfile();
      if (response.success && response.data) {
        await userStorage.setUser(response.data);
        setState(prev => ({ ...prev, user: response.data! }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithPhone,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
