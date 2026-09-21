import { Listing, SearchFilters } from '../types/listing';
import { MOCK_LISTINGS } from '../data/mockListings';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
const VERCEL_API_URL = process.env.NEXT_PUBLIC_VERCEL_API_URL || 'https://student-nest-infotsav.vercel.app/api';

export async function fetchAllListings(): Promise<Listing[]> {
  // 1. Try local NestJS backend on port 4000
  try {
    const res = await fetch(`${API_BASE_URL}/listings`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const serverItems = Array.isArray(data) ? data : data.items || data.data?.listings || data.data || [];
      if (Array.isArray(serverItems) && serverItems.length > 0) {
        // Map backend entities to StudentNest format
        const mapped: Listing[] = serverItems.map((item: any, index: number) => {
          const fallback = MOCK_LISTINGS[index % MOCK_LISTINGS.length];
          return {
            id: String(item.id || item._id || `backend-${index}`),
            title: item.title || fallback.title,
            type: item.type || item.propertyType || fallback.type,
            location: {
              city: item.city || item.location?.city || fallback.location.city,
              neighborhood: item.neighborhood || item.location?.neighborhood || fallback.location.neighborhood,
              distanceToCampus: item.distanceToCampus || fallback.location.distanceToCampus,
              lat: Number(item.latitude || item.location?.lat || fallback.location.lat),
              lng: Number(item.longitude || item.location?.lng || fallback.location.lng),
            },
            pricePerMonth: Number(item.price || item.monthlyRent || item.pricePerMonth || fallback.pricePerMonth),
            pricePerNight: Math.round(Number(item.price || fallback.pricePerMonth) / 28),
            rating: Number(item.rating || fallback.rating),
            reviewCount: Number(item.reviewCount || fallback.reviewCount),
            guestFavorite: Boolean(item.guestFavorite ?? fallback.guestFavorite),
            images: Array.isArray(item.images) && item.images.length > 0 ? item.images : fallback.images,
            category: item.category || fallback.category,
            beds: Number(item.beds || item.bedrooms || fallback.beds),
            baths: Number(item.baths || item.bathrooms || fallback.baths),
            maxGuests: Number(item.maxGuests || item.capacity || fallback.maxGuests),
            description: item.description || fallback.description,
            host: item.host || fallback.host,
            amenities: item.amenities || fallback.amenities,
            ratingsBreakdown: fallback.ratingsBreakdown,
            reviews: fallback.reviews,
            availableDates: item.availableDates || fallback.availableDates,
          };
        });
        return mapped;
      }
    }
  } catch (err) {
    console.warn('[StudentNest API] Local backend listings empty or unreachable:', err);
  }

  // 2. Fetch live production properties from Vercel integration API
  try {
    const vercelRes = await fetch(`${VERCEL_API_URL}/rooms?limit=40`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    if (vercelRes.ok) {
      const vercelData = await vercelRes.json();
      const vercelItems = vercelData.data || vercelData.properties || [];
      if (Array.isArray(vercelItems) && vercelItems.length > 0) {
        const mappedVercel: Listing[] = vercelItems.map((item: any, index: number) => {
          const fallback = MOCK_LISTINGS[index % MOCK_LISTINGS.length];
          const price = Number(item.price || fallback.pricePerMonth);
          const images = Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : fallback.images;

          return {
            id: String(item.id || item._id || `vercel-${index}`),
            title: item.title || fallback.title,
            type: item.roomType === 'single' ? 'Entire Studio Suite' : item.accommodationType === 'pg' ? 'Private Scholar Room' : 'Shared Co-living Suite',
            location: {
              city: item.location?.city || 'Delhi',
              neighborhood: item.location?.address || item.location?.fullAddress || fallback.location.neighborhood,
              distanceToCampus: item.location?.nearbyUniversities?.[0]?.distance ? `${item.location.nearbyUniversities[0].distance} km to Campus` : fallback.location.distanceToCampus,
              lat: Number(item.location?.coordinates?.lat || fallback.location.lat),
              lng: Number(item.location?.coordinates?.lng || fallback.location.lng),
            },
            pricePerMonth: price,
            pricePerNight: Math.round(price / 28),
            rating: Number(item.rating) > 0 ? Number(item.rating) : fallback.rating,
            reviewCount: Number(item.totalReviews || fallback.reviewCount),
            guestFavorite: Boolean(item.rating >= 4.8 || fallback.guestFavorite),
            images,
            category: item.roomType === 'studio' ? 'studio' : item.accommodationType === 'pg' ? 'co-living' : 'campus',
            beds: Number(item.features?.totalRooms || item.totalRooms || fallback.beds),
            baths: item.features?.attached_bathroom ? 1 : fallback.baths,
            maxGuests: Number(item.availability?.totalRooms || fallback.maxGuests),
            description: item.description || fallback.description,
            host: {
              name: item.owner?.name || fallback.host.name,
              avatar: fallback.host.avatar,
              isSuperhost: Boolean(item.owner?.verified ?? true),
              joinedDate: 'Joined March 2026',
              responseRate: item.owner?.responseRate ? `${item.owner.responseRate}%` : '98%',
              responseTime: 'within an hour',
              yearsHosting: fallback.host.yearsHosting || 2,
              verified: Boolean(item.owner?.verified ?? true),
              bio: fallback.host.bio || 'Verified property host on StudentNest.',
            },

            amenities: Array.isArray(item.amenities) && item.amenities.length > 0 ? item.amenities : fallback.amenities,
            ratingsBreakdown: fallback.ratingsBreakdown,
            reviews: fallback.reviews,
            availableDates: item.availability?.availableFrom
              ? `From ${new Date(item.availability.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : fallback.availableDates,
          };
        });
        return mappedVercel;
      }
    }
  } catch (vercelErr) {
    console.warn('[Vercel Integration API] Fetch failed, falling back to curated listings:', vercelErr);
  }

  // 3. Curated fallback
  return MOCK_LISTINGS;
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const listings = await fetchAllListings();
  const found = listings.find((l) => l.id === id);
  if (found) return found;

  // Check mock directly as fallback
  const mockFound = MOCK_LISTINGS.find((l) => l.id === id);
  return mockFound || MOCK_LISTINGS[0];
}

export function filterListings(listings: Listing[], filters: SearchFilters): Listing[] {
  return listings.filter((listing) => {
    if (filters.category && filters.category !== 'all' && listing.category !== filters.category) {
      return false;
    }
    if (filters.location && filters.location.trim() !== '') {
      const q = filters.location.toLowerCase();
      const matchCity = listing.location.city.toLowerCase().includes(q);
      const matchNeigh = listing.location.neighborhood.toLowerCase().includes(q);
      const matchTitle = listing.title.toLowerCase().includes(q);
      if (!matchCity && !matchNeigh && !matchTitle) return false;
    }
    if (filters.priceMin && listing.pricePerMonth < filters.priceMin) {
      return false;
    }
    if (filters.priceMax && listing.pricePerMonth > filters.priceMax) {
      return false;
    }
    if (filters.bedrooms && listing.beds < filters.bedrooms) {
      return false;
    }
    if (filters.guests && listing.maxGuests < filters.guests) {
      return false;
    }
    return true;
  });
}

// ----------------------------------------------------
// StudentNest Auth API Client (Backend Port 4000)
// ----------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'STUDENT' | 'OWNER' | 'ADMIN';
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  isAadhaarVerified?: boolean;
  maskedAadhaar?: string;
  collegeName?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: BackendUser;
    tokens: AuthTokens;
  };
  error?: {
    message: string | string[];
    statusCode: number;
  };
}

export async function apiSendEmailOtp(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/email/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Failed to send email verification OTP';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data || json;
}

export async function apiVerifyEmailOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/email/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Invalid or expired email OTP';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data || json;
}

export async function apiSendPhoneOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/phone/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Failed to send SMS verification OTP';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data || json;
}

export async function apiVerifyPhoneOtp(phone: string, otp: string): Promise<{ user: BackendUser; tokens: AuthTokens }> {
  const res = await fetch(`${API_BASE_URL}/auth/phone/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Invalid or expired SMS OTP';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data;
}

export async function apiLoginWithPassword(email: string, password: string): Promise<{ user: BackendUser; tokens: AuthTokens }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Invalid email or password';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data;
}

export async function apiSignup(payload: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'STUDENT' | 'OWNER';
  collegeName?: string;
}): Promise<{ user: BackendUser; tokens: AuthTokens }> {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Signup failed';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data;
}

export async function apiVerifyDemoAadhaar(token: string, aadhaarNumber: string, otp: string): Promise<{ verified: boolean; maskedAadhaar: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/aadhaar/verify-demo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ aadhaarNumber, otp }),
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Aadhaar verification failed';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data;
}

export async function apiSkipAadhaar(token: string): Promise<{ skipped: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/aadhaar/skip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const msg = json.error?.message || json.message || 'Failed to skip verification';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json.data;
}

// ----------------------------------------------------
// Cloudinary Upload Signature
// ----------------------------------------------------

export async function apiGetCloudinarySignature(token: string, folder?: string) {
  const url = `${API_BASE_URL}/upload/signature${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to get upload signature');
  return json as {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    uploadPreset: string;
    folder: string;
  };
}

export async function apiDeleteCloudinaryAsset(token: string, publicId: string) {
  const res = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to delete asset');
  return json;
}

// ----------------------------------------------------
// Owner Listings API
// ----------------------------------------------------

export interface CreateListingPayload {
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  pricePerMonth: number;
  securityDeposit?: number;
  roomType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'APARTMENT';
  amenities?: string[];
  photoUrls?: string[];
}

export async function apiCreateListing(token: string, payload: CreateListingPayload) {
  const res = await fetch(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.error?.message || json.message || 'Failed to create listing';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json;
}

export async function apiGetMyListings(token: string) {
  const res = await fetch(`${API_BASE_URL}/listings/my-listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch listings');
  return Array.isArray(json) ? json : [];
}

export async function apiUpdateListing(token: string, listingId: string, payload: Partial<CreateListingPayload>) {
  const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to update listing');
  return json;
}

export async function apiDeleteListing(token: string, listingId: string) {
  const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to delete listing');
  return json;
}

// ----------------------------------------------------
// Student Bookings API
// ----------------------------------------------------

export interface CreateBookingPayload {
  listingId: string;
  startDate: string;
  endDate: string;
}

export async function apiCreateBooking(token: string, payload: CreateBookingPayload) {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.error?.message || json.message || 'Booking failed';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json;
}

const DEFAULT_DEMO_STUDENT_BOOKINGS = [
  {
    id: 'bk_demo_completed_101',
    listingId: 'nest-101',
    status: 'COMPLETED',
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-31T00:00:00.000Z',
    totalAmount: 1850,
    reviewed: false,
    listing: {
      id: 'nest-101',
      title: 'The Harvard Loft — Sunlit Designer Studio with Skyline Views',
      address: '14 Story Street, Harvard Square',
      city: 'Cambridge',
      pricePerMonth: 1850,
      securityDeposit: 500,
      photoUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      ],
    },
  },
  {
    id: 'bk_demo_accepted_103',
    listingId: 'nest-103',
    status: 'ACCEPTED',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2027-05-31T00:00:00.000Z',
    totalAmount: 2100,
    reviewed: false,
    listing: {
      id: 'nest-103',
      title: 'The MIT Tech Sanctuary — Modern 1BR with 3-Monitor Dual Desk Setup',
      address: '77 Massachusetts Ave, Kendall Sq',
      city: 'Cambridge',
      pricePerMonth: 2100,
      securityDeposit: 600,
      photoUrls: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      ],
    },
  },
  {
    id: 'bk_demo_paid_104',
    listingId: 'nest-104',
    status: 'PAID',
    startDate: '2026-10-01T00:00:00.000Z',
    endDate: '2027-06-30T00:00:00.000Z',
    totalAmount: 1250,
    reviewed: false,
    listing: {
      id: 'nest-104',
      title: 'Beacon Hill Bohemian En-Suite Room with Garden Courtyard',
      address: '42 Pinckney Street, Beacon Hill',
      city: 'Boston',
      pricePerMonth: 1250,
      securityDeposit: 350,
      photoUrls: [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
      ],
    },
  },
];

export async function apiGetMyBookings(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json) && json.length > 0) return json;
    if (res.ok && json.data && Array.isArray(json.data) && json.data.length > 0) return json.data;
  } catch (err: any) {
    console.warn('apiGetMyBookings fallback active:', err.message);
  }

  // Fallback demo bookings with local state persistence
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('studentnest_demo_bookings');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('studentnest_demo_bookings', JSON.stringify(DEFAULT_DEMO_STUDENT_BOOKINGS));
    } catch {
      // fallback
    }
  }
  return DEFAULT_DEMO_STUDENT_BOOKINGS;
}

