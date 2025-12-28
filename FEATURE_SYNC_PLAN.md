# 🔄 StudentNest - Feature Sync Plan (Website ↔ Mobile App)

## 📊 Current Status Analysis

### ✅ Features Present in BOTH Platforms

| Feature | Website | Mobile App | Status |
|---------|---------|------------|--------|
| Authentication (Login/Signup) | ✅ | ✅ | Complete |
| Room Browsing | ✅ | ✅ | Complete |
| Room Search with Filters | ✅ | ✅ | Complete |
| Room Details View | ✅ | ✅ | Complete |
| Bookings Management | ✅ | ✅ | Complete |
| Save/Favorite Rooms | ✅ | ✅ | Complete |
| Profile Management | ✅ | ✅ | Complete |
| Room Sharing (Basic) | ✅ | ✅ | Complete |
| OTP Verification | ✅ | ✅ | Complete |
| **Map View** | ✅ | ✅ | **ADDED** |
| **Negotiations** | ✅ | ✅ | **ADDED** |
| **Visit Scheduling** | ✅ | ✅ | **ADDED** |
| **Notifications** | ✅ | ✅ | **ADDED** |

---

## ✅ COMPLETED - Issues Fixed

### Issue #1: Rooms Not Loading in App ✅
**Fixed:**
- Updated API URL from port 3001 to 3000 (matching Next.js server)
- Added proper response format handling for both `data` array and `data.rooms` formats
- Added error handling with retry functionality
- Added debug logging for development

### Issue #2: No Map View for Rooms ✅
**Added:**
- Created `components/map/RoomsMap.tsx` - Interactive map with room markers
- Map view modal accessible from Home screen (map button)
- Map view accessible from Search screen (Map button)
- Custom price markers on map
- Room preview card when marker is tapped
- User location support

---

## ✅ COMPLETED - Features Added to Mobile App

### 1. Map View ✅
**Files Created:**
- `components/map/RoomsMap.tsx` - Full map component with markers

**Integration:**
- Added to Home screen header (orange map button)
- Added to Search screen (Map button next to Filters)

### 2. Price Negotiations ✅
**Files Created:**
- `app/negotiations/index.tsx` - List all negotiations with status tabs
- `components/negotiations/NegotiationModal.tsx` - Create new negotiation

**Features:**
- View all negotiations with status (pending/accepted/rejected/countered)
- Accept counter offers
- Quick price suggestions (5%, 10%, 15%, 20% off)
- Negotiation tips

### 3. Visit Scheduling ✅
**Files Created:**
- `app/visits/index.tsx` - List all scheduled visits
- `components/visits/ScheduleVisitModal.tsx` - Schedule new visit

**Features:**
- View upcoming and past visits
- Cancel pending visits
- Date and time picker
- Owner contact info when confirmed

### 4. Notifications Center ✅
**Files Created:**
- `app/notifications/index.tsx` - Full notifications screen

**Features:**
- View all notifications
- Mark as read / Mark all as read
- Navigation to related content
- Type-specific icons and colors

### 5. Profile Quick Links ✅
**Updated:**
- Added Activity section with links to Negotiations, Visits, Saved, Room Sharing
- Bell icon now goes to notifications screen

---

## 📱 Mobile App - Missing Features

### 🔴 HIGH PRIORITY (Must Add)

#### 1. Price Negotiations
**Files to Create:**
- `app/negotiations/index.tsx` - List negotiations
- `app/negotiations/[id].tsx` - Negotiation details
- `app/negotiations/create.tsx` - Create negotiation
- `components/negotiations/NegotiationCard.tsx`
- `components/negotiations/NegotiationModal.tsx`

**API Endpoints (Already in api.ts):**
- `negotiationsApi.getAll()`
- `negotiationsApi.create()`
- `negotiationsApi.respond()`

#### 2. Visit Scheduling
**Files to Create:**
- `app/visits/index.tsx` - My visit requests
- `components/room/ScheduleVisitModal.tsx`

**API Endpoints (Already in api.ts):**
- `visitRequestsApi.getAll()`
- `visitRequestsApi.create()`
- `visitRequestsApi.cancel()`
- `visitRequestsApi.respond()`

#### 3. Map View for Rooms
**Files to Create:**
- `components/map/RoomsMap.tsx`
- `app/(tabs)/map.tsx` - New tab for map view

**Dependencies to Add:**
- `react-native-maps`
- `expo-location`

#### 4. Owner Dashboard
**Files to Create:**
- `app/owner/index.tsx` - Owner dashboard
- `app/owner/properties/index.tsx` - List properties
- `app/owner/properties/create.tsx` - Post new property
- `app/owner/properties/[id]/edit.tsx` - Edit property
- `app/owner/bookings/index.tsx` - Booking requests
- `app/owner/visits/index.tsx` - Visit requests

#### 5. Notifications Center
**Files to Create:**
- `app/notifications/index.tsx` - Full notifications list
- `components/notifications/NotificationItem.tsx`
- Update notification badge in header

### 🟡 MEDIUM PRIORITY

#### 6. Payment History
**Files to Create:**
- `app/payments/index.tsx` - Payment history
- `components/payments/PaymentCard.tsx`

