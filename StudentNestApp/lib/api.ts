import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants/config';
import { tokenStorage } from './storage';
import { ApiResponse, PaginatedResponse, Room, User, Booking, Notification, RoomFilters, RoomSharing, RoomSharingApplication } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API URL for debugging
if (__DEV__) {
  console.log('📡 API URL:', API_URL);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          await tokenStorage.setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await tokenStorage.clearTokens();
        // TODO: Redirect to login
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    const response = await api.post('/auth/login', { identifier: email, password });
    return response.data;
  },

  loginWithPhone: async (phone: string, password: string): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    // Format phone number - add +91 if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const response = await api.post('/auth/login', { identifier: formattedPhone, password });
    return response.data;
  },

  signup: async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'student' | 'owner';
  }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // OTP methods - updated to match backend routes
  sendEmailOtp: async (email: string, purpose: string = 'verification'): Promise<ApiResponse<null>> => {
    const response = await api.post('/otp/email/send', { value: email, purpose });
    return response.data;
  },

  verifyEmailOtp: async (email: string, code: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/otp/email/verify', { value: email, code });
    return response.data;
  },

  sendPhoneOtp: async (phone: string, purpose: string = 'verification'): Promise<ApiResponse<null>> => {
    const response = await api.post('/otp/phone/send', { value: phone, purpose });
    return response.data;
  },

  verifyPhoneOtp: async (phone: string, code: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/otp/phone/verify', { value: phone, code });
    return response.data;
  },

  // Legacy OTP methods for backward compatibility
  sendOtp: async (type: 'email' | 'phone', value: string): Promise<ApiResponse<null>> => {
    const endpoint = type === 'email' ? '/otp/email/send' : '/otp/phone/send';
    const response = await api.post(endpoint, { value, purpose: 'verification' });
    return response.data;
  },

  verifyOtp: async (type: 'email' | 'phone', value: string, code: string): Promise<ApiResponse<null>> => {
    const endpoint = type === 'email' ? '/otp/email/verify' : '/otp/phone/verify';
    const response = await api.post(endpoint, { value, code });
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  // Get student profile specifically
  getStudentProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/profile/student');
    return response.data;
  },

  // Update student profile
  updateStudentProfile: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/profile/student', data);
    return response.data;
  },

  // Get owner profile specifically
  getOwnerProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/profile/owner');
    return response.data;
  },

  // Update owner profile
  updateOwnerProfile: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/profile/owner', data);
    return response.data;
  },

  // Upload avatar with FormData (multipart)
  uploadAvatar: async (formData: FormData): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post('/profile/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload avatar with base64
  uploadAvatarBase64: async (base64: string, mimeType: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post('/upload', {
      file: base64,
      type: 'image',
      category: 'profile',
      mimeType,
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.put('/profile/password', { currentPassword, newPassword });
    return response.data;
  },
};

// Rooms API
export const roomsApi = {
  getAll: async (filters?: RoomFilters, page = 1, limit = 10): Promise<PaginatedResponse<Room>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    try {
      if (__DEV__) {
        console.log('🔗 Fetching rooms from:', `${API_URL}/rooms?${params.toString()}`);
      }
      const response = await api.get(`/rooms?${params.toString()}`);
      if (__DEV__) {
        console.log('✅ Rooms response status:', response.status);
      }
      // API returns { success: true, data: [...rooms], pagination: {...} }
      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Rooms API error:', error.message);
        console.error('❌ Error details:', error.response?.data || error);
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<ApiResponse<Room>> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  getNearby: async (lat: number, lng: number, radius = 5): Promise<ApiResponse<Room[]>> => {
    const response = await api.get(`/rooms/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },

  search: async (query: string): Promise<ApiResponse<Room[]>> => {
    const response = await api.get(`/rooms/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

// Saved Rooms API
export const savedRoomsApi = {
  getAll: async (): Promise<ApiResponse<Room[]>> => {
    const response = await api.get('/saved-rooms');
    // Backend returns { success: true, data: { savedRooms: [...], total: N } }
    // Transform to match frontend expectation: { success: true, data: [...] }
    if (response.data?.data?.savedRooms) {
      return {
        ...response.data,
        data: response.data.data.savedRooms,
      };
    }
    return response.data;
  },

  add: async (roomId: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/saved-rooms', { roomId });
    return response.data;
  },

  remove: async (roomId: string): Promise<ApiResponse<null>> => {
    // Backend expects roomId as query param, not path param
    const response = await api.delete(`/saved-rooms?roomId=${roomId}`);
    return response.data;
  },

  check: async (roomId: string): Promise<ApiResponse<{ isSaved: boolean }>> => {
    const response = await api.get(`/saved-rooms/check/${roomId}`);
    return response.data;
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await api.get('/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (data: {
    roomId: string;
    moveInDate: string;
    duration: number;
    message?: string;
    negotiationId?: string;
  }): Promise<ApiResponse<Booking>> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<Booking>> => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

// Negotiations API
export const negotiationsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/negotiations');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/negotiations/${id}`);
    return response.data;
  },

  create: async (data: {
    roomId: string;
    proposedPrice: number;
    message?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/negotiations', data);
    return response.data;
  },

  respond: async (id: string, data: {
    action: 'accept' | 'reject' | 'counter';
    counterPrice?: number;
    message?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/negotiations/${id}/respond`, data);
    return response.data;
  },
};

// Visit Requests API
export const visitRequestsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/visit-requests');
    return response.data;
  },

  create: async (data: {
    propertyId: string;
    recipientId?: string;
    preferredDate: string;
    preferredTime?: string;
    message?: string;
    timeSlots?: Array<{ date: string; startTime: string; endTime: string }>;
  }): Promise<ApiResponse<any>> => {
    // Convert simple date/time to timeSlots format expected by backend
    const payload: any = {
      propertyId: data.propertyId,
      recipientId: data.recipientId,
      message: data.message,
    };
    
    // Create timeSlots from preferredDate and preferredTime
    if (data.preferredDate && data.preferredTime) {
      payload.timeSlots = [{
        date: data.preferredDate,
        startTime: data.preferredTime,
        endTime: data.preferredTime.includes(':') 
          ? `${parseInt(data.preferredTime.split(':')[0]) + 1}:${data.preferredTime.split(':')[1]}`
          : data.preferredTime,
      }];
    } else if (data.timeSlots) {
      payload.timeSlots = data.timeSlots;
    }
    
    const response = await api.post('/visit-requests', payload);
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/visit-requests/${id}/cancel`);
    return response.data;
  },

  respond: async (id: string, data: {
    action: 'confirm' | 'reject' | 'reschedule';
    newDate?: string;
    newTime?: string;
    message?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/visit-requests/${id}/respond`, data);
    return response.data;
  },
};

// Reviews API
export const reviewsApi = {
  getByRoom: async (roomId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/reviews?roomId=${roomId}`);
    return response.data;
  },

  create: async (data: {
    roomId: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};

// Room Sharing API
export const roomSharingApi = {
  // Get all available room shares
  getAll: async (filters?: {
    city?: string;
    gender?: string;
    minBudget?: number;
    maxBudget?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RoomSharing>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/room-sharing?${params.toString()}`);
    return response.data;
  },

  // Get room share by ID
  getById: async (id: string): Promise<ApiResponse<RoomSharing>> => {
    const response = await api.get(`/room-sharing/${id}`);
    return response.data;
  },

  // Get my room shares (as initiator)
  getMyShares: async (): Promise<ApiResponse<RoomSharing[]>> => {
    const response = await api.get('/room-sharing/my-shares');
    return response.data;
  },

  // Create a new room share listing
  create: async (data: {
    propertyId: string;
    maxParticipants: number;
    description?: string;
    requirements?: {
      gender?: 'male' | 'female' | 'any';
      lifestyle?: string[];
      preferences?: string[];
      ageRange?: { min?: number; max?: number };
    };
    costSharing?: {
      rentPerPerson: number;
      depositPerPerson: number;
    };
    availableFrom?: string;
  }): Promise<ApiResponse<RoomSharing>> => {
    const response = await api.post('/room-sharing', data);
    return response.data;
  },

  // Update room share
  update: async (id: string, data: Partial<RoomSharing>): Promise<ApiResponse<RoomSharing>> => {
    const response = await api.put(`/room-sharing/${id}`, data);
    return response.data;
  },

  // Close room share listing
  close: async (id: string): Promise<ApiResponse<RoomSharing>> => {
    const response = await api.put(`/room-sharing/${id}/close`);
    return response.data;
  },

  // Express interest in a room share (bookmark)
  expressInterest: async (id: string, message?: string): Promise<ApiResponse<RoomSharingApplication>> => {
    const response = await api.post(`/room-sharing/interest`, { shareId: id, message });
    return response.data;
  },

  // Apply to join a room share
  apply: async (id: string, data: { message?: string }): Promise<ApiResponse<RoomSharingApplication>> => {
    const response = await api.post(`/room-sharing/${id}/apply`, data);
    return response.data;
  },

  // Get applications for a room share (for initiators)
  getApplications: async (id: string): Promise<ApiResponse<RoomSharingApplication[]>> => {
    const response = await api.get(`/room-sharing/${id}/applications`);
    return response.data;
  },

  // Respond to an application (accept/reject)
  respondToApplication: async (
    shareId: string,
    applicationId: string,
    action: 'accepted' | 'rejected',
    message?: string
  ): Promise<ApiResponse<RoomSharingApplication>> => {
    const response = await api.put(`/room-sharing/${shareId}/respond`, {
      applicationId,
      status: action,
      message,
    });
    return response.data;
  },

  // Get compatibility score between current user and room share
  getCompatibility: async (id: string): Promise<ApiResponse<{ score: number; breakdown: Record<string, number> }>> => {
    const response = await api.get(`/room-sharing/${id}/assessment`);
    return response.data;
  },

  // Get room sharing statistics
  getStatistics: async (): Promise<ApiResponse<{
    totalActive: number;
    avgRent: number;
    topCities: { city: string; count: number }[];
  }>> => {
    const response = await api.get('/room-sharing/statistics');
    return response.data;
  },
};

// Owner Properties API
export const ownerPropertiesApi = {
  // Get owner's properties
  getAll: async (): Promise<ApiResponse<{ properties: Room[]; total: number }>> => {
    const response = await api.get('/properties/my-properties');
    return response.data;
  },

  // Create new property
  create: async (data: Partial<Room>): Promise<ApiResponse<Room>> => {
    const response = await api.post('/properties/my-properties', data);
    return response.data;
  },

  // Update property
  update: async (id: string, data: Partial<Room>): Promise<ApiResponse<Room>> => {
    const response = await api.put(`/properties/my-properties/${id}`, data);
    return response.data;
  },

  // Delete property
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/properties/my-properties/${id}`);
    return response.data;
  },

  // Get property statistics
  getStats: async (): Promise<ApiResponse<{
    totalProperties: number;
    occupiedRooms: number;
    availableRooms: number;
    totalRent: number;
    pendingBookings: number;
    pendingVisits: number;
  }>> => {
    const response = await api.get('/properties/my-properties/stats');
    return response.data;
  },
};

// Payments API
export const paymentsApi = {
  // Get payment history
  getAll: async (filters?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ payments: any[]; pagination: any }>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await api.get(`/payments?${params.toString()}`);
    return response.data;
  },

  // Get payment by ID
  getById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Get payment summary/stats
  getSummary: async (): Promise<ApiResponse<{
    totalPaid: number;
    totalPending: number;
    nextDue: { amount: number; dueDate: string } | null;
  }>> => {
    const response = await api.get('/payments/summary');
    return response.data;
  },
};

export default api;
