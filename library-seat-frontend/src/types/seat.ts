export interface Seat {
  id: number;
  building: 'main' | 'reading';
  floor_hall: string; // 'ground_floor', 'first_floor', 'hall_1', 'hall_2', 'hall_3'
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

export interface SeatFilter {
  building?: 'main' | 'reading';
  floor_hall?: string;
  section?: string;
  seat_type?: string;
  has_power?: boolean;
  has_monitor?: boolean;
  status?: string;
}

// FIXED: Updated Library Structure with correct seat counts
export interface LibraryStructure {
  main: {
    ground_floor: {
      label: 'Ground Floor';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 18 };
        B: { type: 'individual'; count: 17 };
        C: { type: 'group'; count: 15 };
      };
    };
    first_floor: {
      label: 'First Floor';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 15 };
        B: { type: 'individual'; count: 15 };
        C: { type: 'computer'; count: 20 };
      };
    };
  };
  reading: {
    hall_1: {
      label: 'Hall 1';
      capacity: 70;
      sections: {
        A: { type: 'individual'; count: 35 };
        B: { type: 'individual'; count: 35 };
      };
    };
    hall_2: {
      label: 'Hall 2';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 25 };
        B: { type: 'individual'; count: 25 };
      };
    };
    hall_3: {
      label: 'Hall 3';
      capacity: 50;
      sections: {
        A: { type: 'individual'; count: 25 };
        B: { type: 'individual'; count: 25 };
      };
    };
  };
}

// FIXED: Export the constant
export const LIBRARY_STRUCTURE: LibraryStructure = {
  main: {
    ground_floor: {
      label: 'Ground Floor',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 18 },
        B: { type: 'individual', count: 17 },
        C: { type: 'group', count: 15 }
      }
    },
    first_floor: {
      label: 'First Floor',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 15 },
        B: { type: 'individual', count: 15 },
        C: { type: 'computer', count: 20 }
      }
    }
  },
  reading: {
    hall_1: {
      label: 'Hall 1',
      capacity: 70,
      sections: {
        A: { type: 'individual', count: 35 },
        B: { type: 'individual', count: 35 }
      }
    },
    hall_2: {
      label: 'Hall 2',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 25 },
        B: { type: 'individual', count: 25 }
      }
    },
    hall_3: {
      label: 'Hall 3',
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 25 },
        B: { type: 'individual', count: 25 }
      }
    }
  }
};
