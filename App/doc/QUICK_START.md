# 🚀 StudentNest Mobile - Quick Start Guide

Start building the StudentNest Owner mobile app in 5 simple steps!

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Install Dependencies

```bash
cd StudentNest

# Install required packages
npm install axios @react-native-async-storage/async-storage expo-image-picker

# Verify installation
npm list axios
```

### Step 2: Create Environment File

Create `.env` in the root of StudentNest directory:

```bash
EXPO_PUBLIC_API_URL=https://student-nest-for.vercel.app
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dyvv2furt
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=student-nest
```

### Step 3: Create Folder Structure

```bash
# Run these commands from StudentNest root
mkdir -p lib/api lib/utils lib/constants
mkdir -p contexts types hooks
mkdir -p components/ui components/property components/booking components/visit components/dashboard components/shared
```

### Step 4: Start the App

```bash
npm start

# Then press:
# - 'i' for iOS simulator (Mac only)
# - 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### Step 5: Verify Setup

Check that you see the existing Expo template app running.

---

## 📋 Implementation Phases Overview

### 🏁 **Phase 1: Foundation** (Week 1)
**Status:** 🟡 Ready to Start

**What you'll build:**
- ✅ Theme system (Dark/Light modes)
- ✅ Project structure
- ✅ Utility functions
- ✅ Type definitions

**Files to create:**
- `constants/theme.ts`
- `contexts/ThemeContext.tsx`
- `types/*.ts`
- `lib/utils/*.ts`

**Outcome:** Solid foundation with theme support

---

### 🔐 **Phase 2: Authentication** (Week 1-2)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Login screen
- ✅ OTP verification
- ✅ API client with interceptors
- ✅ Auth context and hooks
- ✅ Token management

**Files to create:**
- `lib/api/client.ts`
- `contexts/AuthContext.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/otp.tsx`

**Outcome:** Complete authentication flow

---

### 🎨 **Phase 3: UI Components** (Week 2)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Button, Input, Card components
- ✅ Modal, Badge, Avatar
- ✅ Loading states
- ✅ Theme integration

**Files to create:**
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Card.tsx`
- `components/ui/Modal.tsx`

**Outcome:** Reusable UI component library

---

### 🧭 **Phase 4: Navigation** (Week 2-3)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Tab navigation
- ✅ Stack navigation
- ✅ Auth guards
- ✅ Deep linking

**Files to create:**
- `app/(tabs)/_layout.tsx`
- `app/(auth)/_layout.tsx`
- Navigation guards

**Outcome:** Complete navigation system

---

### 📊 **Phase 5: Dashboard** (Week 3)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Stats cards
- ✅ Revenue charts
- ✅ Activity feed
- ✅ Quick actions

**Files to create:**
- `app/(tabs)/index.tsx`
- `components/dashboard/StatsCard.tsx`
- `components/dashboard/RevenueChart.tsx`

**Outcome:** Beautiful dashboard with analytics

---

### 🏠 **Phase 6: Properties** (Week 3-4)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Property list
- ✅ Property details
- ✅ Add/Edit property form
- ✅ Cloudinary image upload

**Files to create:**
- `app/(tabs)/properties.tsx`
- `app/property/[id].tsx`
- `components/property/PropertyCard.tsx`
- `components/property/ImageUploader.tsx`

**Outcome:** Full property management

---

### 📅 **Phase 7: Bookings** (Week 4-5)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Booking list
- ✅ Booking details
- ✅ Accept/Reject actions
- ✅ Payment tracking

**Files to create:**
- `app/(tabs)/bookings.tsx`
- `app/booking/[id].tsx`
- `components/booking/BookingCard.tsx`

**Outcome:** Complete booking management

---

### 👥 **Phase 8: Visits** (Week 5)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Visit requests list
- ✅ Visit details
- ✅ Google Meet integration
- ✅ Reschedule/Cancel

**Files to create:**
- `app/(tabs)/visits.tsx`
- `components/visit/VisitCard.tsx`

**Outcome:** Visit management system

---

### 💰 **Phase 9: Payments** (Week 5-6)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Payment dashboard
- ✅ Transaction list
- ✅ Revenue analytics
- ✅ Invoice generation

**Files to create:**
- `app/payments/index.tsx`
- `components/dashboard/RevenueChart.tsx`

**Outcome:** Financial tracking system

---

### 👤 **Phase 10: Profile** (Week 6)
**Status:** ⚪ Not Started

**What you'll build:**
- ✅ Profile screen
- ✅ Edit profile
- ✅ Verification status
- ✅ Settings

**Files to create:**
- `app/(tabs)/profile.tsx`
- `app/profile/edit.tsx`
- `app/settings/index.tsx`

**Outcome:** Complete profile management

---

## 📁 Project Structure Reference

```
StudentNest/
├── app/                          # Screens (Expo Router)
│   ├── (auth)/                   # Auth screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── otp.tsx
│   ├── (tabs)/                   # Main tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard
│   │   ├── properties.tsx
│   │   ├── bookings.tsx
│   │   └── profile.tsx
│   ├── property/                 # Property screens
│   │   └── [id].tsx
│   └── _layout.tsx               # Root layout
│
├── components/                   # Reusable components
│   ├── ui/                       # Basic UI components
│   ├── property/                 # Property components
│   ├── booking/                  # Booking components
│   ├── visit/                    # Visit components
│   ├── dashboard/                # Dashboard components
│   └── shared/                   # Shared components
│
├── lib/                          # Core functionality
│   ├── api/                      # API integration
│   │   ├── client.ts             # Axios client
│   │   └── cloudinary.ts         # Cloudinary upload
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── constants/                # Constants
│       └── api-urls.ts
│
├── contexts/                     # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   └── useUpload.ts
│
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── property.ts
│   ├── booking.ts
│   └── api.ts
│
├── constants/                    # App constants
│   └── theme.ts
│
├── assets/                       # Static assets
│   └── images/
│
├── .env                          # Environment variables
├── app.json                      # Expo config
├── package.json
└── tsconfig.json
```

---

## 🎯 Current Priority: Phase 1

### What to Build First (This Week)

#### Day 1-2: Theme System
1. Create `constants/theme.ts` ✅
2. Create `contexts/ThemeContext.tsx` ✅
3. Implement dark/light mode ✅
4. Test theme switching ✅

#### Day 3-4: Type Definitions & Utils
1. Create all type files ✅
2. Create formatters ✅
3. Create validators ✅
4. Create helpers ✅

#### Day 5: Testing
1. Create theme test screen ✅
2. Test all utilities ✅
3. Verify theme on different screens ✅

---

## 🔗 API Endpoints Available

The backend API is already running at: `https://student-nest-for.vercel.app/api`

### Authentication
```
POST /api/auth/login
POST /api/auth/owner/signup
POST /api/otp/email/send
POST /api/otp/email/verify
GET  /api/auth/me
```

### Properties
```
GET  /api/properties/my-properties
POST /api/rooms
PUT  /api/rooms/[id]
GET  /api/rooms/[id]
```

### Bookings
```
GET  /api/bookings
GET  /api/bookings/[id]
POST /api/bookings/[id]/actions
```

### Visits
```
GET  /api/visit-requests
PUT  /api/visit-requests/[id]
```

### Meetings
```
GET  /api/meetings
PUT  /api/meetings/[id]
```

### Payments
```
GET  /api/payments/statistics
```

### Profile
```
GET  /api/profile/owner
PUT  /api/profile/owner
```

---

## 📚 Helpful Resources

### Documentation
- **Main README:** `README.md` - Complete overview
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md` - Code examples
- **Phase 1 Guide:** `PHASE_1_SETUP.md` - Detailed Phase 1 tasks

### Backend Reference
- **API Base:** `https://student-nest-for.vercel.app`
- **Environment:** `.env.local` in student-nest-new folder
- **Cloudinary:** Already configured with credentials

### Expo Documentation
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

## ✅ Phase 1 Checklist

Before moving to Phase 2, ensure:

- [ ] Theme system works (dark/light/system)
- [ ] All type definitions created
- [ ] Utility functions created and tested
- [ ] Folder structure matches the plan
- [ ] No TypeScript errors
- [ ] App runs on iOS/Android
- [ ] Environment variables configured
- [ ] Dependencies installed

---

## 🆘 Common Issues & Solutions

### Issue: Module not found
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### Issue: TypeScript errors
```bash
# Solution: Check tsconfig.json paths
# Ensure paths mapping is correct:
"paths": { "@/*": ["./"] }
```

### Issue: Theme not applying
```bash
# Solution: Verify ThemeProvider wraps the app
# Check app/_layout.tsx has ThemeProvider
```

---

## 🚀 Start Building!

1. **Read:** `PHASE_1_SETUP.md` for detailed instructions
2. **Build:** Create theme system first
3. **Test:** Verify everything works
4. **Move on:** Proceed to Phase 2

---

## 📞 Need Help?

- Check `IMPLEMENTATION_GUIDE.md` for code examples
- Review student-nest-new frontend for reference
- Contact: ronakkumarsingh23@lpu.in

---

**Good luck building! 🎉**
