# Room Sharing Feature - Complete Implementation Guide

## Overview
The Room Sharing feature allows students to find compatible roommates to share accommodation costs. This feature includes creating room sharing posts, browsing available rooms, applying to join, managing applications, and matching based on preferences.

## Backend API Analysis

### Base URL
```
https://student-nest-for.vercel.app/api
```

### Key API Endpoints

#### 1. **GET /room-sharing** - Get All Room Sharing Listings
```typescript
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- gender: 'male' | 'female' | 'any'
- maxBudget: number
- city: string
- status: 'active' | 'full'

Response:
{
  success: true,
  data: {
    shares: RoomShare[],
    requests: RoomShare[], // alias
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

#### 2. **POST /room-sharing** - Create Room Sharing Request
```typescript
Request Body:
{
  propertyId: string,
  maxParticipants: number (1-5),
  requirements: {
    gender: 'male' | 'female' | 'any',
    ageRange: { min: number, max: number },
    preferences: string[], // occupation types
    lifestyle: string[], // lifestyle preferences
    studyHabits: 'Focused' | 'Balanced' | 'Serious' | 'Flexible'
  },
  costSharing: {
    monthlyRent: number,
    rentPerPerson: number,
    securityDeposit: number,
    depositPerPerson: number,
    maintenanceCharges: number,
    maintenancePerPerson: number,
    utilitiesIncluded: boolean,
    utilitiesPerPerson: number
  },
  description: string,
  roomConfiguration: {
    totalBeds: number,
    bedsAvailable: number,
    hasPrivateBathroom: boolean,
    hasSharedKitchen: boolean,
    hasStudyArea: boolean,
    hasStorage: boolean
  },
  availableFrom: Date,
  duration: string, // e.g., "6 months"
  houseRules: string[],
  contact: {
    phone: string,
    whatsappAvailable: boolean,
    preferredContactTime: string
  }
}

Response:
{
  success: true,
  data: {
    id: string,
    message: "Room sharing request created successfully"
  }
}
```

#### 3. **GET /room-sharing/{id}** - Get Single Room Share Details
```typescript
Response:
{
  success: true,
  data: {
    id: string,
    status: 'active' | 'full' | 'closed',
    property: Property,
    initiator: User,
    maxParticipants: number,
    currentParticipants: Participant[],
    costSharing: CostSharing,
    requirements: Requirements,
    roomConfiguration: RoomConfig,
    description: string,
    availableFrom: Date,
    houseRules: string[],
    applications: Application[],
    views: number,
    createdAt: Date
  }
}
```

#### 4. **POST /room-sharing/{id}/apply** - Apply to Join Room Share
```typescript
Request Body:
{
  message: string,
  moveInDate: Date
}

Response:
{
  success: true,
  message: "Application submitted successfully"
}
```

#### 5. **GET /room-sharing/applications** - Get My Applications
```typescript
Response:
{
  success: true,
  data: {
    applications: Application[]
  }
}
```

#### 6. **PUT /room-sharing/applications/{id}** - Respond to Application
```typescript
Request Body:
{
  action: 'accept' | 'reject',
  message?: string
}

Response:
{
  success: true,
  message: "Application accepted/rejected"
}
```

#### 7. **GET /room-sharing/my-shares** - Get My Room Shares
```typescript
Query Parameters:
- status: 'active' | 'full' | 'closed'

