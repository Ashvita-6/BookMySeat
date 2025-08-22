// library-seat-frontend/src/types/break.ts
export interface Break {
  id: number;
  booking_id: number;
  user_id: number;
  user_name: string;
  user_student_id?: string;
  seat_id: number;
  building: 'reading'; // REMOVED 'main'
  floor_hall: string;
  section: string;
  seat_number: string;
  seat_type: 'individual'; // Only individual seats
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
  building?: 'reading'; // REMOVED 'main'
  floor_hall?: string;
  seat_type?: string;
  min_duration?: number;
}