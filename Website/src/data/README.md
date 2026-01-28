# Demo Data Documentation

## Overview

This directory contains comprehensive demo data for the Student Nest platform in JSON format. All data follows the TypeScript type definitions from `/src/types/index.ts` and represents realistic scenarios for a student housing platform in Delhi, India.

## Files

### 1. `demo-students.json`
**Contains:** 5 student profiles

**Students Included:**
- **Priya Sharma** - IIT Delhi, B.Tech CSE (3rd year) - Verified ✓
- **Rahul Verma** - DU Ramjas College, B.A. Economics (2nd year) - Verified ✓
- **Sneha Thakur** - AIIMS Delhi, MBBS (1st year) - Verified ✓
- **Amit Kumar** - JNU, M.A. Political Science (1st year) - Pending verification
- **Neha Gupta** - NIFT Delhi, B.Des Fashion Design (2nd year) - Verified ✓

**Key Features:**
- Complete profile information with photos (Pravatar)
- Verification status (email, phone, identity)
- Student preferences (budget, location, amenities)
- Saved properties and view history
- Profile completeness scores

### 2. `demo-owners.json`
**Contains:** 3 property owner profiles

**Owners Included:**
- **Rajesh Mehta** - Individual, 10 years experience (Model Town) - 3 properties
- **Sunita Kapoor** - Individual, 8 years experience (Satya Niketan) - 2 properties, Girls only
- **Vikas Sharma** - Company (SmartStay Properties), 5 years experience (Hauz Khas) - 3 properties

**Key Features:**
- Different business types (individual, company)
- Aadhaar verification with Digilocker integration
- Business stats (revenue, ratings, response times)
- Property portfolio management
- GST details for company entities

### 3. `demo-rooms.json`
**Contains:** 6 property listings

**Properties by Type:**
- **Single Rooms:** 3 properties (₹12,000 - ₹14,000)
- **Shared Rooms:** 2 properties (₹7,500 - ₹11,000)
- **Studio:** 1 property (₹18,000)

**Locations Covered:**
- Model Town (DU North Campus area)
- GTB Nagar (DU North Campus area)
- Satya Niketan (DU South Campus area)
- Hauz Khas (IIT Delhi/JNU area)

**Key Features:**
- Complete location data with coordinates (lat/lng)
- Nearby universities with distance/commute time
- Nearby facilities (metro, hospitals, markets)
- Detailed amenities and room features
- High-quality image placeholders
- Room rules and preferences
- Realistic pricing with deposits and maintenance

### 4. `demo-bookings.json`
**Contains:** 3 booking records

**Booking States:**
- **Confirmed:** student_001 → room_001 (Move-in: Feb 2026, 11 months)
- **Active:** student_003 → room_004 (Jan-Jul 2026, 6 months)
- **Completed:** student_002 → room_002 (Dec 2025-Jan 2026, 1 month)

**Key Features:**
- Payment tracking (partial, paid, refunded)
- Check-in/check-out details with meter readings
- Agreement documents
- Student and owner notes
- Security deposit handling
- Extension requests support

### 5. `demo-reviews.json`
**Contains:** 4 property reviews

**Review Types:**
- **Verified reviews:** From actual bookings (reviews_001, review_002)
- **Inspection reviews:** From property visits (review_003, review_004)

**Key Features:**
- Overall ratings (4.2 - 5.0 stars)
- Category-wise ratings (cleanliness, location, facilities, owner, value)
- Detailed comments with context
- Helpful votes from other users
- Owner responses to reviews
- Review images/photos

### 6. `demo-meetings.json`
**Contains:** 5 meeting records

**Meeting Types:**
- **Virtual meetings:** 2 meetings with Google Meet links
- **In-person visits:** 3 property inspections

**Meeting Statuses:**
- **Completed:** 3 meetings with notes
- **Scheduled:** 2 upcoming meetings

**Key Features:**
- Scheduled date/time and duration
- Meeting links for virtual meetings
- Detailed notes about discussions
- Student-owner-property relationship tracking

## Data Relationships