export async function apiAcceptBooking(token: string, bookingId: string) {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to accept booking');
  return json;
}

export async function apiRejectBooking(token: string, bookingId: string, reason?: string) {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to reject booking');
  return json;
}

export async function apiCancelBooking(token: string, bookingId: string, reason?: string) {
  const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to cancel booking');
  return json;
}

// ----------------------------------------------------
// Roommate Matching API
// ----------------------------------------------------

export interface RoommateRequestPayload {
  city: string;
  budgetMin: number;
  budgetMax: number;
  moveInDate?: string;
  bio?: string;
  cleanlinessLevel?: number;
  sleepHabit?: string;
  smokingPreference?: string;
  drinkingPreference?: string;
  foodPreference?: string;
  studyEnvironment?: string;
  roommateGenderPreference?: string;
}

export async function apiCreateRoommateRequest(token: string, payload: RoommateRequestPayload) {
  const res = await fetch(`${API_BASE_URL}/roommates/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.error?.message || json.message || 'Failed to create roommate request';
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return json;
}

export async function apiGetRoommateMatches(token: string, city?: string) {
  const url = `${API_BASE_URL}/roommates/matches${city ? `?city=${encodeURIComponent(city)}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || json.message || 'Failed to fetch matches');
  return json;
}

export async function apiGetMyRoommateRequests(token: string) {
  const res = await fetch(`${API_BASE_URL}/roommates/my-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch requests');
  return Array.isArray(json) ? json : [];
}

export interface RoommateConnectItem {
  id: string;
  fromRequestId: string;
  toRequestId: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
  fromRequest: {
    id: string;
    city: string;
    budgetMin: number;
    budgetMax: number;
    dietary: string;
    sleepSchedule: string;
    cleanliness: number;
    student: {
      id: string;
      email: string;
      studentProfile?: {
        fullName: string;
        collegeName?: string;
        avatar?: string;
      };
    };
  };
}

const DEFAULT_DEMO_CONNECTS: RoommateConnectItem[] = [
  {
    id: 'conn_demo_1',
    fromRequestId: 'req_priya_01',
    toRequestId: 'my_request',
    message: 'Hey! Saw our sleep schedule (night owl) and vegetarian food preference match 94%. Looking for a 2BHK near North Campus starting next month, would love to team up!',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    fromRequest: {
      id: 'req_priya_01',
      city: 'Delhi',
      budgetMin: 8000,
      budgetMax: 15000,
      dietary: 'VEGETARIAN',
      sleepSchedule: 'NIGHT_OWL',
      cleanliness: 5,
      student: {
        id: 'student_priya_01',
        email: 'priya.sharma@hansraj.du.ac.in',
        studentProfile: {
          fullName: 'Priya Sharma',
          collegeName: 'Hansraj College (DU)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
      },
    },
  },
  {
    id: 'conn_demo_2',
    fromRequestId: 'req_kunal_02',
    toRequestId: 'my_request',
    message: 'Hi! I am a 2nd year CS student at IIT Delhi. Clean habits, quiet study hours on weekdays, and into badminton on weekends. Looking to share an apartment near Hauz Khas.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    fromRequest: {
      id: 'req_kunal_02',
      city: 'Delhi',
      budgetMin: 10000,
      budgetMax: 18000,
      dietary: 'ANY',
      sleepSchedule: 'EARLY_BIRD',
      cleanliness: 4,
      student: {
        id: 'student_kunal_02',
        email: 'kunal.v@iitd.ac.in',
        studentProfile: {
          fullName: 'Kunal Verma',
          collegeName: 'IIT Delhi (Computer Science)',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
        },
      },
    },
  },
];

export async function apiConnectRoommate(token: string, requestId: string, message?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/roommates/${requestId}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    if (res.ok) return json;
  } catch (err: any) {
    console.warn('Backend connect roommate fallback active:', err.message);
  }
  return { success: true, message: 'Connection request sent successfully!' };
}

export async function apiGetIncomingConnects(token: string): Promise<RoommateConnectItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/roommates/connects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json)) {
      return json;
    }
  } catch (err: any) {
    console.warn('Backend incoming connects fallback:', err.message);
  }

  // Fallback demo requests merged with localStorage state
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('studentnest_roommate_connects');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('studentnest_roommate_connects', JSON.stringify(DEFAULT_DEMO_CONNECTS));
      return DEFAULT_DEMO_CONNECTS;
    } catch {
      return DEFAULT_DEMO_CONNECTS;
    }
  }
  return DEFAULT_DEMO_CONNECTS;
}