Response:
{
  success: true,
  data: {
    shares: RoomShare[]
  }
}
```

#### 8. **PUT /room-sharing/{id}/deactivate** - Deactivate Room Share
```typescript
Response:
{
  success: true,
  message: "Room share deactivated"
}
```

#### 9. **GET /room-sharing/statistics** - Get Statistics
```typescript
Response:
{
  success: true,
  data: {
    totalShares: number,
    activeShares: number,
    myApplications: number,
    matchedApplications: number
  }
}
```

## Data Models

### RoomShare Interface
```typescript
interface RoomShare {
  id: string;
  _id: string;
  status: 'active' | 'full' | 'closed';
  property: Property;
  initiator: User;
  maxParticipants: number;
  currentParticipants: Participant[];
  costSharing: CostSharing;
  requirements: Requirements;
  roomConfiguration: RoomConfiguration;
  description: string;
  availableFrom: Date;
  availableTill?: Date;
  duration: string;
  houseRules: string[];
  contact: Contact;
  views: number;
  applications: Application[];
  createdAt: Date;
  updatedAt: Date;
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

interface CostSharing {
  monthlyRent: number;
  rentPerPerson: number;
  securityDeposit: number;
  depositPerPerson: number;
  maintenanceCharges: number;
  maintenancePerPerson: number;
  utilitiesIncluded: boolean;
  utilitiesPerPerson: number;
}

interface Requirements {
  gender: 'male' | 'female' | 'any';
  ageRange: { min: number; max: number };
  preferences: string[]; // occupations
  lifestyle: string[];
  studyHabits: 'Focused' | 'Balanced' | 'Serious' | 'Flexible';
}

interface RoomConfiguration {
  totalBeds: number;
  bedsAvailable: number;
  hasPrivateBathroom: boolean;
  hasSharedKitchen: boolean;
  hasStudyArea: boolean;
  hasStorage: boolean;
}

interface Contact {
  phone: string;
  whatsappAvailable: boolean;
  preferredContactTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

interface Participant {
  user: User;
  sharedAmount: number;
  status: 'pending' | 'confirmed' | 'rejected';
  joinedAt: Date;
}

interface Application {
  id: string;
  applicant: User;
  message: string;
  moveInDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}
```

## Mobile App Implementation

### Phase 1: Type Definitions & API Client

#### 1.1 Create Type Definitions
**File:** `src/types/roomSharing.ts`

```typescript
export interface RoomShare {
  id: string;
  _id: string;
  status: 'active' | 'full' | 'closed';
  property: any; // Import Property type
  initiator: any; // Import User type
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
```

#### 1.2 Add API Methods
**File:** `src/services/api.ts` (Add to existing API client)

```typescript
import {
  RoomShare,
  CreateRoomShareData,
  RoomSharingFilters,
  Application
} from '@/types/roomSharing';

class API {
  // ... existing methods ...

  // ============================================
  // ROOM SHARING METHODS
  // ============================================

  /**
   * Get all room sharing listings with filters
   */
  async getRoomShares(filters?: RoomSharingFilters): Promise<{
    shares: RoomShare[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.gender) queryParams.append('gender', filters.gender);
    if (filters?.maxBudget) queryParams.append('maxBudget', filters.maxBudget.toString());
    if (filters?.city) queryParams.append('city', filters.city);
    if (filters?.status) queryParams.append('status', filters.status);

    const query = queryParams.toString();
    const endpoint = query ? `/room-sharing?${query}` : '/room-sharing';

    const response = await this.request<{
      shares: RoomShare[];
      requests: RoomShare[];
      total: number;
      page: number;
      totalPages: number;
    }>(endpoint);

    return {
      shares: response.data.shares || response.data.requests,
      total: response.data.total,
      page: response.data.page,
      totalPages: response.data.totalPages
    };
  }

  /**
   * Get single room share details
   */
  async getRoomShareById(id: string): Promise<RoomShare> {
    const response = await this.request<RoomShare>(`/room-sharing/${id}`);
    return response.data;
  }

