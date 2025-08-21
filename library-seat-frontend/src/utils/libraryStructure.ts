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
      capacity: 50,
      sections: {
        A: { type: 'individual', count: 25 },
        B: { type: 'individual', count: 25 }
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

export const BREAK_STATUS = {
  active: { label: 'Available', color: 'bg-green-500' },
  taken: { label: 'Taken', color: 'bg-blue-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
} as const;

// FIXED: Two different function signatures for different use cases
// For objects with all properties (Booking, Break, Seat with location info)
export const getSeatDisplayName = (item: {
  building: 'main' | 'reading';
  floor_hall: string;
  section: string;
  seat_number: string;
}): string => {
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
  building: 'main' | 'reading', 
  floor_hall: string, 
  section: string, 
  seat_number: string
): string => {
  return getSeatDisplayName({ building, floor_hall, section, seat_number });
};

export const getLocationDisplayName = (building: 'main' | 'reading', floor_hall: string): string => {
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