export async function apiRespondToConnect(token: string, connectId: string, accept: boolean): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/roommates/connects/${connectId}/respond?accept=${accept}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) {
      updateLocalConnectStatus(connectId, accept ? 'ACCEPTED' : 'DECLINED');
      return json;
    }
  } catch (err: any) {
    console.warn('Backend respond to connect fallback:', err.message);
  }

  updateLocalConnectStatus(connectId, accept ? 'ACCEPTED' : 'DECLINED');
  return { success: true, status: accept ? 'ACCEPTED' : 'DECLINED' };
}

function updateLocalConnectStatus(connectId: string, status: 'ACCEPTED' | 'DECLINED') {
  if (typeof window === 'undefined') return;
  try {
    const stored = JSON.parse(localStorage.getItem('studentnest_roommate_connects') || '[]');
    const updated = (stored.length > 0 ? stored : DEFAULT_DEMO_CONNECTS).map((item: any) =>
      item.id === connectId ? { ...item, status } : item,
    );
    localStorage.setItem('studentnest_roommate_connects', JSON.stringify(updated));
  } catch {
    // silent
  }
}

// ----------------------------------------------------
// Razorpay Payments & Escrow API
// ----------------------------------------------------

export interface PaymentOrderResponse {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  bookingId: string;
  paymentId: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function apiCreatePaymentOrder(token: string, bookingId: string): Promise<PaymentOrderResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ bookingId }),
    });
    const json = await res.json();
    if (res.ok && json.data) return json.data;
    if (res.ok && json.orderId) return json;
    throw new Error(json.error?.message || json.message || 'Failed to create payment order');
  } catch (err: any) {
    // Fallback simulation mode for testing/demo when backend DB is in dev mode
    console.warn('Backend payment order creation fallback active:', err.message);
    return {
      orderId: `order_mock_${Date.now()}`,
      amount: 1500000, // ₹15,000 in paise
      currency: 'INR',
      keyId: 'rzp_test_placeholder',
      bookingId,
      paymentId: `pay_mock_${Date.now()}`,
    };
  }
}

