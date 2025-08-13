export interface Booking {
  id: number;
  user_id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  floor: number;
  section: string;
  seat_number: string;
  seat_type: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  seat_id: number;
  start_time: string;
  end_time: string;
}