# 📡 API Reference - StudentNest Mobile

Complete API documentation for integrating with the student-nest-new backend.

**Base URL:** `https://student-nest-for.vercel.app/api`
**Local Dev:** `http://localhost:3000/api`

---

## 🔐 Authentication

All authenticated requests require a Bearer token in the Authorization header:

```typescript
Authorization: Bearer <access_token>
```

---

## 🔑 Auth Endpoints

### 1. Owner Login

**Endpoint:** `POST /auth/login`

**Request:**
```typescript
{
  email: string;
  password: string;
  role: "owner"; // Required
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: "owner";
      isVerified: boolean;
      isIdentityVerified: boolean;
    },
    token: string;
    refreshToken: string;
  }
}
```

**Example:**
```typescript
const response = await apiClient.post('/auth/login', {
  email: 'owner@example.com',
  password: 'Password123!',
  role: 'owner'
});
```

---

### 2. Owner Signup

**Endpoint:** `POST /auth/owner/signup`

**Request:**
```typescript
{
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Registration successful. Please verify your email.",
  data: {
    userId: string;
  }
}
```

---

### 3. Send OTP (Email)

**Endpoint:** `POST /otp/email/send`

**Request:**
```typescript
{
  email: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "OTP sent to your email"
}
```

---

### 4. Verify OTP (Email)

**Endpoint:** `POST /otp/email/verify`

**Request:**
```typescript
{
  email: string;
  otp: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Email verified successfully"
}
```

---

### 5. Get Current User

**Endpoint:** `GET /auth/me`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: "owner";
      isVerified: boolean;
      isIdentityVerified: boolean;
      avatar?: string;
    }
  }
}
```

---

### 6. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    accessToken: string;
  }
}
```

---

### 7. Logout

**Endpoint:** `POST /auth/logout`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  message: "Logged out successfully"
}
```

---

## 🏠 Property Endpoints

### 1. Get My Properties

**Endpoint:** `GET /properties/my-properties`
**Auth Required:** Yes

**Query Parameters:**
```typescript
status?: 'active' | 'inactive' | 'pending';
page?: number;
limit?: number;
```

**Response:**
```typescript
{
  success: true,
  data: {
    properties: [{
      _id: string;
      title: string;
      description: string;
      propertyType: 'pg' | 'hostel' | 'flat' | 'apartment';
      address: string;
      city: string;
      state: string;
      pincode: string;
      images: string[];
      monthlyRent: number;
      securityDeposit: number;
      amenities: string[];
      rules: string[];
      totalRooms: number;
      availableRooms: number;
      status: 'active' | 'inactive' | 'pending';
      createdAt: string;
      updatedAt: string;
    }],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}
```

---

### 2. Get Property by ID

**Endpoint:** `GET /rooms/:id`
**Auth Required:** Optional

**Response:**
```typescript
{
  success: true,
  data: {
    room: {
      _id: string;
      title: string;
      description: string;
      propertyType: string;
      location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        coordinates: { lat: number; lng: number; }
      };
      images: string[];
      pricing: {
        monthlyRent: number;
        securityDeposit: number;
      };
      amenities: string[];
      rules: string[];
      capacity: {
        totalRooms: number;
        availableRooms: number;
      };
      owner: {
        _id: string;
        name: string;
        phone: string;
        email: string;
      };
      status: string;
      createdAt: string;
    }
  }
}
```

---

### 3. Create Property

**Endpoint:** `POST /rooms`
**Auth Required:** Yes

**Request:**
```typescript
{
  title: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'flat' | 'apartment';
  address: string;
  city: string;
  state: string;
  pincode: string;
  monthlyRent: number;
  securityDeposit: number;
  amenities: string[];
  rules: string[];
  totalRooms: number;
  images: string[]; // Cloudinary URLs
  coordinates?: { lat: number; lng: number; }
}
```

**Response:**
```typescript
{
  success: true,
  message: "Property created successfully",
  data: {
    propertyId: string;
  }
}
```

---

### 4. Update Property

**Endpoint:** `PUT /rooms/:id`
**Auth Required:** Yes

**Request:** Same as Create Property

**Response:**
```typescript
{
  success: true,
  message: "Property updated successfully"
}
```

---

### 5. Delete Property

**Endpoint:** `DELETE /rooms/:id`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  message: "Property deleted successfully"
}
```

---

## 📅 Booking Endpoints

### 1. Get All Bookings (Owner)

**Endpoint:** `GET /bookings`
**Auth Required:** Yes

**Query Parameters:**
```typescript
status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
page?: number;
limit?: number;
```

**Response:**
```typescript
{
  success: true,
  data: {
    bookings: [{
      _id: string;
      student: {
        _id: string;
        name: string;
        email: string;
        phone: string;
      };
      room: {
        _id: string;
        title: string;
        address: string;
      };
      financial: {
        monthlyRent: number;
        securityDeposit: number;
        totalAmount: number;
        paymentStatus: 'pending' | 'partial' | 'completed';
      };
      moveInDate: string;
      duration: number;
      status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
      timeline: {
        createdAt: string;
        updatedAt: string;
        confirmedAt?: string;
        rejectedAt?: string;
      };
    }]
  }
}
```

---

### 2. Get Booking Details

