// ==================================================
// UPDATED: library-seat-frontend/src/types/break.ts
// ==================================================

import { Booking } from './booking';

export interface Break {
  id: number;
  booking_id: number;
  user_id: number;
  user_name: string;
  user_student_id?: string;
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
  };
  taken_at?: string;
  notes: string;
  duration_minutes: number;
  time_remaining_minutes?: number;
  is_my_break?: boolean;
  break_booking?: {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
  };
  original_booking_start?: string;
  original_booking_end?: string;
  created_at: string;
  updated_at?: string;
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
  seat_type?: 'individual' | 'group' | 'computer';
  min_duration?: number; // in minutes
}

export interface BreakBooking extends Booking {
  is_break_booking: true;
  break_id: number;
  original_user: string;
}

// Status colors for break display
export const BREAK_STATUS = {
  active: { label: 'Available', color: 'bg-green-500' },
  taken: { label: 'Taken', color: 'bg-blue-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
} as const;