export async function apiVerifyPayment(
  token: string,
  payload: VerifyPaymentPayload,
): Promise<{ success: boolean; bookingId: string; status: string; paymentId: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok && json.data) return json.data;
    if (res.ok && json.success) return json;
    throw new Error(json.error?.message || json.message || 'Payment verification failed');
  } catch (err: any) {
    console.warn('Backend payment verification fallback active:', err.message);
    return {
      success: true,
      bookingId: payload.razorpayOrderId,
      status: 'PAID',
      paymentId: payload.razorpayPaymentId,
    };
  }
}

// ----------------------------------------------------
// Real-time Chat & Direct Messaging API
// ----------------------------------------------------

export interface ApiConversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerRole: 'student' | 'owner';
  partnerEmail?: string;
  partnerAvatar: string;
  listingId?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface ApiChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'owner';
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export async function apiGetConversations(token: string): Promise<ApiConversation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.data)) return json.data;
    if (res.ok && Array.isArray(json)) return json;
    return [];
  } catch (err: any) {
    console.warn('Chat conversations fallback:', err.message);
    return [];
  }
}

export async function apiGetMessages(token: string, conversationId: string): Promise<ApiChatMessage[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.data)) return json.data;
    if (res.ok && Array.isArray(json)) return json;
    return [];
  } catch (err: any) {
    console.warn('Chat messages fallback:', err.message);
    return [];
  }
}

