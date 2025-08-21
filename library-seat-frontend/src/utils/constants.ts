// library-seat-frontend/src/utils/constants.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  SEATS: {
    ALL: '/seats',
    BY_ID: (id: number) => `/seats/${id}`,
    CREATE: '/seats',
    UPDATE: (id: number) => `/seats/${id}`,
    DELETE: (id: number) => `/seats/${id}`,
  },
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    ALL: '/bookings',
    CANCEL: (id: number) => `/bookings/${id}/cancel`,
  },
  BREAKS: {
    CREATE: '/breaks',
    AVAILABLE: '/breaks/available',
    MY_BREAKS: '/breaks/my-breaks',
    BOOK: (id: number) => `/breaks/${id}/book`,
    CANCEL: (id: number) => `/breaks/${id}/cancel`,
  },
  USERS: {
    ALL: '/users',
    UPDATE_ROLE: (id: number) => `/users/${id}/role`,
    DELETE: (id: number) => `/users/${id}`,
  },
} as const;

export const SEAT_TYPES = {
  individual: { label: 'Individual', color: 'bg-blue-500' },
  group: { label: 'Group Study', color: 'bg-green-500' },
  computer: { label: 'Computer Station', color: 'bg-orange-500' },
} as const;

// UPDATED: Simplified booking status without WiFi
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

export const BREAK_STATUS = {
  active: { label: 'Available', color: 'bg-green-500' },
  taken: { label: 'Taken', color: 'bg-blue-500' },
  expired: { label: 'Expired', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
} as const;

export const SOCKET_EVENTS = {
  // Seat events
  JOIN_SEAT: 'joinSeat',
  LEAVE_SEAT: 'leaveSeat',
  GET_SEAT_STATUS: 'getSeatStatus',
  SEAT_BOOKED: 'seatBooked',
  SEAT_FREED: 'seatFreed',
  SEAT_UPDATE: 'seatUpdate',
  SEAT_STATUS: 'seatStatus',
  SEAT_LIST_UPDATE: 'seatListUpdate',
  
  // Booking events
  BOOKING_UPDATE: 'bookingUpdate',
  
  // Break events
  BREAK_CREATED: 'breakCreated',
  BREAK_TAKEN: 'breakTaken',
  BREAK_CANCELLED: 'breakCancelled',
  BREAK_EXPIRED: 'breakExpired',
  BREAK_LIST_UPDATE: 'breakListUpdate',
  
  // Error event
  ERROR: 'error',
} as const;