import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/config';

// Secure storage for sensitive data
export const secureStorage = {
  async setItem(key: string, value: string | null | undefined): Promise<void> {
    try {
      if (value === null || value === undefined) {
        console.warn('SecureStore: Attempted to store null/undefined value, skipping');
        return;
      }
      await SecureStore.setItemAsync(key, String(value));
    } catch (error) {
      console.error('SecureStore setItem error:', error);
      // Don't throw, just log - prevents app crashes
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },

  async clear(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await Promise.all(keys.map(key => this.removeItem(key)));
  },
};

// Token management
export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    return secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    return secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },
};

// User storage
export const userStorage = {
  async getUser(): Promise<any | null> {
    const userStr = await secureStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  async setUser(user: any): Promise<void> {
    return secureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    return secureStorage.removeItem(STORAGE_KEYS.USER);
  },
};
