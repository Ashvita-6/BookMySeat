import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/auth';
import { Seat, SeatFilter } from '@/types/seat';
import { Booking, CreateBookingData } from '@/types/booking';
import { UpdateUserRole } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
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
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new ApiError(errorData.error || 'Something went wrong', response.status);
  }

  return response.json();
};

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: LoginCredentials): Promise<AuthResponse> =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    
    register: (data: RegisterData): Promise<AuthResponse> =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
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
    
    getById: (id: number): Promise<{ user: User }> =>
      apiRequest(`/users/${id}`),
    
    updateRole: (id: number, data: UpdateUserRole): Promise<{ user: User }> =>
      apiRequest(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: number): Promise<{ message: string }> =>
      apiRequest(`/users/${id}`, {
        method: 'DELETE',
      }),
  },
};