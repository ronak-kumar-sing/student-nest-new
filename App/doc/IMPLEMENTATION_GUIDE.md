# 🚀 StudentNest Mobile - Detailed Implementation Guide

This document provides detailed code examples and implementation guidance for building the StudentNest mobile app.

---

## 📚 Table of Contents

1. [Theme System](#1-theme-system)
2. [API Client Setup](#2-api-client-setup)
3. [Authentication Flow](#3-authentication-flow)
4. [Navigation Setup](#4-navigation-setup)
5. [Cloudinary Integration](#5-cloudinary-integration)
6. [Component Examples](#6-component-examples)
7. [Screen Examples](#7-screen-examples)

---

## 1. Theme System

### 1.1 Theme Constants

Create `constants/theme.ts`:

```typescript
// constants/theme.ts
export const lightTheme = {
  colors: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#60A5FA',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    surfaceLight: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    border: '#E5E7EB',
    divider: '#D1D5DB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    // Specific colors
    cardBackground: '#FFFFFF',
    inputBackground: '#F9FAFB',
    shadowColor: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#60A5FA',
    primaryDark: '#3B82F6',
    primaryLight: '#93C5FD',
    secondary: '#A78BFA',
    background: '#111827',
    surface: '#1F2937',
    surfaceLight: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textLight: '#6B7280',
    border: '#374151',
    divider: '#4B5563',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
    cardBackground: '#1F2937',
    inputBackground: '#374151',
    shadowColor: '#000000',
  },
};

export type Theme = typeof lightTheme;
```

### 1.2 Theme Context

Create `contexts/ThemeContext.tsx`:

```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '@/constants/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode === 'dark' ? 'dark' : 'light';
  };

  const effectiveTheme = getEffectiveTheme();
  const theme = effectiveTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = effectiveTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 2. API Client Setup

### 2.1 API Client with Interceptors

Create `lib/api/client.ts`:

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://student-nest-for.vercel.app';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });

    const newAccessToken = response.data.accessToken;
    await AsyncStorage.setItem('accessToken', newAccessToken);
    return newAccessToken;
  }

  private async logout() {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password, role: 'owner' });
    return response.data;
  }

  async signup(data: any) {
    const response = await this.client.post('/auth/owner/signup', data);
    return response.data;
  }

  async sendOTP(email: string) {
    const response = await this.client.post('/otp/email/send', { email });
    return response.data;
  }

  async verifyOTP(email: string, otp: string) {
    const response = await this.client.post('/otp/email/verify', { email, otp });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Property endpoints
  async getMyProperties() {
    const response = await this.client.get('/properties/my-properties');
    return response.data;
  }

  async getPropertyById(id: string) {
    const response = await this.client.get(`/rooms/${id}`);
    return response.data;
  }

  async createProperty(data: any) {
    const response = await this.client.post('/rooms', data);
    return response.data;
  }

  async updateProperty(id: string, data: any) {
    const response = await this.client.put(`/rooms/${id}`, data);
    return response.data;
  }

  async deleteProperty(id: string) {
    const response = await this.client.delete(`/rooms/${id}`);
    return response.data;
  }

  // Booking endpoints
  async getBookings() {
    const response = await this.client.get('/bookings');
    return response.data;
  }

  async getBookingById(id: string) {
    const response = await this.client.get(`/bookings/${id}`);
    return response.data;
  }

  async updateBookingStatus(id: string, action: 'accept' | 'reject', data?: any) {
    const response = await this.client.post(`/bookings/${id}/actions`, { action, ...data });
    return response.data;
  }

  // Visit requests endpoints
  async getVisitRequests() {
    const response = await this.client.get('/visit-requests');
    return response.data;
  }

  async updateVisitStatus(id: string, status: string) {
    const response = await this.client.put(`/visit-requests/${id}`, { status });
    return response.data;
  }

  // Meetings endpoints
  async getMeetings() {
    const response = await this.client.get('/meetings');
    return response.data;
  }

  async updateMeetingStatus(id: string, status: string) {
    const response = await this.client.put(`/meetings/${id}`, { status });
    return response.data;
  }

  // Payment endpoints
  async getPaymentStatistics() {
    const response = await this.client.get('/payments/statistics');
    return response.data;
  }

  // Profile endpoints
  async getOwnerProfile() {
    const response = await this.client.get('/profile/owner');
    return response.data;
  }

  async updateOwnerProfile(data: any) {
    const response = await this.client.put('/profile/owner', data);
    return response.data;
  }

  // Upload endpoint
  async uploadImage(file: any) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new ApiClient();
```

---

## 3. Authentication Flow

### 3.1 Auth Context

Create `contexts/AuthContext.tsx`:

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import apiClient from '@/lib/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner';
  isVerified: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const [token, userStr] = await AsyncStorage.multiGet(['accessToken', 'user']);

      if (token[1] && userStr[1]) {
        const userData = JSON.parse(userStr[1]);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);

      const { user, token, refreshToken } = response.data;

      await AsyncStorage.multiSet([
        ['accessToken', token],
        ['refreshToken', refreshToken || token],
        ['user', JSON.stringify(user)],
      ]);

      setUser(user);
      router.replace('/(tabs)');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 3.2 Login Screen

Create `app/(auth)/login.tsx`:

```typescript
// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to manage your properties
        </Text>

        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
});
```

---

## 4. Navigation Setup

### 4.1 Root Layout

Update `app/_layout.tsx`:

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="property" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 4.2 Tab Layout

Create `app/(tabs)/_layout.tsx`:

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 5. Cloudinary Integration

### 5.1 Cloudinary Upload Utility

Create `lib/api/cloudinary.ts`:

```typescript
// lib/api/cloudinary.ts
const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'student-nest';

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  try {
    const formData = new FormData();

    // Extract file extension
    const fileExt = uri.split('.').pop();
    const fileName = `property-${Date.now()}.${fileExt}`;

    formData.append('file', {
      uri,
      type: `image/${fileExt}`,
      name: fileName,
    } as any);

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'student-nest/properties');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (uris: string[]): Promise<string[]> => {
  try {
    const uploadPromises = uris.map(uri => uploadImageToCloudinary(uri));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw error;
  }
};
```

### 5.2 Image Picker Component

Create `components/property/ImageUploader.tsx`:

```typescript
// components/property/ImageUploader.tsx
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { uploadMultipleImages } from '@/lib/api/cloudinary';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload images!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        setUploading(true);
        const uris = result.assets.map(asset => asset.uri);
        const uploadedUrls = await uploadMultipleImages(uris);
        onImagesChange([...images, ...uploadedUrls]);
      } catch (error) {
        alert('Failed to upload images. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Property Images ({images.length}/{maxImages})
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < maxImages && (
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
            onPress={pickImages}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Ionicons name="add" size={32} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

## 6. Component Examples

### 6.1 Button Component

Create `components/ui/Button.tsx`:

```typescript
// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    // Size
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { height: 36, paddingHorizontal: theme.spacing.md },
      md: { height: 44, paddingHorizontal: theme.spacing.lg },
      lg: { height: 52, paddingHorizontal: theme.spacing.xl },
    };

    // Variant
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: theme.colors.primary },
      secondary: { backgroundColor: theme.colors.secondary },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      ghost: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: '#fff' },
      secondary: { color: '#fff' },
      outline: { color: theme.colors.primary },
      ghost: { color: theme.colors.primary },
    };

    const sizeTextStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    return {
      fontWeight: 'bold',
      ...variantTextStyles[variant],
      ...sizeTextStyles[size],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#fff' : theme.colors.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
```

### 6.2 Card Component

Create `components/ui/Card.tsx`:

```typescript
// components/ui/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export default function Card({ children, style, variant = 'elevated' }: CardProps) {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        ...theme.shadows.md,
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      flat: {},
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
```

---

## 7. Screen Examples

### 7.1 Dashboard Screen

Create `app/(tabs)/index.tsx`:

```typescript
// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api/client';
import Card from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface Stats {
  totalProperties: number;
  activeBookings: number;
  totalRevenue: number;
  pendingVisits: number;
}

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Replace with actual API endpoint
      const response = await apiClient.getPaymentStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Welcome back, {user?.name}!
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Here's what's happening with your properties
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="home"
          title="Properties"
          value={stats?.totalProperties || 0}
          color={theme.colors.primary}
        />
        <StatCard
          icon="calendar"
          title="Bookings"
          value={stats?.activeBookings || 0}
          color={theme.colors.success}
        />
        <StatCard
          icon="cash"
          title="Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
          color={theme.colors.warning}
        />
        <StatCard
          icon="people"
          title="Visits"
          value={stats?.pendingVisits || 0}
          color={theme.colors.info}
        />
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const { theme } = useTheme();

  return (
    <Card style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
});
```

---

This implementation guide provides all the essential code examples to get started with the StudentNest mobile app. Follow the phases in the README.md to implement features systematically.