```
Students (5)
├── student_001 (Priya) → Booking → room_001 (Rajesh's PG)
├── student_002 (Rahul) → Completed Booking → room_002 (Rajesh's Shared)
├── student_003 (Sneha) → Active Booking → room_004 (Sunita's Girls PG)
├── student_004 (Amit)  → Scheduled Meeting → room_002
└── student_005 (Neha)  → Review → room_006 (Vikas's Studio)

Owners (3)
├── owner_001 (Rajesh)  → Properties: room_001, room_002, room_003
├── owner_002 (Sunita)  → Properties: room_004, room_005
└── owner_003 (Vikas)   → Properties: room_006, room_007, room_008

Reviews (4)
├── review_001 → room_004 by student_003 (Verified, 4.8★)
├── review_002 → room_002 by student_002 (Verified, 4.2★)
├── review_003 → room_001 by student_001 (Inspection, 4.7★)
└── review_004 → room_006 by student_005 (Inspection, 5.0★)
```

## Usage

### Importing Data

```typescript
// Import demo data
import studentsData from '@/data/demo-students.json';
import ownersData from '@/data/demo-owners.json';
import roomsData from '@/data/demo-rooms.json';
import bookingsData from '@/data/demo-bookings.json';
import reviewsData from '@/data/demo-reviews.json';
import meetingsData from '@/data/demo-meetings.json';

// Use in components
const students = studentsData.students;
const rooms = roomsData.rooms;
```

### Seeding Database

```typescript
// Example seed script
import { connectDB } from '@/lib/db';
import Student from '@/lib/models/Student';
import Owner from '@/lib/models/Owner';
import Room from '@/lib/models/Room';
import studentsData from '@/data/demo-students.json';

async function seedDatabase() {
  await connectDB();
  
  // Clear existing data
  await Student.deleteMany({});
  await Owner.deleteMany({});
  await Room.deleteMany({});
  
  // Insert demo data
  await Student.insertMany(studentsData.students);
  await Owner.insertMany(ownersData.owners);
  await Room.insertMany(roomsData.rooms);
  
  console.log('Database seeded successfully!');
}
```

## Data Quality

### Realistic Details
- ✅ Real college names and courses
- ✅ Actual Delhi localities and pincodes
- ✅ Realistic pricing for Delhi market (₹7,500 - ₹18,000/month)
- ✅ Accurate metro stations and distances
- ✅ Proper phone number formats (+91)
- ✅ Realistic email domains (@iitdelhi.ac.in, @du.ac.in, etc.)

### Completeness
- ✅ All required fields populated
- ✅ Optional fields included where relevant
- ✅ Timestamps in ISO 8601 format
- ✅ Consistent ID references across entities
- ✅ Proper enum values matching TypeScript types

### Diversity
- ✅ Different student years (1st to 3rd year)
- ✅ Various budget ranges (₹4K - ₹20K)
- ✅ Multiple room types (single, shared, studio)
- ✅ Different owner types (individual, company)
- ✅ Male, female, and any gender preferences
- ✅ Various localities across Delhi

## Notes

1. **Image Placeholders:** All image URLs use `/demo-rooms/` prefix. Replace with actual images before production.

2. **Sensitive Data:** Aadhaar numbers are masked (****-****-XXXX). Use test data only.

3. **Coordinates:** Latitude/longitude are approximate for the areas mentioned.

4. **Avatars:** Using Pravatar.cc for profile photos (dummy images).

5. **IDs:** All IDs follow pattern `{entity}_{number}` for easy reference in demo.

6. **Dates:** Most dates are future dates (2026) to show active/upcoming scenarios.

## Extending Demo Data

To add more demo data:

1. Follow the TypeScript interfaces in `/src/types/index.ts`
2. Maintain ID consistency across files
3. Use realistic values for Delhi/NCR region
4. Add appropriate relationships (student → booking → room → owner)
5. Include variety in statuses and states

## Production Considerations

Before using in production:

- [ ] Replace all image URLs with real property photos
- [ ] Update coordinates with exact property locations
- [ ] Remove or mask sensitive information (Aadhaar, phone)
- [ ] Update dates to current/future dates
- [ ] Replace Google Meet links with actual meeting system
- [ ] Add more properties for better variety
- [ ] Include more reviews for social proof
- [ ] Add payment gateway test/production credentials

---

**Last Updated:** January 28, 2026
**Total Entities:** 26 records across 6 JSON files
**Coverage:** Students, Owners, Rooms, Bookings, Reviews, Meetings
