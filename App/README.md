# 🏠 StudentNest Mobile - Owner Management App

> **React Native Mobile Application** - Built with Expo, React Native, and TypeScript for property owners to manage their student accommodations on the go.

[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.4-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Implementation Phases](#-implementation-phases)
- [Getting Started](#-getting-started)
- [Development Guide](#-development-guide)
- [Theme System](#-theme-system)
- [Navigation](#-navigation)
- [Cloudinary Integration](#-cloudinary-integration)

---

## 🎯 Overview

**StudentNest Mobile** is the companion mobile application for property owners, allowing them to:
- Manage properties and listings
- Handle booking requests
- Schedule and manage property visits
- Track payments and revenue
- Communicate with students
- Upload and manage property media
- Monitor analytics and performance

This mobile app connects to the **student-nest-new** backend API (`https://student-nest-for.vercel.app`) and provides a seamless experience for property owners.

---

## ✨ Features

### 🔐 Authentication
- [x] Owner login with email/phone
- [x] OTP verification
- [x] Secure token management
- [x] Auto-refresh tokens
- [ ] Biometric authentication (future)

### 🏠 Property Management
- [ ] List all properties
- [ ] Add new property with media
- [ ] Edit property details
- [ ] Delete/Archive properties
- [ ] Property status management
- [ ] Room availability tracking
- [ ] Multi-image upload via Cloudinary

### 📅 Booking Management
- [ ] View all bookings
- [ ] Accept/Reject booking requests
- [ ] Booking status updates
- [ ] Student information view
- [ ] Booking timeline tracking
- [ ] Payment status monitoring

### 👥 Visit Requests
- [ ] View visit requests
- [ ] Schedule property tours
- [ ] Google Meet integration
- [ ] Reschedule/Cancel visits
- [ ] Visit history
- [ ] Student contact information

### 💰 Payments & Revenue
- [ ] Payment dashboard
- [ ] Revenue analytics
- [ ] Transaction history
- [ ] Payment status tracking
- [ ] Monthly/Yearly reports
- [ ] Downloadable invoices

### 📊 Dashboard & Analytics
- [ ] Overview statistics
- [ ] Property performance metrics
- [ ] Booking trends
- [ ] Revenue graphs
- [ ] Occupancy rates
- [ ] Student reviews

### 💬 Communication
- [ ] In-app messaging with students
- [ ] Notification system
- [ ] Email/SMS alerts
- [ ] Meeting reminders

### 👤 Profile Management
- [ ] Owner profile editing
- [ ] Profile photo upload
- [ ] Contact information management
- [ ] Verification status

### 🤝 Room Sharing (NEW)
- [x] Browse available room sharing posts
- [x] Create room sharing requests
- [x] Apply to join room shares
- [x] Manage applications
- [x] View compatibility preferences
- [x] Cost splitting calculator
- [x] Roommate matching filters
- [x] Contact potential roommates
- [ ] Identity verification status
- [ ] Document management
- [ ] Account settings
- [ ] Privacy settings

---

## 🛠 Tech Stack

### Frontend Framework
- **Expo ~54.0.12** - React Native framework
- **React Native 0.81.4** - Cross-platform mobile development
- **TypeScript 5.9** - Type-safe development
- **Expo Router 6.0** - File-based navigation

### UI & Styling
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch interactions
- **Expo Image** - Optimized image rendering
- **Custom Theme System** - Dark/Light mode support
- **Responsive Design** - Adaptive layouts

### State Management
- **React Hooks** - State and effects
- **Context API** - Global state
- **AsyncStorage** - Local persistence
- **React Query** (planned) - Server state

### Navigation
- **Expo Router** - File-based routing
- **React Navigation** - Navigation library
- **Bottom Tabs** - Tab navigation
- **Stack Navigator** - Screen stacks

### API & Backend
- **Axios** - HTTP client
- **student-nest-new API** - Backend integration
- **JWT Authentication** - Secure auth
- **REST API** - API communication

### Media & Storage
- **Cloudinary** - Image/video storage
- **Expo Image Picker** - Media selection
- **Expo Camera** - Photo capture
- **Expo Document Picker** - File selection

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Expo Go** - Development testing
- **EAS Build** - Production builds

---

## 📁 Project Structure

```
StudentNest/
├── app/                          # Application screens (Expo Router)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── otp-verify.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard/Home
│   │   ├── properties.tsx        # Properties list
│   │   ├── bookings.tsx          # Bookings management
│   │   ├── visits.tsx            # Visit requests
│   │   └── profile.tsx           # Owner profile
│   ├── (modals)/                 # Modal screens
│   │   ├── add-property.tsx
│   │   ├── edit-property.tsx
│   │   ├── booking-details.tsx
│   │   └── visit-details.tsx
│   ├── property/                 # Property related screens
│   │   ├── [id].tsx              # Property details
│   │   └── [id]/edit.tsx         # Edit property
│   ├── _layout.tsx               # Root layout
│   └── modal.tsx                 # Generic modal
├── components/                   # Reusable components
│   ├── ui/                       # UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   ├── property/                 # Property components
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── ImageUploader.tsx
│   │   └── PropertyStats.tsx
│   ├── booking/                  # Booking components
│   │   ├── BookingCard.tsx
│   │   ├── BookingTimeline.tsx
│   │   └── BookingActions.tsx
│   ├── visit/                    # Visit components
│   │   ├── VisitCard.tsx
│   │   └── VisitScheduler.tsx
│   ├── dashboard/                # Dashboard components
│   │   ├── StatsCard.tsx
│   │   ├── RevenueChart.tsx
│   │   └── ActivityFeed.tsx
│   └── shared/                   # Shared components
│       ├── Header.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── lib/                          # Utilities and libraries
│   ├── api/                      # API integration
│   │   ├── client.ts             # API client
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── properties.ts         # Property endpoints
│   │   ├── bookings.ts           # Booking endpoints
│   │   ├── visits.ts             # Visit endpoints
│   │   ├── payments.ts           # Payment endpoints
│   │   └── cloudinary.ts         # Cloudinary integration
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Date, currency formatters
│   │   ├── validators.ts         # Input validation
│   │   └── helpers.ts            # Helper functions
│   └── constants/                # Constants
│       ├── api-urls.ts
│       ├── colors.ts
│       └── config.ts
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication hook
│   ├── useProperties.ts          # Properties hook
│   ├── useBookings.ts            # Bookings hook
│   ├── useTheme.ts               # Theme hook
│   └── useUpload.ts              # Upload hook
├── contexts/                     # React contexts
│   ├── AuthContext.tsx           # Auth context
│   ├── ThemeContext.tsx          # Theme context
│   └── NotificationContext.tsx   # Notification context
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── property.ts
│   ├── booking.ts
│   ├── visit.ts
│   └── api.ts
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
├── constants/                    # App constants
│   └── theme.ts
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API Integration

### Base Configuration

The app connects to: `https://student-nest-for.vercel.app/api`

```typescript
// lib/api/client.ts
const API_BASE_URL = 'https://student-nest-for.vercel.app';
// or 'http://localhost:3000' for development

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Available API Endpoints

#### Authentication
```typescript
POST /api/auth/login                    // Owner login
POST /api/auth/owner/signup             // Owner signup
POST /api/otp/email/send                // Send OTP
POST /api/otp/email/verify              // Verify OTP
POST /api/auth/refresh                  // Refresh token
POST /api/auth/logout                   // Logout
GET  /api/auth/me                       // Get current user
```

#### Properties
```typescript
GET    /api/properties/my-properties    // Get owner properties
POST   /api/rooms                       // Create property
PUT    /api/rooms/[id]                  // Update property
DELETE /api/rooms/[id]                  // Delete property
GET    /api/rooms/[id]                  // Get property details
```

#### Bookings
```typescript
GET    /api/bookings                    // Get all bookings (owner)
GET    /api/bookings/[id]               // Get booking details
POST   /api/bookings/[id]/actions       // Accept/Reject booking
PUT    /api/bookings/[id]               // Update booking
```

#### Visit Requests
```typescript
GET    /api/visit-requests              // Get visit requests
POST   /api/visit-requests              // Create visit request
PUT    /api/visit-requests/[id]         // Update visit status
GET    /api/visit-requests/[id]         // Get visit details
```

#### Meetings
```typescript
GET    /api/meetings                    // Get all meetings
POST   /api/meetings                    // Create meeting
PUT    /api/meetings/[id]               // Update meeting
```

#### Payments
```typescript
GET    /api/payments/statistics         // Get payment stats
GET    /api/payments/[id]               // Get payment details
```

#### Profile
```typescript
GET    /api/profile/owner               // Get owner profile
PUT    /api/profile/owner               // Update owner profile
```

#### Upload
```typescript
POST   /api/upload                      // Upload single image
POST   /api/upload/property             // Upload property media
```

#### Verification
```typescript
GET    /api/verification                // Get verification status
POST   /api/verification                // Submit verification
```

---

## 📋 Implementation Phases

### **PHASE 1: Project Setup & Architecture** ⏱️ Week 1

#### Task 1.1: Initial Setup
- [ ] Install required dependencies
- [ ] Configure TypeScript
- [ ] Setup Expo Router
- [ ] Configure environment variables
- [ ] Setup ESLint and Prettier

#### Task 1.2: Theme System
- [ ] Create theme constants (colors, fonts, spacing)
- [ ] Implement ThemeContext
- [ ] Create useTheme hook
- [ ] Add dark/light mode toggle
- [ ] Test theme switching

#### Task 1.3: Project Structure
- [ ] Create folder structure
- [ ] Setup base components
- [ ] Create type definitions
- [ ] Setup constants
- [ ] Create utility functions

---

### **PHASE 2: Authentication System** ⏱️ Week 1-2

#### Task 2.1: API Client Setup
- [ ] Create Axios client with interceptors
- [ ] Implement token management
- [ ] Add request/response interceptors
- [ ] Error handling middleware
- [ ] Auto-refresh token logic

#### Task 2.2: Auth Context & Hook
- [ ] Create AuthContext
- [ ] Implement useAuth hook
- [ ] Add login/logout functions
- [ ] Token storage (AsyncStorage)
- [ ] User state management

#### Task 2.3: Auth Screens
- [ ] Login screen UI (Dark/Light)
- [ ] OTP verification screen
- [ ] Signup screen
- [ ] Forgot password screen
- [ ] Auth navigation flow

#### Task 2.4: Auth Integration
- [ ] Connect login API
- [ ] Implement OTP verification
- [ ] Handle auth errors
- [ ] Add loading states
- [ ] Success/Error toasts

---

### **PHASE 3: Core UI Components** ⏱️ Week 2

#### Task 3.1: Basic Components
- [ ] Button component (variants, sizes)
- [ ] Input component (text, email, password)
- [ ] Card component
- [ ] Badge component
- [ ] Avatar component

#### Task 3.2: Advanced Components
- [ ] Modal component
- [ ] Select/Dropdown component
- [ ] Date picker component
- [ ] Image picker component
- [ ] Loading spinner

#### Task 3.3: Theme Integration
- [ ] Apply theme to all components
- [ ] Dark mode support
- [ ] Light mode support
- [ ] Test theme consistency
- [ ] Responsive sizing

---

### **PHASE 4: Navigation & Layout** ⏱️ Week 2-3

#### Task 4.1: Tab Navigation
- [ ] Setup bottom tabs
- [ ] Create tab icons
- [ ] Dashboard tab
- [ ] Properties tab
- [ ] Bookings tab
- [ ] Profile tab

#### Task 4.2: Stack Navigation
- [ ] Property details stack
- [ ] Booking details stack
- [ ] Visit details stack
- [ ] Settings stack

#### Task 4.3: Navigation Guards
- [ ] Auth protection
- [ ] Role-based access
- [ ] Deep linking
- [ ] Navigation state persistence

---

### **PHASE 5: Dashboard Screen** ⏱️ Week 3

#### Task 5.1: Dashboard UI
- [ ] Stats cards (properties, bookings, revenue)
- [ ] Revenue chart
- [ ] Recent activity feed
- [ ] Quick actions
- [ ] Notifications badge

#### Task 5.2: Dashboard Data
- [ ] Fetch dashboard stats API
- [ ] Real-time updates
- [ ] Pull-to-refresh
- [ ] Loading states
- [ ] Error handling

#### Task 5.3: Charts & Analytics
- [ ] Revenue chart component
- [ ] Booking trends chart
- [ ] Occupancy rate display
- [ ] Period selector (daily, weekly, monthly)

---

### **PHASE 6: Properties Module** ⏱️ Week 3-4

#### Task 6.1: Property List Screen
- [ ] Properties list UI
- [ ] Property card component
- [ ] Filter by status
- [ ] Search functionality
- [ ] Sort options
- [ ] Pull-to-refresh

#### Task 6.2: Property Details Screen
- [ ] Property details UI
- [ ] Image gallery
- [ ] Property information
- [ ] Amenities display
- [ ] Edit/Delete actions
- [ ] Share property

#### Task 6.3: Add/Edit Property Form
- [ ] Multi-step form UI
- [ ] Basic information step
- [ ] Location step
- [ ] Amenities step
- [ ] Pricing step
- [ ] Images upload step
- [ ] Form validation

#### Task 6.4: Cloudinary Integration
- [ ] Setup Cloudinary SDK
- [ ] Image picker integration
- [ ] Upload progress indicator
- [ ] Multiple image upload
- [ ] Image preview
- [ ] Delete uploaded images

#### Task 6.5: Property API Integration
- [ ] GET my-properties
- [ ] POST create property
- [ ] PUT update property
- [ ] DELETE property
- [ ] GET property details
- [ ] Upload property images

---

### **PHASE 7: Bookings Module** ⏱️ Week 4-5

#### Task 7.1: Bookings List Screen
- [ ] Bookings list UI
- [ ] Booking card component
- [ ] Filter by status
- [ ] Sort options
- [ ] Search by student name
- [ ] Pull-to-refresh

#### Task 7.2: Booking Details Screen
- [ ] Booking details UI
- [ ] Student information
- [ ] Property information
- [ ] Payment information
- [ ] Timeline view
- [ ] Accept/Reject actions

#### Task 7.3: Booking Actions
- [ ] Accept booking modal
- [ ] Reject booking modal
- [ ] Cancel booking
- [ ] Reschedule booking
- [ ] Confirmation dialogs

#### Task 7.4: Bookings API Integration
- [ ] GET bookings
- [ ] GET booking details
- [ ] POST accept booking
- [ ] POST reject booking
- [ ] PUT update booking
- [ ] Real-time updates

---

### **PHASE 8: Visit Requests Module** ⏱️ Week 5

#### Task 8.1: Visits List Screen
- [ ] Visits list UI
- [ ] Visit card component
- [ ] Filter by status
- [ ] Upcoming visits highlight
- [ ] Calendar view option
- [ ] Pull-to-refresh

#### Task 8.2: Visit Details Screen
- [ ] Visit details UI
- [ ] Student information
- [ ] Property information
- [ ] Meeting link (Google Meet)
- [ ] Reschedule option
- [ ] Cancel option

#### Task 8.3: Visit Actions
- [ ] Confirm visit
- [ ] Reschedule visit
- [ ] Cancel visit
- [ ] Join meeting button
- [ ] Add to calendar

#### Task 8.4: Visits API Integration
- [ ] GET visit requests
- [ ] GET visit details
- [ ] PUT update visit status
- [ ] POST reschedule visit
- [ ] Google Meet integration

---

### **PHASE 9: Payments Module** ⏱️ Week 5-6

#### Task 9.1: Payments Dashboard
- [ ] Revenue overview
- [ ] Payment statistics
- [ ] Monthly/Yearly toggle
- [ ] Revenue chart
- [ ] Recent transactions

#### Task 9.2: Transactions List
- [ ] Transactions list UI
- [ ] Transaction card
- [ ] Filter by status
- [ ] Filter by date
- [ ] Search transactions

#### Task 9.3: Payment Details
- [ ] Payment details screen
- [ ] Invoice view
- [ ] Download invoice
- [ ] Payment timeline
- [ ] Refund option

#### Task 9.4: Payments API Integration
- [ ] GET payment statistics
- [ ] GET transactions
- [ ] GET payment details
- [ ] Generate invoice

---

### **PHASE 10: Profile & Settings** ⏱️ Week 6

#### Task 10.1: Profile Screen
- [ ] Profile UI
- [ ] Profile picture
- [ ] Owner information
- [ ] Verification status
- [ ] Edit profile button
- [ ] Settings navigation

#### Task 10.2: Edit Profile
- [ ] Edit profile form
- [ ] Update profile picture
- [ ] Form validation
- [ ] Save changes API
- [ ] Success feedback

#### Task 10.3: Verification
- [ ] Verification status display
- [ ] Upload documents
- [ ] Document preview
- [ ] Verification timeline
- [ ] Resubmit option

#### Task 10.4: Settings
- [ ] App settings screen
- [ ] Theme toggle
- [ ] Notification settings
- [ ] Language selection
- [ ] Privacy settings
- [ ] About section

#### Task 10.5: Profile API Integration
- [ ] GET owner profile
- [ ] PUT update profile
- [ ] POST upload profile picture
- [ ] GET verification status
- [ ] POST submit verification

---

### **PHASE 11: Notifications & Messaging** ⏱️ Week 6-7

#### Task 11.1: Push Notifications
- [ ] Setup Expo Notifications
- [ ] Request permissions
- [ ] Handle notification tokens
- [ ] Display notifications
- [ ] Navigate from notification

#### Task 11.2: In-App Messaging
- [ ] Messages list screen
- [ ] Chat interface
- [ ] Send message
- [ ] Receive messages
- [ ] Message notifications

#### Task 11.3: Notification Center
- [ ] Notifications list
- [ ] Mark as read
- [ ] Delete notifications
- [ ] Filter notifications
- [ ] Notification badges

---

### **PHASE 12: Advanced Features** ⏱️ Week 7-8

#### Task 12.1: Search & Filters
- [ ] Global search
- [ ] Advanced filters
- [ ] Filter persistence
- [ ] Search history
- [ ] Clear filters

#### Task 12.2: Offline Support
- [ ] Cache API responses
- [ ] Offline mode detection
- [ ] Queue offline actions
- [ ] Sync on reconnect
- [ ] Offline indicators

#### Task 12.3: Analytics
- [ ] Track user events
- [ ] Screen view tracking
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User behavior analytics

#### Task 12.4: App Performance
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Code splitting
- [ ] Bundle size optimization
- [ ] Memory management

---

### **PHASE 13: Testing & Quality Assurance** ⏱️ Week 8

#### Task 13.1: Unit Testing
- [ ] Test utility functions
- [ ] Test API client
- [ ] Test hooks
- [ ] Test components
- [ ] Test navigation

#### Task 13.2: Integration Testing
- [ ] Test auth flow
- [ ] Test booking flow
- [ ] Test property creation
- [ ] Test API integration
- [ ] Test error scenarios

#### Task 13.3: UI/UX Testing
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test dark mode
- [ ] Test light mode
- [ ] Test different screen sizes
- [ ] Test accessibility

#### Task 13.4: Bug Fixes
- [ ] Fix identified bugs
- [ ] Performance improvements
- [ ] UI/UX refinements
- [ ] Error handling improvements

---

### **PHASE 14: Deployment & Documentation** ⏱️ Week 8-9

#### Task 14.1: Build Configuration
- [ ] Configure EAS Build
- [ ] Setup app icons
- [ ] Setup splash screens
- [ ] Configure app.json
- [ ] Environment variables

#### Task 14.2: App Store Preparation
- [ ] iOS build
- [ ] Android build
- [ ] App screenshots
- [ ] App description
- [ ] Privacy policy

#### Task 14.3: Documentation
- [ ] Update README
- [ ] API documentation
- [ ] Component documentation
- [ ] Deployment guide
- [ ] User guide

#### Task 14.4: Release
- [ ] TestFlight beta
- [ ] Internal testing
- [ ] Fix feedback issues
- [ ] Production release
- [ ] Post-release monitoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Student-nest-new backend running

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   # Create .env file
   cp .env.example .env

   # Edit .env with your configuration
   EXPO_PUBLIC_API_URL=https://student-nest-for.vercel.app
   # or http://localhost:3000 for local development

   EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dyvv2furt
   EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

3. **Start development server**

   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on device**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web (for testing)
   npm run web
   ```

---

## 💻 Development Guide

See the detailed implementation examples in the sections below for:
- API Client Setup
- Authentication Hook
- Theme System
- Navigation
- Cloudinary Integration
- Component Examples

---

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Follow the coding style guide
4. Write tests for new features
5. Update documentation

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For issues and questions:
- Email: ronakkumarsingh23@lpu.in

---

**Built with ❤️ for Property Owners**

**Last Updated:** January 2025