  /**
   * Create new room sharing request
   */
  async createRoomShare(propertyId: string, data: Partial<CreateRoomShareData>): Promise<{
    id: string;
    message: string;
  }> {
    // Calculate required fields
    const maxParticipants = data.maxParticipants || 2;
    const rentPerPerson = data.costSharing?.rentPerPerson || 0;
    const totalRent = rentPerPerson * maxParticipants;
    const securityDeposit = data.costSharing?.securityDeposit || totalRent;

    // Map habits to studyHabits
    let studyHabitsValue: 'Focused' | 'Balanced' | 'Serious' | 'Flexible' = 'Balanced';
    const habits = data.requirements?.lifestyle || [];
    if (habits.includes('Studious')) studyHabitsValue = 'Focused';
    else if (habits.includes('Working Professional')) studyHabitsValue = 'Serious';
    else if (habits.includes('Freelancer')) studyHabitsValue = 'Flexible';

    const payload = {
      propertyId,
      maxParticipants,
      requirements: {
        gender: data.requirements?.gender || 'any',
        ageRange: data.requirements?.ageRange || { min: 18, max: 35 },
        preferences: data.requirements?.preferences || [],
        lifestyle: data.requirements?.lifestyle || [],
        studyHabits: studyHabitsValue
      },
      costSharing: {
        monthlyRent: totalRent,
        rentPerPerson: rentPerPerson,
        securityDeposit: securityDeposit,
        depositPerPerson: Math.ceil(securityDeposit / maxParticipants),
        maintenanceCharges: data.costSharing?.maintenanceCharges || 0,
        maintenancePerPerson: data.costSharing?.maintenanceCharges
          ? Math.ceil(data.costSharing.maintenanceCharges / maxParticipants)
          : 0,
        utilitiesIncluded: data.costSharing?.utilitiesIncluded || false,
        utilitiesPerPerson: data.costSharing?.utilitiesPerPerson || 0
      },
      description: data.description || '',
      roomConfiguration: {
        totalBeds: maxParticipants,
        bedsAvailable: maxParticipants - 1,
        hasPrivateBathroom: data.roomConfiguration?.hasPrivateBathroom || false,
        hasSharedKitchen: data.roomConfiguration?.hasSharedKitchen || true,
        hasStudyArea: data.roomConfiguration?.hasStudyArea || false,
        hasStorage: data.roomConfiguration?.hasStorage || false
      },
      availableFrom: data.availableFrom || new Date().toISOString(),
      duration: data.duration || '6 months',
      houseRules: data.houseRules || [],
      contact: data.contact || {
        phone: '',
        whatsappAvailable: true,
        preferredContactTime: 'evening'
      }
    };

    const response = await this.request<{ id: string; message: string }>(
      '/room-sharing',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    return response.data;
  }

  /**
   * Apply to join a room share
   */
  async applyToRoomShare(shareId: string, message: string, moveInDate: string): Promise<void> {
    await this.request(`/room-sharing/${shareId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message, moveInDate })
    });
  }

  /**
   * Get my room sharing applications
   */
  async getMyRoomSharingApplications(): Promise<Application[]> {
    const response = await this.request<{ applications: Application[] }>(
      '/room-sharing/applications'
    );
    return response.data.applications;
  }

  /**
   * Respond to a room sharing application (accept/reject)
   */
  async respondToApplication(
    applicationId: string,
    action: 'accept' | 'reject',
    message?: string
  ): Promise<void> {
    await this.request(`/room-sharing/applications/${applicationId}`, {
      method: 'PUT',
      body: JSON.stringify({ action, message })
    });
  }

  /**
   * Get my room shares (posted by me)
   */
  async getMyRoomShares(status?: 'active' | 'full' | 'closed'): Promise<RoomShare[]> {
    const query = status ? `?status=${status}` : '';
    const response = await this.request<{ shares: RoomShare[] }>(
      `/room-sharing/my-shares${query}`
    );
    return response.data.shares;
  }

  /**
   * Deactivate a room share
   */
  async deactivateRoomShare(shareId: string): Promise<void> {
    await this.request(`/room-sharing/${shareId}/deactivate`, {
      method: 'PUT'
    });
  }

  /**
   * Get room sharing statistics
   */
  async getRoomSharingStats(): Promise<{
    totalShares: number;
    activeShares: number;
    myApplications: number;
    matchedApplications: number;
  }> {
    const response = await this.request<{
      totalShares: number;
      activeShares: number;
      myApplications: number;
      matchedApplications: number;
    }>('/room-sharing/statistics');
    return response.data;
  }
}

export const api = new API();
```

### Phase 2: Screen Components

#### 2.1 Room Sharing List Screen
**File:** `src/app/(tabs)/room-sharing/index.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/services/api';
import { RoomShare, RoomSharingFilters } from '@/types/roomSharing';
import { Ionicons } from '@expo/vector-icons';

export default function RoomSharingScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomShares, setRoomShares] = useState<RoomShare[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<RoomSharingFilters>({
    page: 1,
    limit: 20
  });

  const loadRoomShares = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const currentPage = refresh ? 1 : page;
      const response = await api.getRoomShares({
        ...filters,
        page: currentPage
      });

      if (refresh) {
        setRoomShares(response.shares);
      } else {
        setRoomShares(prev => [...prev, ...response.shares]);
      }

      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading room shares:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoomShares();
  }, [page]);

  const handleRefresh = () => {
    loadRoomShares(true);
  };

  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const renderRoomShareCard = ({ item }: { item: RoomShare }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => router.push(`/room-sharing/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Property Image */}
      <Image
        source={{
          uri: item.property?.images?.[0] || 'https://via.placeholder.com/400x200'
        }}
        style={styles.propertyImage}
        resizeMode="cover"
      />

      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        { backgroundColor: item.status === 'active' ? '#10B981' : '#F59E0B' }
      ]}>
        <Text style={styles.statusText}>
          {item.sharing.availableSlots} slot{item.sharing.availableSlots !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.propertyTitle, { color: theme.colors.text }]}>
          {item.property?.title || 'Room Share Available'}
        </Text>

