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

export interface CreateBookingData {
  seat_id: number;
  start_time: string;
  end_time: string;
}

export interface PendingConfirmation {
  id: number;
  user: {
    id: number;
    name: string;
    student_id: string;
    email: string;
  };
  seat: {
    id: number;
    building: string;
    floor_hall: string;
    section: string;
    seat_number: string;
    seat_type: string;
  };
  start_time: string;
  end_time: string;
  confirmation_deadline: string;
  time_remaining: number;
  created_at: string;
}