// library-seat-frontend/src/utils/libraryStructure.ts
import { LibraryStructure } from '@/types/seat';

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
      capacity: 70,
      sections: {
        A: { type: 'individual', count: 35 },
        B: { type: 'individual', count: 35 }
      }
    }
  }
};

export const BUILDING_OPTIONS = [
  { value: 'main', label: 'Main Library' },
  { value: 'reading', label: 'Reading Room' }
];

export const getFloorHallOptions = (building: 'main' | 'reading') => {
  if (building === 'main') {
    return [
      { value: 'ground_floor', label: 'Ground Floor' },
      { value: 'first_floor', label: 'First Floor' }
    ];
  } else {
    return [
      { value: 'hall_1', label: 'Hall 1' },
      { value: 'hall_2', label: 'Hall 2' },
      { value: 'hall_3', label: 'Hall 3' }
    ];
  }
};

export const SEAT_TYPES = {
  individual: { 
    label: 'Individual Study', 
    color: 'bg-blue-500',
    icon: '👤'
  },
  group: { 
    label: 'Group Study', 
    color: 'bg-green-500',
    icon: '👥'
  },
  computer: { 
    label: 'Computer Station', 
    color: 'bg-orange-500',
    icon: '💻'
  }
} as const;

export const BOOKING_STATUS = {
  pending: { 
    label: 'Pending WiFi Confirmation', 
    color: 'bg-yellow-500',
    description: 'Connect to library WiFi to confirm'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-500',
    description: 'Booking confirmed via WiFi'
  },
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
  },
  auto_cancelled: { 
    label: 'Auto-Cancelled', 
    color: 'bg-red-600',
    description: 'Cancelled due to no WiFi confirmation'
  }
} as const;

export const getSeatDisplayName = (seat: { 
  building: string; 
  floor_hall: string; 
  section: string; 
  seat_number: string; 
}): string => {
  // Handle undefined or null values
  if (!seat.building || !seat.floor_hall || !seat.section || !seat.seat_number) {
    return `Seat-${seat.section || '?'}${seat.seat_number || '?'}`;
  }

  const buildingPrefix = seat.building === 'main' ? 'M' : 'R';
  
  let floorHallPrefix = '';
  if (seat.building === 'main') {
    floorHallPrefix = seat.floor_hall === 'ground_floor' ? 'G' : 'F1';
  } else {
    // Safely handle reading room halls
    floorHallPrefix = seat.floor_hall ? seat.floor_hall.replace('hall_', 'H') : 'H?';
  }
  
  return `${buildingPrefix}-${floorHallPrefix}-${seat.section}${seat.seat_number}`;
};

export const getLocationDisplayName = (building: string, floor_hall: string): string => {
  // Handle undefined or null values
  if (!building || !floor_hall) {
    return 'Unknown Location';
  }

  const buildingName = building === 'main' ? 'Main Library' : 'Reading Room';
  
  // Type-safe access to LIBRARY_STRUCTURE
  if (building === 'main') {
    const mainStructure = LIBRARY_STRUCTURE.main;
    const locationName = mainStructure[floor_hall as keyof typeof mainStructure]?.label || floor_hall;
    return `${buildingName} - ${locationName}`;
  } else if (building === 'reading') {
    const readingStructure = LIBRARY_STRUCTURE.reading;
    const locationName = readingStructure[floor_hall as keyof typeof readingStructure]?.label || floor_hall;
    return `${buildingName} - ${locationName}`;
  }
  
  return `${buildingName} - ${floor_hall}`;
};