**Endpoint:** `GET /bookings/:id`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    booking: {
      // Same structure as booking in list
      // Plus additional details
    }
  }
}
```

---

### 3. Accept/Reject Booking

**Endpoint:** `POST /bookings/:id/actions`
**Auth Required:** Yes

**Request:**
```typescript
{
  action: 'accept' | 'reject';
  reason?: string; // Required for reject
  moveInDate?: string; // Optional for accept
}
```

**Response:**
```typescript
{
  success: true,
  message: "Booking accepted/rejected successfully"
}
```

---

## 👥 Visit Request Endpoints

### 1. Get Visit Requests

**Endpoint:** `GET /visit-requests`
**Auth Required:** Yes

**Query Parameters:**
```typescript
status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
```

**Response:**
```typescript
{
  success: true,
  data: {
    visits: [{
      _id: string;
      student: {
        _id: string;
        name: string;
        email: string;
        phone: string;
      };
      property: {
        _id: string;
        title: string;
        address: string;
      };
      scheduledDate: string;
      scheduledTime: string;
      status: string;
      meetingLink?: string;
      createdAt: string;
    }]
  }
}
```

---

### 2. Update Visit Status

**Endpoint:** `PUT /visit-requests/:id`
**Auth Required:** Yes

**Request:**
```typescript
{
  status: 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  newDate?: string;
  newTime?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Visit request updated successfully"
}
```

---

## 📞 Meeting Endpoints

### 1. Get Meetings

**Endpoint:** `GET /meetings`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    meetings: [{
      _id: string;
      student: {
        _id: string;
        name: string;
        email: string;
      };
      property: {
        _id: string;
        title: string;
      };
      scheduledDate: string;
      scheduledTime: string;
      meetingLink: string;
      status: 'scheduled' | 'completed' | 'cancelled';
      createdAt: string;
    }]
  }
}
```

---

### 2. Update Meeting Status

**Endpoint:** `PUT /meetings/:id`
**Auth Required:** Yes

**Request:**
```typescript
{
  status: 'completed' | 'cancelled';
}
```

**Response:**
```typescript
{
  success: true,
  message: "Meeting updated successfully"
}
```

---

## 💰 Payment Endpoints

### 1. Get Payment Statistics

**Endpoint:** `GET /payments/statistics`
**Auth Required:** Yes

**Query Parameters:**
```typescript
period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
startDate?: string;
endDate?: string;
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    revenueByMonth: [{
      month: string;
      revenue: number;
    }];
    recentTransactions: [{
      _id: string;
      amount: number;
      status: string;
      date: string;
      booking: {
        _id: string;
        student: string;
        property: string;
      };
    }];
  }
}
```

---

### 2. Get Payment Details

**Endpoint:** `GET /payments/:id`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    payment: {
      _id: string;
      amount: number;
      status: 'pending' | 'completed' | 'failed';
      method: string;
      transactionId: string;
      booking: {
        _id: string;
        student: object;
        property: object;
      };
      createdAt: string;
    }
  }
}
```

---

## 👤 Profile Endpoints

### 1. Get Owner Profile

**Endpoint:** `GET /profile/owner`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    profile: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      avatar?: string;
      bio?: string;
      address?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
      };
      verification: {
        isVerified: boolean;
        idType?: string;
        idNumber?: string;
        documents?: string[];
        status: 'pending' | 'verified' | 'rejected';
      };
      stats: {
        totalProperties: number;
        activeBookings: number;
        totalRevenue: number;
      };
      createdAt: string;
    }
  }
}
```

---

### 2. Update Owner Profile

**Endpoint:** `PUT /profile/owner`
**Auth Required:** Yes

**Request:**
```typescript
{
  name?: string;
  phone?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  avatar?: string;
}
```

**Response:**
```typescript
{
  success: true,
  message: "Profile updated successfully"
}
```

---

## 📤 Upload Endpoints

### 1. Upload Single Image

**Endpoint:** `POST /upload`
**Auth Required:** Yes
**Content-Type:** `multipart/form-data`

**Request:**
```typescript
FormData {
  file: File;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    url: string;
    publicId: string;
  }
}
```

---

### 2. Upload Property Images

**Endpoint:** `POST /upload/property`
**Auth Required:** Yes
**Content-Type:** `multipart/form-data`

**Request:**
```typescript
FormData {
  files: File[];
  propertyId: string;
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    urls: string[];
  }
}
```

---

## ✅ Verification Endpoints

### 1. Get Verification Status

**Endpoint:** `GET /verification`
**Auth Required:** Yes

**Response:**
```typescript
{
  success: true,
  data: {
    verification: {
      status: 'pending' | 'verified' | 'rejected';
      idType?: string;
      idNumber?: string;
      documents: string[];
      submittedAt?: string;
      verifiedAt?: string;
      rejectedReason?: string;
    }
  }
}
```

---

### 2. Submit Verification

**Endpoint:** `POST /verification`
**Auth Required:** Yes

**Request:**
```typescript
{
  idType: 'aadhaar' | 'pan' | 'passport' | 'driving_license';
  idNumber: string;
  documents: string[]; // Cloudinary URLs
}
```

**Response:**
```typescript
{
  success: true,
  message: "Verification submitted successfully"
}
```

---

## 🔄 Error Responses

All endpoints may return error responses in this format:

```typescript
{
  success: false,
  error: string;
  message?: string;
  details?: any;
}
```

### Common Error Codes

- **400** - Bad Request (validation error)
- **401** - Unauthorized (not authenticated)
- **403** - Forbidden (not authorized)
- **404** - Not Found
- **429** - Too Many Requests (rate limit)
- **500** - Internal Server Error

---

## 📝 Notes

### Rate Limiting
- Most endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Upload endpoints: 10 requests per 15 minutes

### Pagination
Default pagination for list endpoints:
- `page`: 1
- `limit`: 20
- `maxLimit`: 100

### Date Formats
All dates are in ISO 8601 format: `2025-01-10T10:30:00Z`

### Image URLs
All image URLs are Cloudinary URLs in format:
`https://res.cloudinary.com/dyvv2furt/image/upload/...`

---

## 🔧 API Client Example

```typescript
// lib/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

**Last Updated:** January 2025
**Version:** 1.0.0
