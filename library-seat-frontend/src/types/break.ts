// library-seat-frontend/src/types/break.ts
export interface Break {
  id: number;
  booking_id: number;
  user_id: number;
  user_name: string;
  user_student_id?: string; // FIXED: Added missing property
  seat_id: number;
  building: 'main' | 'reading';
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual' | 'group' | 'computer';
  break_start_time: string;
  break_end_time: string;
  status: 'active' | 'taken' | 'expired' | 'cancelled';
  taken_by?: {
    id: number;
    name: string;
    student_id: string;
  } | null;
  taken_at?: string;
  notes?: string;
  is_my_break: boolean;
  break_booking?: {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
  } | null;
  // FIXED: Added missing original booking properties
  original_booking_start?: string;
  original_booking_end?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBreakData {
  booking_id: number;
  break_start_time: string;
  break_end_time: string;
  notes?: string;
}

export interface BreakFilters {
  building?: 'main' | 'reading';
  floor_hall?: string;
  seat_type?: string;
  min_duration?: number;
}