        <Text style={[styles.location, { color: theme.colors.textSecondary }]}>
          <Ionicons name="location-outline" size={14} />
          {' '}{item.property?.location?.city || 'Location not specified'}
        </Text>

        {/* Cost Info */}
        <View style={styles.costRow}>
          <View style={styles.costItem}>
            <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Rent/Person
            </Text>
            <Text style={[styles.costValue, { color: theme.colors.primary }]}>
              ₹{item.cost.rentPerPerson.toLocaleString()}/mo
            </Text>
          </View>

          <View style={styles.costItem}>
            <Text style={[styles.costLabel, { color: theme.colors.textSecondary }]}>
              Deposit/Person
            </Text>
            <Text style={[styles.costValue, { color: theme.colors.text }]}>
              ₹{item.cost.depositPerPerson.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.preferencesRow}>
          <View style={[styles.preferenceBadge, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="people-outline" size={14} color={theme.colors.text} />
            <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
              {item.sharing.currentParticipants}/{item.maxParticipants}
            </Text>
          </View>

          <View style={[styles.preferenceBadge, { backgroundColor: theme.colors.background }]}>
            <Ionicons
              name={item.requirements.gender === 'male' ? 'male' :
                    item.requirements.gender === 'female' ? 'female' : 'male-female'}
              size={14}
              color={theme.colors.text}
            />
            <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
              {item.requirements.gender === 'any' ? 'Any' : item.requirements.gender}
            </Text>
          </View>

          <View style={[styles.preferenceBadge, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text} />
            <Text style={[styles.preferenceText, { color: theme.colors.text }]}>
              {item.duration}
            </Text>
          </View>
        </View>

        {/* Posted By */}
        <View style={styles.initiatorRow}>
          <Image
            source={{
              uri: item.initiator?.profilePhoto || 'https://via.placeholder.com/40'
            }}
            style={styles.initiatorPhoto}
          />
          <Text style={[styles.initiatorName, { color: theme.colors.textSecondary }]}>
            Posted by {item.initiator?.fullName || 'Student'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Room Sharing
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Find compatible roommates
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/room-sharing/create')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {roomShares.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Available
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && page === 1) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="home-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          No room shares available
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          Be the first to create a room sharing post!
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={roomShares}
        renderItem={renderRoomShareCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  costItem: {
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferencesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  preferenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  preferenceText: {
    fontSize: 12,
  },
  initiatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  initiatorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  initiatorName: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
```

---

## Next Steps

1. **Create Room Share Screen** (`/room-sharing/create.tsx`)
2. **Room Share Details Screen** (`/room-sharing/[id].tsx`)
3. **My Applications Screen** (`/room-sharing/applications.tsx`)
4. **My Posted Shares Screen** (`/room-sharing/my-shares.tsx`)

Would you like me to continue with these screens?
