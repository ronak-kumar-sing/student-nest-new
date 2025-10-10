/**
 * Application Types
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner';
  avatar?: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

// Authentication Types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'owner';
  phone?: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'room' | 'hostel';
  owner: User;
  location: Location;
  price: PriceDetails;
  features: PropertyFeatures;
  media: MediaItem[];
  availability: AvailabilityDetails;
  rules: PropertyRules;
  status: 'available' | 'pending' | 'rented';
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  landmarks?: string[];
}

export interface PriceDetails {
  monthly: number;
  deposit: number;
  utilities: boolean;
  maintenanceIncluded: boolean;
  maintenanceFee?: number;
  negotiable: boolean;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  airConditioned: boolean;
  parking: boolean;
  wifi: boolean;
  kitchen: 'private' | 'shared' | 'none';
  laundry: 'in-unit' | 'shared' | 'none';
  studyArea: boolean;
  securitySystem: boolean;
  amenities: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface AvailabilityDetails {
  availableFrom: string;
  minimumStay: number;
  maximumStay?: number;
  currentlyAvailable: boolean;
  showingSchedule?: ShowingSchedule;
}

export interface ShowingSchedule {
  available: boolean;
  preferredTimes: string[];
  notes?: string;
}

export interface PropertyRules {
  gender: 'any' | 'male' | 'female';
  smoking: boolean;
  pets: boolean;
  guests: boolean;
  quiet: boolean;
  additionalRules?: string[];
}

// Booking Types
export interface Booking {
  id: string;
  property: Property;
  tenant: User;
  owner: User;
  status: BookingStatus;
  dates: BookingDates;
  payment: PaymentDetails;
  documents: Document[];
  communication: Message[];
}

export type BookingStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'active'
  | 'completed';

export interface BookingDates {
  moveIn: string;
  moveOut?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
}

export interface PaymentDetails {
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  depositPaid: boolean;
  depositAmount: number;
  monthlyRent: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface Document {
  id: string;
  type: 'id' | 'proof_of_income' | 'student_id' | 'other';
  name: string;
  url: string;
  verified: boolean;
  uploadedAt: string;
}

// Communication Types
export interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string;
  type: 'text' | 'image' | 'document';
  attachments?: MediaItem[];
  read: boolean;
  sentAt: string;
  readAt?: string;
}

// Search and Filter Types
export interface SearchFilters {
  location?: {
    city?: string;
    state?: string;
    radius?: number;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price?: {
    min?: number;
    max?: number;
  };
  propertyType?: ('apartment' | 'house' | 'room' | 'hostel')[];
  features?: Partial<PropertyFeatures>;
  availability?: {
    from?: string;
    minStay?: number;
    maxStay?: number;
  };
  rules?: Partial<PropertyRules>;
  sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'relevance';
}

// Review Types
export interface Review {
  id: string;
  property: Property;
  reviewer: User;
  rating: number;
  content: string;
  images?: MediaItem[];
  categories: {
    location: number;
    cleanliness: number;
    communication: number;
    accuracy: number;
    value: number;
  };
  createdAt: string;
  updatedAt: string;
  helpful: number;
  reported: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  user: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export type NotificationType =
  | 'booking_request'
  | 'booking_approved'
  | 'booking_rejected'
  | 'message_received'
  | 'payment_reminder'
  | 'document_verified'
  | 'property_update'
  | 'system';