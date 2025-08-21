// ==================================================
// FIXED: library-seat-frontend/src/services/api.ts
// ==================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // FIXED: Handle possible null value from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('📤 Request body:', options.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`❌ API Error: ${response.status}`, errorData);
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`📥 API Response:`, data);
  return data;
};

export const api = {
  seats: {
    getAll: (params?: Record<string, any>) => {
      const queryString = params ? 
        '?' + new URLSearchParams(
          // FIXED: Handle possible null/undefined values
          Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString() : '';
      console.log(`🔍 Fetching seats with params:`, params);
      return apiRequest(`/seats${queryString}`);
    },
    getById: (id: number) => apiRequest(`/seats/${id}`),
    create: (data: any) => apiRequest('/seats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => apiRequest(`/seats/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => apiRequest(`/seats/${id}`, {
      method: 'DELETE',
    }),
  },
  bookings: {
    create: (data: any) => apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMyBookings: (status?: string, limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      return apiRequest(`/bookings/my-bookings?${params.toString()}`);
    },
    getAll: (status?: string, seatId?: number, limit?: number, offset?: number) => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (seatId) params.append('seat_id', seatId.toString());
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      return apiRequest(`/bookings?${params.toString()}`);
    },
    // FIXED: This should work now without 404
    cancel: (id: number) => apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
    }),
  },
  auth: {
    login: (data: any) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: any) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getProfile: () => apiRequest('/auth/profile'),
  },
  breaks: {
    create: (data: any) => apiRequest('/breaks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getAvailable: (filters?: any) => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          // FIXED: Handle possible null/undefined values
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      return apiRequest(`/breaks/available?${params.toString()}`);
    },
    // FIXED: Added missing getMyBreaks method
    getMyBreaks: () => apiRequest('/breaks/my-breaks'),
    getMy: () => apiRequest('/breaks/my-breaks'), // Keep both for compatibility
    book: (id: number) => apiRequest(`/breaks/${id}/book`, {
      method: 'POST',
    }),
    cancel: (id: number) => apiRequest(`/breaks/${id}/cancel`, {
      method: 'PUT',
    }),
  }
};