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
  USERS: {
    ALL: '/users',
    UPDATE_ROLE: (id: number) => `/users/${id}/role`,
    DELETE: (id: number) => `/users/${id}`,
  },
} as const;

export const SEAT_TYPES = {
  individual: { label: 'Individual', color: 'bg-blue-500' },
  group: { label: 'Group Study', color: 'bg-green-500' },
  quiet: { label: 'Quiet Zone', color: 'bg-purple-500' },
  computer: { label: 'Computer Station', color: 'bg-orange-500' },
} as const;

export const BOOKING_STATUS = {
  active: { label: 'Active', color: 'bg-green-500' },
  completed: { label: 'Completed', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
} as const;

export const SOCKET_EVENTS = {
  JOIN_SEAT: 'joinSeat',
  LEAVE_SEAT: 'leaveSeat',
  GET_SEAT_STATUS: 'getSeatStatus',
  SEAT_BOOKED: 'seatBooked',
  SEAT_FREED: 'seatFreed',
  SEAT_UPDATE: 'seatUpdate',
  SEAT_STATUS: 'seatStatus',
  SEAT_LIST_UPDATE: 'seatListUpdate',
  BOOKING_UPDATE: 'bookingUpdate',
  ERROR: 'error',
} as const;