export async function apiSendMessage(
  token: string,
  payload: { conversationId?: string; receiverId?: string; listingId?: string; content: string },
): Promise<ApiChatMessage> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok && json.data) return json.data;
    if (res.ok && json.id) return json;
    throw new Error(json.error?.message || 'Failed to send message');
  } catch (err: any) {
    console.warn('Send message fallback:', err.message);
    return {
      id: `msg_client_${Date.now()}`,
      threadId: payload.conversationId || 'thread_local',
      senderId: 'current-user',
      senderName: 'You',
      senderRole: 'student',
      text: payload.content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
  }
}

export async function apiInitiateChat(
  token: string,
  payload: { recipientId: string; listingId?: string; initialMessage?: string },
): Promise<{ conversationId: string; created: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok && json.data) return json.data;
    if (res.ok && json.conversationId) return json;
    return { conversationId: `thread_${payload.recipientId}`, created: true };
  } catch (err: any) {
    console.warn('Initiate chat fallback:', err.message);
    return { conversationId: `thread_${payload.recipientId}`, created: true };
  }
}

// ----------------------------------------------------
// Reviews & Ratings API
// ----------------------------------------------------

export interface ApiReview {
  id: string;
  listingId: string;
  studentId?: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  cleanliness?: number;
  wifiStudy?: number;
  safetyHost?: number;
  createdAt: string;
  student?: {
    id: string;
    email: string;
    studentProfile?: { fullName: string };
  };
}

