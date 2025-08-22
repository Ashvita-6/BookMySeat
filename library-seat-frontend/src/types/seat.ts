// library-seat-frontend/src/types/seat.ts
export interface Seat {
  id: number;
  building: 'reading'; // REMOVED 'main'
  floor_hall: string; // Only 'hall_1', 'hall_2', 'hall_3'
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

export interface SeatFilter {
  building?: 'reading'; // REMOVED 'main'
  floor_hall?: string;
  section?: string;
  seat_type?: string;
  has_power?: boolean;
  has_monitor?: boolean;
  status?: string;
}

// UPDATED: Reading Halls Only Structure
export interface LibraryStructure {
  reading: {
    hall_1: {
      label: 'Hall 1';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 50 };
      };
    };
    hall_2: {
      label: 'Hall 2';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 50 };
      };
    };
    hall_3: {
      label: 'Hall 3';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 50 };
      };
    };
  };
}

// UPDATED: Reading Halls Only Structure
export const LIBRARY_STRUCTURE: LibraryStructure = {
  reading: {
    hall_1: {
      label: 'Hall 1',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 50 }
      }
    },
    hall_2: {
      label: 'Hall 2',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 50 }
      }
    },
    hall_3: {
      label: 'Hall 3',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 50 }
      }
    }
  }
};