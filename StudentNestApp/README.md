# 🏠 StudentNest Mobile App

A React Native Expo mobile application for the StudentNest accommodation booking platform. This app allows students to find and book rooms near their colleges, and property owners to manage their listings.

![StudentNest](https://img.shields.io/badge/StudentNest-Mobile-orange)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76-green)

## 📱 Features

### For Students
- 🔍 **Browse Rooms** - Search and filter available rooms
- 🗺️ **Map View** - View rooms on an interactive map
- ❤️ **Save Rooms** - Bookmark favorite listings
- 📅 **Book Rooms** - Request bookings with ease
- 💬 **Negotiations** - Negotiate prices with owners
- 🏘️ **Room Sharing** - Find roommates
- 🔔 **Notifications** - Real-time updates

### For Owners
- 🏠 **List Properties** - Add and manage room listings
- 📊 **Dashboard** - View booking statistics
- ✅ **Verify Account** - Complete identity verification
- 📝 **Manage Bookings** - Accept/reject booking requests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone (for testing)

### Installation

```bash
# Navigate to the app directory
cd StudentNestApp

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# Start Expo dev server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android

# Run on Web
npx expo start --web
```

## 📁 Project Structure

```
StudentNestApp/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx        # Login screen
│   │   ├── signup.tsx       # Signup screen
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main tab navigation
│   │   ├── index.tsx        # Home/Browse rooms
│   │   ├── search.tsx       # Search with filters
│   │   ├── saved.tsx        # Saved rooms
│   │   ├── bookings.tsx     # My bookings
│   │   └── profile.tsx      # User profile
│   ├── room/                # Room detail screens
│   │   └── [id].tsx         # Room details
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── components/              # Reusable components
│   ├── ui/                  # UI primitives
│   ├── room/                # Room-related components
│   └── common/              # Shared components
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hook
│   └── useApi.ts            # API query hooks
├── lib/                     # Utilities and services
│   ├── api.ts               # API client
│   ├── auth.ts              # Auth helpers
│   └── storage.ts           # Secure storage
├── types/                   # TypeScript types
│   └── index.ts             # Type definitions
├── constants/               # App constants
│   └── config.ts            # Configuration
└── assets/                  # Images and fonts
```

## ⚙️ Configuration

### Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For production
# EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

### API Connection

The app connects to the StudentNest backend API. Make sure the backend is running:

```bash
# In the Website directory
cd ../Website
npm run dev
```

For testing on a physical device, update the API URL to your local IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
```

## 🎨 Design System

### Colors

| Color         | Hex       | Usage                    |
|---------------|-----------|--------------------------|
| Primary       | `#F97316` | Orange - Main brand      |
| Secondary     | `#7C3AED` | Purple - Accents         |
| Success       | `#22C55E` | Green - Success states   |
| Error         | `#EF4444` | Red - Error states       |
| Background    | `#0A0A0B` | Dark mode background     |
| Surface       | `#1A1A1B` | Card backgrounds         |

### Typography

- **Headings**: System font, bold
- **Body**: System font, regular
- **Captions**: System font, light

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| expo | 54.0.0 | Core Expo SDK |
| expo-router | 6.0.0 | File-based routing |
| nativewind | 4.0.0 | Tailwind CSS for RN |
| @tanstack/react-query | 5.0.0 | Data fetching |
| axios | 1.6.0 | HTTP client |
| expo-secure-store | 14.0.0 | Secure storage |
| react-native-maps | 1.18.0 | Map integration |
| expo-location | 18.0.0 | Location services |
| lucide-react-native | 0.300.0 | Icons |

## 🔐 Authentication Flow

1. **Login/Signup** - User enters credentials
2. **Token Storage** - Access token stored in SecureStore
3. **Auto Refresh** - Token refreshed automatically
4. **Protected Routes** - Auth required for certain screens

## 📱 Screens Overview

### Authentication
- **Login** - Email/Phone + Password login
- **Signup** - Student or Owner registration
- **OTP Verification** - Phone/Email verification

### Main Tabs
- **Home** - Featured rooms, categories
- **Search** - Advanced search with filters
- **Saved** - Bookmarked rooms
- **Bookings** - Active and past bookings
- **Profile** - Account settings

### Room Details
- **Gallery** - Room photos carousel
- **Info** - Amenities, description
- **Location** - Map view
- **Reviews** - User reviews
- **Book** - Booking form

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Build for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Submit to Stores

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: StudentNest Team
- **Design**: StudentNest Team

---

<p align="center">
  Made with ❤️ for students
</p>
