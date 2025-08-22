// library-seat-frontend/src/utils/libraryStructure.ts
import { LibraryStructure } from '@/types/seat';

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

// UTILITY FUNCTIONS (Updated for Reading Halls Only)

// For objects with all properties (Booking, Break, Seat with location info)
export const getSeatDisplayName = (item: {
  building?: 'reading';
  floor_hall?: string;
  section?: string;
  seat_number?: string;
}): string => {
  // Defensive check for undefined properties
  if (!item || !item.building || !item.floor_hall || !item.section || !item.seat_number) {
    return 'Unknown Location';
  }

  // Only Reading Rooms now
  const buildingName = 'Reading Room';
  const hallNum = item.floor_hall.replace('hall_', '');
  const floorHallName = `Hall ${hallNum}`;
  
  return `${buildingName} - ${floorHallName} - ${item.section}${item.seat_number}`;
};

// For individual parameters
export const getSeatDisplayNameFromParams = (
  building?: 'reading', 
  floor_hall?: string, 
  section?: string, 
  seat_number?: string
): string => {
  if (!building || !floor_hall || !section || !seat_number) {
    return 'Unknown Location';
  }
  return getSeatDisplayName({ building, floor_hall, section, seat_number });
};

export const getLocationDisplayName = (building?: 'reading', floor_hall?: string): string => {
  if (!building || !floor_hall) {
    return 'Unknown Location';
  }
  
  // Only Reading Rooms now
  const buildingName = 'Reading Room';
  const hallNum = floor_hall.replace('hall_', '');
  const floorHallName = `Hall ${hallNum}`;
  
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

// BUILDING AND SEAT TYPE OPTIONS (Reading Only)

export const BUILDING_OPTIONS = [
  { value: 'reading', label: 'Reading Room' } // REMOVED main library option
];

export const getFloorHallOptions = (building: 'reading') => {
  // Only reading halls now
  return [
    { value: 'hall_1', label: 'Hall 1' },
    { value: 'hall_2', label: 'Hall 2' },
    { value: 'hall_3', label: 'Hall 3' }
  ];
};

export const SEAT_TYPES = {
  individual: { 
    label: 'Individual Study', 
    color: 'bg-blue-500',
    icon: '👤'
  }
  // REMOVED group and computer seat types
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