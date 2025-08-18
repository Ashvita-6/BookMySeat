// library-seat-frontend/src/services/api.ts
import { Seat, SeatFilter } from '../types/seat';
import { Booking, CreateBookingData } from '../types/booking';
import { Break, CreateBreakData, BreakFilters, BreakBooking } from '../types/break';
import { User } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Authentication endpoints
  auth: {
    login: (credentials: { email: string; password: string }): Promise<{ token: string; user: User }> =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    register: (userData: { name: string; email: string; student_id: string; password: string }): Promise<{ token: string; user: User }> =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    getProfile: (): Promise<{ user: User }> =>
      apiRequest('/auth/profile'),
  },

  // Seats endpoints
  seats: {
    getAll: (filters?: SeatFilter): Promise<{ seats: Seat[] }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      return apiRequest(`/seats${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id: number): Promise<{ seat: Seat }> =>
      apiRequest(`/seats/${id}`),
    
    create: (seatData: Omit<Seat, 'id' | 'status' | 'created_at' | 'updated_at' | 'is_active' | 'occupied_by' | 'occupied_until' | 'occupied_by_name'>): Promise<{ seat: Seat }> =>
      apiRequest('/seats', {
        method: 'POST',
        body: JSON.stringify(seatData),
      }),
    
    update: (id: number, seatData: Partial<Seat>): Promise<{ seat: Seat }> =>
      apiRequest(`/seats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(seatData),
      }),
    
    delete: (id: number): Promise<{ message: string }> =>
      apiRequest(`/seats/${id}`, {
        method: 'DELETE',
      }),
  },

  // Bookings endpoints
  bookings: {
    create: (bookingData: CreateBookingData): Promise<{ booking: Booking }> =>
      apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }),
    
    getMyBookings: (status?: string, limit?: number, offset?: number): Promise<{ bookings: Booking[] }> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const queryString = params.toString();
      return apiRequest(`/bookings/my-bookings${queryString ? `?${queryString}` : ''}`);
    },
    
    getAll: (status?: string, seatId?: number, limit?: number, offset?: number): Promise<{ bookings: Booking[] }> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (seatId) params.append('seat_id', seatId.toString());
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const queryString = params.toString();
      return apiRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
    },
    
    cancel: (id: number): Promise<{ booking: Booking }> =>
      apiRequest(`/bookings/${id}/cancel`, {
        method: 'PUT',
      }),
  },

  // Break endpoints
  breaks: {
    // Create a new break
    create: (breakData: CreateBreakData): Promise<{ break: Break; message: string }> =>
      apiRequest('/breaks', {
        method: 'POST',
        body: JSON.stringify(breakData),
      }),

    // Get available breaks for booking
    getAvailable: (filters?: BreakFilters): Promise<{ breaks: Break[] }> => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString();
      return apiRequest(`/breaks/available${queryString ? `?${queryString}` : ''}`);
    },

    // Get user's breaks (both created and taken)
    getMyBreaks: (type?: 'created' | 'taken' | 'all'): Promise<{ breaks: Break[] }> => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      const queryString = params.toString();
      return apiRequest(`/breaks/my-breaks${queryString ? `?${queryString}` : ''}`);
    },

    // Book a break (take someone's break)
    book: (id: number): Promise<{ booking: BreakBooking; message: string }> =>
      apiRequest(`/breaks/${id}/book`, {
        method: 'POST',
      }),

    // Cancel a break
    cancel: (id: number): Promise<{ break: Break; message: string }> =>
      apiRequest(`/breaks/${id}/cancel`, {
        method: 'PUT',
      }),
  },

  // Users endpoints (admin only)
  users: {
    getAll: (role?: string, limit?: number, offset?: number): Promise<{ users: User[] }> => {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const queryString = params.toString();
      return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
    },
    
    updateRole: (id: number, role: string): Promise<{ user: User }> =>
      apiRequest(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    
    delete: (id: number): Promise<{ message: string }> =>
      apiRequest(`/users/${id}`, {
        method: 'DELETE',
      }),
  },
};