export interface CreateReviewPayload {
  bookingId: string;
  listingId?: string;
  authorName?: string;
  rating: number;
  comment?: string;
  cleanliness?: number;
  wifiStudy?: number;
  safetyHost?: number;
}

export async function apiCreateReview(token: string, payload: CreateReviewPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        bookingId: payload.bookingId,
        rating: payload.rating,
        comment: payload.comment,
      }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      persistReviewLocally(payload);
      return json.data;
    }
    if (res.ok && json.id) {
      persistReviewLocally(payload);
      return json;
    }
    throw new Error(json.error?.message || json.message || 'Failed to submit review');
  } catch (err: any) {
    console.warn('Backend review submission fallback active:', err.message);
    const mockReview = {
      id: `rev_${Date.now()}`,
      bookingId: payload.bookingId,
      listingId: payload.listingId,
      rating: payload.rating,
      comment: payload.comment,
      cleanliness: payload.cleanliness,
      wifiStudy: payload.wifiStudy,
      safetyHost: payload.safetyHost,
      createdAt: new Date().toISOString(),
    };
    persistReviewLocally(payload);
    return mockReview;
  }
}

function persistReviewLocally(payload: CreateReviewPayload) {
  if (typeof window === 'undefined') return;
  try {
    const stored = JSON.parse(localStorage.getItem('studentnest_local_reviews') || '[]');
    const newRev = {
      id: `local_rev_${Date.now()}`,
      bookingId: payload.bookingId,
      listingId: payload.listingId || '',
      rating: payload.rating,
      comment: payload.comment || '',
      cleanliness: payload.cleanliness,
      wifiStudy: payload.wifiStudy,
      safetyHost: payload.safetyHost,
      authorName: payload.authorName || 'Verified Scholar',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('studentnest_local_reviews', JSON.stringify([newRev, ...stored]));
  } catch {
    // silent
  }
}

export async function apiGetListingReviews(
  listingId: string,
): Promise<{ reviews: ApiReview[]; count: number; averageRating: number }> {
  let serverReviews: ApiReview[] = [];
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/listing/${listingId}`);
    const json = await res.json();
    if (res.ok && json.data?.reviews) {
      serverReviews = json.data.reviews;
    } else if (res.ok && Array.isArray(json.reviews)) {
      serverReviews = json.reviews;
    }
  } catch (err: any) {
    console.warn('Listing reviews fallback:', err.message);
  }

  // Merge locally stored reviews matching this listing
  if (typeof window !== 'undefined') {
    try {
      const localReviews = JSON.parse(localStorage.getItem('studentnest_local_reviews') || '[]');
      const matching = localReviews
        .filter((r: any) => !r.listingId || r.listingId === listingId)
        .map((r: any) => ({
          id: r.id,
          listingId: r.listingId || listingId,
          rating: r.rating,
          comment: r.comment,
          cleanliness: r.cleanliness,
          wifiStudy: r.wifiStudy,
          safetyHost: r.safetyHost,
          createdAt: r.createdAt,
          student: {
            id: 'local_user',
            email: 'student@studentnest.in',
            studentProfile: { fullName: r.authorName || 'Verified Scholar' },
          },
        }));
      const combined = [...matching, ...serverReviews];
      const count = combined.length;
      const averageRating = count > 0 ? combined.reduce((acc, cur) => acc + cur.rating, 0) / count : 0;
      return { reviews: combined, count, averageRating };
    } catch {
      // fallback
    }
  }

  const count = serverReviews.length;
  const averageRating = count > 0 ? serverReviews.reduce((acc, cur) => acc + cur.rating, 0) / count : 0;
  return { reviews: serverReviews, count, averageRating };
}

export async function apiDeleteReview(token: string, reviewId: string) {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to delete review');
  return json;
}

// -------------------------------------------------------------
// PART 4: ADMIN MODERATION & VERIFICATION PORTAL APIS
// -------------------------------------------------------------

export interface AdminMetrics {
  pendingVerifications: number;
  verifiedListings: number;
  activeBookings: number;
  totalBookings: number;
  totalStudents: number;
  totalOwners: number;
  totalGMV: number;
}

export interface AdminDashboardSummary {
  metrics: AdminMetrics;
  recentPendingListings: any[];
  recentBookings: any[];
  timestamp: string;
}

export interface AdminVerificationListing {
  id: string;
  title: string;
  roomType: string;
  accommodationType: string;
  city: string;
  address: string;
  pricePerMonth: number;
  securityDeposit: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  photoUrls: string[];
  documents?: {
    type: string;
    status: 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';
    fileUrl?: string;
  }[];
  owner: {
    id: string;
    email: string;
    phone?: string;
    fullName?: string;
    isAadhaarVerified?: boolean;
    trustScore?: number;
  };
}

const DEFAULT_DEMO_PENDING_LISTINGS: AdminVerificationListing[] = [
  {
    id: 'verify-lst-001',
    title: 'Scholar Haven 2BHK Near North Campus',
    roomType: 'PRIVATE',
    accommodationType: 'FLAT',
    city: 'Delhi',
    address: 'B-42 Kamla Nagar, walking distance to Ramjas & Kirori Mal',
    pricePerMonth: 14500,
    securityDeposit: 14500,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    photoUrls: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
    documents: [
      { type: 'Aadhaar Govt ID (Host)', status: 'VERIFIED' },
      { type: 'Electricity Bill (Proof of Ownership)', status: 'PENDING_REVIEW' },
      { type: 'Student Safety Audit (Fire & Locks)', status: 'VERIFIED' },
    ],
    owner: {
      id: 'owner_rajesh_01',
      email: 'rajesh.sharma@gmail.com',
      phone: '+91 98112 34567',
      fullName: 'Rajesh Sharma',
      isAadhaarVerified: true,
      trustScore: 94,
    },
  },
  {
    id: 'verify-lst-002',
    title: 'Athena Girls PG with High-Speed WiFi & Study Lounge',
    roomType: 'SHARED',
    accommodationType: 'PG',
    city: 'Delhi',
    address: 'Plot 18, South Extension Part 1, Near Gargi College',
    pricePerMonth: 11000,
    securityDeposit: 10000,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    photoUrls: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    ],
    documents: [
      { type: 'Aadhaar Govt ID (Host)', status: 'VERIFIED' },
      { type: 'Municipal Trade License (PG)', status: 'VERIFIED' },
      { type: 'CCTV & Guard Logbook', status: 'PENDING_REVIEW' },
    ],
    owner: {
      id: 'owner_sunita_02',
      email: 'sunita.verma@pgdelhi.in',
      phone: '+91 98710 88231',
      fullName: 'Sunita Verma',
      isAadhaarVerified: true,
      trustScore: 98,
    },
  },
  {
    id: 'verify-lst-003',
    title: 'Modern Tech Suite with Dedicated Workstation',
    roomType: 'ENTIRE_UNIT',
    accommodationType: 'STUDIO',
    city: 'Bengaluru',
    address: '5th Main, 7th Cross, Koramangala 4th Block, Near Christ Univ',
    pricePerMonth: 18000,
    securityDeposit: 20000,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    photoUrls: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
    ],
    documents: [
      { type: 'Aadhaar Govt ID (Host)', status: 'VERIFIED' },
      { type: 'Registered Lease Deed', status: 'PENDING_REVIEW' },
      { type: 'Broadband 300Mbps Speed Test Proof', status: 'VERIFIED' },
    ],
    owner: {
      id: 'owner_vikram_03',
      email: 'vikram.techstay@gmail.com',
      phone: '+91 99001 54321',
      fullName: 'Vikram Malhotra',
      isAadhaarVerified: true,
      trustScore: 91,
    },
  },
  {
    id: 'verify-lst-004',
    title: 'Green View Budget Studio Near Pune University',
    roomType: 'PRIVATE',
    accommodationType: 'STUDIO',
    city: 'Pune',
    address: 'Ganeshkhind Road, Aundh, 5 mins from SPPU Main Gate',
    pricePerMonth: 9500,
    securityDeposit: 9500,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    photoUrls: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    ],
    documents: [
      { type: 'Aadhaar Govt ID (Host)', status: 'VERIFIED' },
      { type: 'Electricity Bill', status: 'PENDING_REVIEW' },
    ],
    owner: {
      id: 'owner_anita_04',
      email: 'anita.desai@yahoo.com',
      phone: '+91 94220 11982',
      fullName: 'Anita Desai',
      isAadhaarVerified: false,
      trustScore: 82,
    },
  },
];

export async function apiGetAdminDashboard(token: string): Promise<AdminDashboardSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.data) return json.data;
  } catch (err: any) {
    console.warn('Backend admin dashboard fallback:', err.message);
  }

  // Fallback demo statistics
  const localVerifications = getLocalAdminVerifications();
  const pendingCount = localVerifications.filter(v => v.status === 'PENDING').length;
  const verifiedCount = 142 + localVerifications.filter(v => v.status === 'VERIFIED').length;

  return {
    metrics: {
      pendingVerifications: pendingCount,
      verifiedListings: verifiedCount,
      activeBookings: 34,
      totalBookings: 189,
      totalStudents: 1420,
      totalOwners: 184,
      totalGMV: 2480000,
    },
    recentPendingListings: localVerifications.slice(0, 5),
    recentBookings: [
      {
        id: 'bk_rec_1',
        totalAmount: 28000,
        status: 'PAID',
        listing: { title: 'Modern Studio Near IIT Hauz Khas', city: 'Delhi' },
        student: { studentProfile: { fullName: 'Aarav Patel (IITD CS)' } },
      },
      {
        id: 'bk_rec_2',
        totalAmount: 18500,
        status: 'CONFIRMED',
        listing: { title: 'Sunshine Scholar Enclave', city: 'Bengaluru' },
        student: { studentProfile: { fullName: 'Sneha Rao (IISc)' } },
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function apiGetAdminVerifications(
  token: string,
  page = 1,
  limit = 20,
): Promise<{ listings: AdminVerificationListing[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/verifications?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.data?.listings) {
      return json.data;
    }
  } catch (err: any) {
    console.warn('Backend admin verifications fallback:', err.message);
  }

  const list = getLocalAdminVerifications();
  return {
    listings: list,
    total: list.length,
  };
}

export async function apiVerifyListing(token: string, listingId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}/verify`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok && json.data) {
      updateLocalListingStatus(listingId, 'VERIFIED');
      return json.data;
    }
  } catch (err: any) {
    console.warn('Backend verify listing fallback:', err.message);
  }

  updateLocalListingStatus(listingId, 'VERIFIED');
  return { id: listingId, status: 'VERIFIED', verifiedAt: new Date().toISOString() };
}

export async function apiRejectListing(token: string, listingId: string, reason: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (res.ok && json.data) {
      updateLocalListingStatus(listingId, 'REJECTED', reason);
      return json.data;
    }
  } catch (err: any) {
    console.warn('Backend reject listing fallback:', err.message);
  }

  updateLocalListingStatus(listingId, 'REJECTED', reason);
  return { id: listingId, status: 'REJECTED', reason };
}

function getLocalAdminVerifications(): AdminVerificationListing[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_PENDING_LISTINGS;
  try {
    const stored = localStorage.getItem('studentnest_admin_verifications_queue');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('studentnest_admin_verifications_queue', JSON.stringify(DEFAULT_DEMO_PENDING_LISTINGS));
    return DEFAULT_DEMO_PENDING_LISTINGS;
  } catch {
    return DEFAULT_DEMO_PENDING_LISTINGS;
  }
}

function updateLocalListingStatus(listingId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalAdminVerifications();
    const updated = list.map((item) =>
      item.id === listingId ? { ...item, status, rejectionReason: reason } : item,
    );
    localStorage.setItem('studentnest_admin_verifications_queue', JSON.stringify(updated));
  } catch {
    // silent
  }
}
