// library-seat-frontend/src/types/index.ts
export interface Seat {
  id: number;
  building: 'reading'; // REMOVED 'main'
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual'; // Only individual seats
  has_power: boolean;
  has_monitor: boolean;
  is_active: boolean;
  status: 'available' | 'occupied';
  occupied_by?: number;
  occupied_until?: string;
  occupied_by_name?: string;
  created_at: string;
  updated_at: string;
}

// UPDATED: Simplified booking interface without WiFi fields
export interface Booking {
  id: number;
  user_id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  building: 'reading'; // REMOVED 'main'
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual'; // Only individual seats
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  student_id: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface CreateBookingData {
  seat_id: number;
  start_time: string;
  end_time: string;
}

export interface SeatFilter {
  building?: 'reading'; // REMOVED 'main'
  floor_hall?: string;
  section?: string;
  seat_type?: string;
  has_power?: boolean;
  has_monitor?: boolean;
  status?: string;
}