#### 7. Identity Verification
**Files to Create:**
- `app/verification/index.tsx`
- `components/verification/DigilockerConnect.tsx`
- `components/verification/DocumentUpload.tsx`

#### 8. Dashboard Statistics
**Files to Create:**
- `components/dashboard/StatsCard.tsx`
- Update `app/(tabs)/index.tsx` with stats section

### 🟢 LOW PRIORITY

#### 9. Reviews System
**Files to Create:**
- `components/room/ReviewsList.tsx`
- `components/room/WriteReviewModal.tsx`

---

## 🌐 Website - Missing Features (From App)

The website has more features than the app. No major features missing.

---

## 📋 Step-by-Step Implementation Plan

### Phase 1: Fix Critical Issues (Day 1)
- [ ] **Step 1.1:** Fix API URL configuration
- [ ] **Step 1.2:** Test rooms endpoint
- [ ] **Step 1.3:** Debug data loading issue
- [ ] **Step 1.4:** Verify rooms display

### Phase 2: Add Map View (Day 1-2)
- [ ] **Step 2.1:** Install react-native-maps
- [ ] **Step 2.2:** Install expo-location
- [ ] **Step 2.3:** Create RoomsMap component
- [ ] **Step 2.4:** Add map toggle to search screen
- [ ] **Step 2.5:** Add map tab or button

### Phase 3: Negotiations Feature (Day 2-3)
- [ ] **Step 3.1:** Create negotiations screens
- [ ] **Step 3.2:** Add negotiation modal to room details
- [ ] **Step 3.3:** Test full negotiation flow

### Phase 4: Visit Scheduling (Day 3)
- [ ] **Step 4.1:** Create visit scheduling modal
- [ ] **Step 4.2:** Create visits list screen
- [ ] **Step 4.3:** Add to room details

### Phase 5: Owner Dashboard (Day 4-5)
- [ ] **Step 5.1:** Create owner dashboard home
- [ ] **Step 5.2:** Create properties management
- [ ] **Step 5.3:** Create post property form
- [ ] **Step 5.4:** Create booking requests screen
- [ ] **Step 5.5:** Role-based navigation

### Phase 6: Notifications (Day 5)
- [ ] **Step 6.1:** Create notifications screen
- [ ] **Step 6.2:** Add push notification support
- [ ] **Step 6.3:** Badge count integration

### Phase 7: Polish & Testing (Day 6)
- [ ] **Step 7.1:** End-to-end testing
- [ ] **Step 7.2:** UI/UX polish
- [ ] **Step 7.3:** Performance optimization

---

## 🔧 Technical Requirements

### New Dependencies for App
```json
{
  "react-native-maps": "^1.10.0",
  "expo-location": "^16.0.0"
}
```

### Environment Variables
```
EXPO_PUBLIC_API_URL=http://your-server-ip:3001/api
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
```

---

## 📁 Proposed New File Structure

```
StudentNestApp/
├── app/
│   ├── (tabs)/
│   │   ├── map.tsx              # NEW: Map view tab
│   │   └── ...existing
│   ├── negotiations/            # NEW
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── create.tsx
│   ├── visits/                  # NEW
│   │   └── index.tsx
│   ├── notifications/           # NEW
│   │   └── index.tsx
│   ├── payments/                # NEW
│   │   └── index.tsx
│   ├── owner/                   # NEW
│   │   ├── index.tsx
│   │   ├── properties/
│   │   │   ├── index.tsx
│   │   │   ├── create.tsx
│   │   │   └── [id]/
│   │   │       └── edit.tsx
│   │   ├── bookings/
│   │   │   └── index.tsx
│   │   └── visits/
│   │       └── index.tsx
│   └── verification/            # NEW
│       └── index.tsx
├── components/
│   ├── map/                     # NEW
│   │   └── RoomsMap.tsx
│   ├── negotiations/            # NEW
│   │   ├── NegotiationCard.tsx
│   │   └── NegotiationModal.tsx
│   ├── visits/                  # NEW
│   │   └── ScheduleVisitModal.tsx
│   ├── notifications/           # NEW
│   │   └── NotificationItem.tsx
│   └── owner/                   # NEW
│       ├── PropertyCard.tsx
│       └── BookingRequestCard.tsx
```

---

## 🚀 Quick Commands

### Start Backend Server (Website folder)
```bash
cd Website
npm run dev
```

### Start Mobile App
```bash
cd StudentNestApp
npx expo start
```

### Test API
```bash
curl http://localhost:3000/api/rooms
```

---

## 📝 Notes

1. **API Already Exists:** Most API functions are already defined in `lib/api.ts` for both platforms
2. **Backend Ready:** The website backend already supports all features
3. **Main Gap:** The app UI/screens are missing, not the API layer
4. **Same Backend:** Both platforms use the same backend API

---

## ✅ Completion Checklist

- [ ] All rooms loading correctly
- [ ] Map view working
- [ ] Negotiations functional
- [ ] Visit scheduling working
- [ ] Owner dashboard complete
- [ ] Notifications working
- [ ] All features tested
- [ ] Documentation updated
