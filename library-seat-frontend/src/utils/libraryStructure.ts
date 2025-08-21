// library-seat-frontend/src/utils/libraryStructure.ts
import { LibraryStructure } from '@/types/seat';

// UPDATED: Library structure with correct seat counts as per requirements
export const LIBRARY_STRUCTURE: LibraryStructure = {
  main: {
    ground_floor: {
      label: 'Ground Floor',
      capacity: 30,
      sections: {
        A: { type: 'individual', count: 15 },
        B: { type: 'individual', count: 15 }
      }
    },
    first_floor: {
      label: 'First Floor',
      capacity: 60,
      sections: {
        A: { type: 'individual', count: 30 },
        B: { type: 'computer', count: 30 }
      }
    }
  },
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

// UTILITY FUNCTIONS (the missing ones you were looking for)

// For objects with all properties (Booking, Break, Seat with location info)
export const getSeatDisplayName = (item: {
  building?: 'main' | 'reading';
  floor_hall?: string;
  section?: string;
  seat_number?: string;
}): string => {
  // Defensive check for undefined properties
  if (!item || !item.building || !item.floor_hall || !item.section || !item.seat_number) {
    return 'Unknown Location';
  }

  const buildingName = item.building === 'main' ? 'Main Library' : 'Reading Room';
  
  let floorHallName = '';
  if (item.building === 'main') {
    floorHallName = item.floor_hall === 'ground_floor' ? 'Ground Floor' : 'First Floor';
  } else {
    const hallNum = item.floor_hall.replace('hall_', '');
    floorHallName = `Hall ${hallNum}`;
  }
  
  return `${buildingName} - ${floorHallName} - ${item.section}${item.seat_number}`;
};

// For individual parameters
export const getSeatDisplayNameFromParams = (
  building?: 'main' | 'reading', 
  floor_hall?: string, 
  section?: string, 
  seat_number?: string
): string => {
  if (!building || !floor_hall || !section || !seat_number) {
    return 'Unknown Location';
  }
  return getSeatDisplayName({ building, floor_hall, section, seat_number });
};

export const getLocationDisplayName = (building?: 'main' | 'reading', floor_hall?: string): string => {
  if (!building || !floor_hall) {
    return 'Unknown Location';
  }
  
  const buildingName = building === 'main' ? 'Main Library' : 'Reading Room';
  
  let floorHallName = '';
  if (building === 'main') {
    floorHallName = floor_hall === 'ground_floor' ? 'Ground Floor' : 'First Floor';
  } else {
    const hallNum = floor_hall.replace('hall_', '');
    floorHallName = `Hall ${hallNum}`;
  }
  
  return `${buildingName} - ${floorHallName}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
};

export const formatTimeRemaining = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  return formatDuration(minutes);
};

// BUILDING AND SEAT TYPE OPTIONS

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

// UPDATED: Simplified booking status without WiFi functionality
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