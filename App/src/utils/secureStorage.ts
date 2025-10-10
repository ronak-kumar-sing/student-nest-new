import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

// Use SecureStore on native platforms and AsyncStorage on web
const storage = Platform.select({
  web: {
    async setItem(key: string, value: string) {
      return AsyncStorage.setItem(key, value);
    },
    async getItem(key: string) {
      return AsyncStorage.getItem(key);
    },
    async removeItem(key: string) {
      return AsyncStorage.removeItem(key);
    },
  },
  default: {
    async setItem(key: string, value: string) {
      return SecureStore.setItemAsync(key, value);
    },
    async getItem(key: string) {
      return SecureStore.getItemAsync(key);
    },
    async removeItem(key: string) {
      return SecureStore.deleteItemAsync(key);
    },
  },
});

export const secureStorage = {
  // Auth token methods
  async setAuthToken(token: string) {
    await storage.setItem(KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken() {
    return storage.getItem(KEYS.AUTH_TOKEN);
  },

  // Refresh token methods
  async setRefreshToken(token: string) {
    await storage.setItem(KEYS.REFRESH_TOKEN, token);
  },

  async getRefreshToken() {
    return storage.getItem(KEYS.REFRESH_TOKEN);
  },

  // User data methods
  async setUserData(userData: any) {
    await storage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
  },

  async getUserData() {
    const data = await storage.getItem(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  // Clear all auth data
  async clearAuth() {
    await Promise.all([
      storage.removeItem(KEYS.AUTH_TOKEN),
      storage.removeItem(KEYS.REFRESH_TOKEN),
      storage.removeItem(KEYS.USER_DATA),
    ]);
  },
};