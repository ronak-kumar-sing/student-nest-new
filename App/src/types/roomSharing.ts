/**
 * Room Sharing Feature - Type Definitions
 * Complete TypeScript interfaces for the room sharing system
 */

export interface RoomShare {
  id: string;
  _id: string;
  status: 'active' | 'full' | 'closed';
  property: any; // Property type from main types
  initiator: any; // User type from main types
  maxParticipants: number;
  currentParticipants: Participant[];
  costSharing: CostSharing;
  requirements: Requirements;
  roomConfiguration: RoomConfiguration;
  description: string;
  availableFrom: string;
  availableTill?: string;
  duration: string;
  houseRules: string[];
  contact: Contact;
  views: number;
  applications: Application[];
  createdAt: string;
  updatedAt: string;
  sharing: {
    maxParticipants: number;
    currentParticipants: number;
    availableSlots: number;
    isFull: boolean;
  };
  cost: {
    rentPerPerson: number;
    depositPerPerson: number;
    utilitiesIncluded: boolean;
    utilitiesPerPerson: number;
  };
}

export interface CostSharing {
  monthlyRent: number;
  rentPerPerson: number;
  securityDeposit: number;
  depositPerPerson: number;
  maintenanceCharges: number;
  maintenancePerPerson: number;
  utilitiesIncluded: boolean;
  utilitiesPerPerson: number;
}

export interface Requirements {
  gender: 'male' | 'female' | 'any';
  ageRange: { min: number; max: number };
  preferences: string[];
  lifestyle: string[];
  studyHabits: 'Focused' | 'Balanced' | 'Serious' | 'Flexible';
}

export interface RoomConfiguration {
  totalBeds: number;
  bedsAvailable: number;
  hasPrivateBathroom: boolean;
  hasSharedKitchen: boolean;
  hasStudyArea: boolean;
  hasStorage: boolean;
}

export interface Contact {
  phone: string;
  whatsappAvailable: boolean;
  preferredContactTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface Participant {
  user: any;
  sharedAmount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  joinedAt: string;
}

export interface Application {
  id: string;
  _id: string;
  applicant: any;
  message: string;
  moveInDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  roomShare?: RoomShare;
}

export interface CreateRoomShareData {
  propertyId: string;
  maxParticipants: number;
  requirements: Requirements;
  costSharing: Omit<CostSharing, 'depositPerPerson' | 'maintenancePerPerson'>;
  description: string;
  roomConfiguration: RoomConfiguration;
  availableFrom: string;
  duration: string;
  houseRules: string[];
  contact: Contact;
}

export interface RoomSharingFilters {
  page?: number;
  limit?: number;
  gender?: 'male' | 'female' | 'any';
  maxBudget?: number;
  city?: string;
  status?: 'active' | 'full';
}

// Constants for form options
export const LIFESTYLE_OPTIONS = [
  'Early Bird',
  'Night Owl',
  'Social',
  'Quiet',
  'Clean & Organized',
  'Fitness Enthusiast',
  'Foodie',
  'Minimalist',
  'Pet Lover'
];

export const HABIT_OPTIONS = [
  'Non-Smoker',
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan',
  'No Alcohol',
  'Studious',
  'Working Professional',
  'Freelancer'
];

export const OCCUPATION_OPTIONS = [
  'Student',
  'Working Professional',
  'Freelancer',
  'Entrepreneur',
  'Any'
];

export const STUDY_HABITS: ('Focused' | 'Balanced' | 'Serious' | 'Flexible')[] = [
  'Focused',
  'Balanced',
  'Serious',
  'Flexible'
];

export const CONTACT_TIME_OPTIONS: Contact['preferredContactTime'][] = [
  'morning',
  'afternoon',
  'evening',
  'anytime'
];

export const CONTACT_TIME_LABELS: Record<Contact['preferredContactTime'], string> = {
  morning: 'Morning (6 AM - 12 PM)',
  afternoon: 'Afternoon (12 PM - 5 PM)',
  evening: 'Evening (5 PM - 9 PM)',
  anytime: 'Anytime'
};

export const DURATION_OPTIONS = [
  '3 months',
  '6 months',
  '9 months',
  '12 months',
  '18 months',
  '24 months'
];
