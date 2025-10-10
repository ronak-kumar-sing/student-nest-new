# 📦 PHASE 1: Project Setup & Architecture

**Timeline:** Week 1 (5-7 days)
**Status:** Ready to Start

---

## Overview

Phase 1 focuses on setting up the project foundation, including dependencies, folder structure, theme system, and basic configuration.

---

## Task 1.1: Initial Setup & Dependencies

### 1.1.1 Install Required Dependencies

Run the following commands in the StudentNest directory:

```bash
# Core dependencies
npm install axios @react-native-async-storage/async-storage

# Image handling
npm install expo-image-picker

# Icons
npm install @expo/vector-icons

# Navigation (already installed via expo-router)
# React Navigation dependencies should already be there
```

### 1.1.2 Create Environment File

Create `.env` file in the root:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://student-nest-for.vercel.app
# For local development, use: http://localhost:3000

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dyvv2furt
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=student-nest

# App Configuration
EXPO_PUBLIC_APP_NAME=StudentNest Owner
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 1.1.3 Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "clean": "rm -rf node_modules && npm install",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  }
}
```

### 1.1.4 Configure TypeScript

Update `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

## Task 1.2: Create Folder Structure

### 1.2.1 Create Required Directories

```bash
# From StudentNest root directory
mkdir -p lib/api
mkdir -p lib/utils
mkdir -p lib/constants
mkdir -p contexts
mkdir -p types
mkdir -p hooks
mkdir -p components/ui
mkdir -p components/property
mkdir -p components/booking
mkdir -p components/visit
mkdir -p components/dashboard
mkdir -p components/shared
```

### 1.2.2 Create Type Definitions

Create `types/auth.ts`:

```typescript
// types/auth.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner';
  isVerified: boolean;
  isIdentityVerified?: boolean;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
```

Create `types/property.ts`:

```typescript
// types/property.ts
export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'flat' | 'apartment';
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  monthlyRent: number;
  securityDeposit: number;
  amenities: string[];
  rules: string[];
  totalRooms: number;
  availableRooms: number;
  status: 'active' | 'inactive' | 'pending';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  title: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
  securityDeposit: number;
  amenities: string[];
  rules: string[];
  totalRooms: number;
  images: string[];
}
```

Create `types/booking.ts`:

```typescript
// types/booking.ts
export interface Booking {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  monthlyRent: number;
  securityDeposit: number;
  moveInDate: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'partial' | 'completed';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

Create `types/api.ts`:

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Task 1.3: Theme System Implementation

### 1.3.1 Create Theme Constants

Create `constants/theme.ts` (full code from IMPLEMENTATION_GUIDE.md)

### 1.3.2 Create Theme Context

Create `contexts/ThemeContext.tsx` (full code from IMPLEMENTATION_GUIDE.md)

### 1.3.3 Create useTheme Hook

Create `hooks/useTheme.ts`:

```typescript
// hooks/useTheme.ts
export { useTheme } from '@/contexts/ThemeContext';
```

### 1.3.4 Test Theme System

Create a test screen to verify theme switching:

Create `app/theme-test.tsx`:

```typescript
// app/theme-test.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeTestScreen() {
  const { theme, themeMode, setThemeMode, toggleTheme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Theme Test Screen
      </Text>

      <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
        Current Mode: {themeMode}
      </Text>

      <Text style={[styles.info, { color: theme.colors.textSecondary }]}>
        Is Dark: {isDark ? 'Yes' : 'No'}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={toggleTheme}
        >
          <Text style={styles.buttonText}>Toggle Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setThemeMode('light')}
        >
          <Text style={styles.buttonText}>Light</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setThemeMode('dark')}
        >
          <Text style={styles.buttonText}>Dark</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setThemeMode('system')}
        >
          <Text style={styles.buttonText}>System</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.colorPalette}>
        <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
        <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
        <View style={[styles.colorBox, { backgroundColor: theme.colors.success }]} />
        <View style={[styles.colorBox, { backgroundColor: theme.colors.error }]} />
        <View style={[styles.colorBox, { backgroundColor: theme.colors.warning }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 32,
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
});
```

---

## Task 1.4: Utility Functions

### 1.4.1 Create Formatters

Create `lib/utils/formatters.ts`:

```typescript
// lib/utils/formatters.ts

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date to short string
 */
export const formatDateShort = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time
 */
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDateShort(date);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
```

### 1.4.2 Create Validators

Create `lib/utils/validators.ts`:

```typescript
// lib/utils/validators.ts

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate Indian phone number
 */
export const validatePhone = (phone: string): boolean => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate Indian PIN code
 */
export const validatePincode = (pincode: string): boolean => {
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

/**
 * Validate price
 */
export const validatePrice = (price: number): boolean => {
  return price > 0 && price <= 10000000;
};

/**
 * Validate required field
 */
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};
```

### 1.4.3 Create Helper Functions

Create `lib/utils/helpers.ts`:

```typescript
// lib/utils/helpers.ts

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove duplicates from array
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Safe JSON parse
 */
export const safeJSONParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
};
```

---

## Task 1.5: Update Root Layout

Update `app/_layout.tsx`:

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="theme-test" options={{ headerShown: true, title: 'Theme Test' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
```

---

## Testing Phase 1

### Checklist

- [ ] All dependencies installed successfully
- [ ] Environment variables configured
- [ ] Folder structure created
- [ ] Type definitions created
- [ ] Theme constants created
- [ ] Theme context working
- [ ] Theme switching works (light/dark/system)
- [ ] Utility functions work correctly
- [ ] No TypeScript errors
- [ ] App runs on iOS/Android/Web

### Test Commands

```bash
# Start development server
npm start

# Test on iOS (Mac only)
npm run ios

# Test on Android
npm run android

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

### Expected Output

- App should launch without errors
- Theme test screen should be accessible
- Theme switching should work smoothly
- Dark and light modes should apply correctly
- System theme should follow device settings

---

## Completion Criteria

✅ **Phase 1 is complete when:**

1. All dependencies are installed
2. Project structure is set up correctly
3. Theme system is implemented and working
4. Dark/Light modes work perfectly
5. Type definitions are created
6. Utility functions are implemented
7. No errors when running the app
8. Theme test screen works correctly

---

## Next Steps

Once Phase 1 is complete, proceed to:
- **PHASE 2: Authentication System** (Week 1-2)

---

**Estimated Time:** 5-7 days
**Difficulty:** ⭐⭐ (Medium)
**Priority:** 🔴 Critical (Foundation)

