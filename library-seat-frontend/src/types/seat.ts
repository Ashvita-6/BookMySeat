// /types/seat.ts
export interface Seat {
  id: number;
  floor: number;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'quiet' | 'computer';
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

export interface SeatFilter {
  floor?: number;
  section?: string;
  seat_type?: string;
  has_power?: boolean;
  has_monitor?: boolean;
  status?: string;
}

// /types/user.ts
export interface User {
  id: number;
  email: string;
  name: string;
  student_id: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface UpdateUserRole {
  role: 'student' | 'admin';
}