// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Room Types
export interface Room {
  id: string; // API returns 'id', not '_id'
  _id?: string; // For backwards compatibility
  title: string;
  description: string;
  price: number;
  type: 'single' | 'double' | 'triple' | 'dormitory' | 'studio' | 'apartment';
  roomType?: string; // API may return this
  accommodationType?: string;
  capacity: number;
  amenities: string[];
  images: string[];
  location: {
    address: string;
    fullAddress?: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    nearbyUniversities?: string[];
    nearbyFacilities?: string[];
  };
  owner: {
    id: string;
    _id?: string;
    name: string;
    avatar?: string;
    phone?: string;
    email?: string;
    isVerified?: boolean;
  };
  availability: 'available' | 'occupied' | 'maintenance';
  isActive: boolean;
  rating: number;
  reviewCount: number;
  nearbyColleges: string[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomFilters {
  minPrice?: number;
  maxPrice?: number;
  type?: string[];
  amenities?: string[];
  city?: string;
  availability?: string;
  sortBy?: 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Booking Types
export interface Booking {
  _id: string;
  room: Room;
  student: User;
  owner: User;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  monthlyRent: number;
  securityDeposit: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'message' | 'system';
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// Room Sharing Types
export interface RoomSharing {
  id: string;
  _id: string;
  property: Room;
  initiator: {
    _id?: string;
    id?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    profilePhoto?: string;
    isVerified?: boolean;
  };
  status: 'active' | 'full' | 'closed' | 'expired';
  maxParticipants: number;
  currentParticipants: {
    user: {
      _id?: string;
      fullName?: string;
      profilePhoto?: string;
    };
    joinedAt?: string;
  }[];
  description?: string;
  requirements?: {
    gender?: 'male' | 'female' | 'any';
    lifestyle?: string[];
    preferences?: string[];
    ageRange?: { min?: number; max?: number };
  };
  costSharing?: {
    rentPerPerson: number;
    securityDepositPerPerson?: number;
    depositPerPerson?: number;
    utilitiesIncluded?: boolean;
  };
  availableFrom: string;
  availableTill?: string;
  houseRules?: string[];
  contactPreferences?: {
    showPhone: boolean;
    showEmail: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoomSharingApplication {
  _id: string;
  roomShare: RoomSharing | string;
  applicant: User;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  appliedAt: string;
  respondedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

// Navigation Types
export type RootStackParamList = {
  index: undefined;
  '(auth)/login': undefined;
  '(auth)/signup': undefined;
  '(tabs)': undefined;
  'room/[id]': { id: string };
};
