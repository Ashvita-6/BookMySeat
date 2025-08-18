// library-seat-frontend/src/types/booking.ts
export interface Booking {
  id: number;
  user_id: number;
  seat_id: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'completed' | 'cancelled';
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

// Booking status constants (simplified without WiFi verification)
export const BOOKING_STATUS = {
  active: { 
    label: 'Active', 
    color: 'bg-green-500',
    description: 'Currently in use'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-gray-500',
    description: 'Booking completed'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-500',
    description: 'Manually cancelled'
  }
} as const;