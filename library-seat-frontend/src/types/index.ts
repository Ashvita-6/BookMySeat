// library-seat-frontend/src/types/index.ts
export interface Seat {
  id: number;
  building: 'main' | 'reading';
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'computer';
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

export interface Booking {
  id: number;
  user_id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'auto_cancelled';
  confirmation_deadline?: string;
  confirmed_at?: string;
  wifi_mac_address?: string;
  building: 'main' | 'reading';
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'computer';
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
  building?: 'main' | 'reading';
  floor_hall?: string;
  section?: string;
  seat_type?: string;
  has_power?: boolean;
  has_monitor?: boolean;
  status?: string;
}