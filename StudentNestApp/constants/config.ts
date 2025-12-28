import { Platform } from 'react-native';

// API Configuration
// For Android Emulator: use 10.0.2.2 (special alias for host machine)
// For iOS Simulator: use localhost
// For Physical Device: use your computer's local IP
const getApiUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default fallbacks based on platform
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      // For physical device, use your computer's local IP
      return 'http://192.168.1.18:3001/api';
    }
    // iOS simulator can use localhost
    return 'http://localhost:3001/api';
  }
  
  // Production URL (update this when you deploy)
  return 'https://studentnest.vercel.app/api';
};

export const API_URL = getApiUrl();

// App Configuration
export const APP_CONFIG = {
  name: 'StudentNest',
  version: '1.0.0',
  support: {
    email: 'support@studentnest.com',
    phone: '+91-1234567890',
  },
};

// Colors
export const COLORS = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  dark: {
    bg: '#0A0A0B',
    surface: '#1A1A1B',
    border: '#2A2A2B',
    text: '#A1A1AA',
    muted: '#71717A',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#F4F4F5',
    border: '#E4E4E7',
    text: '#18181B',
    muted: '#71717A',
  },
};

// Room Types
export const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Sharing' },
  { value: 'triple', label: 'Triple Sharing' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' },
];

// Amenities
export const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: 'wifi' },
  { id: 'ac', label: 'AC', icon: 'snowflake' },
  { id: 'attached_bathroom', label: 'Attached Bathroom', icon: 'bath' },
  { id: 'parking', label: 'Parking', icon: 'car' },
  { id: 'laundry', label: 'Laundry', icon: 'shirt' },
  { id: 'kitchen', label: 'Kitchen', icon: 'cooking-pot' },
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'security', label: '24/7 Security', icon: 'shield' },
  { id: 'power_backup', label: 'Power Backup', icon: 'zap' },
  { id: 'meals', label: 'Meals Included', icon: 'utensils' },
  { id: 'study_table', label: 'Study Table', icon: 'lamp-desk' },
  { id: 'wardrobe', label: 'Wardrobe', icon: 'cabinet' },
];

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};
