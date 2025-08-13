const socketEvents = {
  // Client to Server events
  JOIN_SEAT: 'joinSeat',
  LEAVE_SEAT: 'leaveSeat',
  GET_SEAT_STATUS: 'getSeatStatus',
  
  // Server to Client events
  SEAT_BOOKED: 'seatBooked',
  SEAT_FREED: 'seatFreed',
  SEAT_UPDATE: 'seatUpdate',
  SEAT_STATUS: 'seatStatus',
  SEAT_LIST_UPDATE: 'seatListUpdate',
  BOOKING_UPDATE: 'bookingUpdate',
  ADMIN_BOOKING_UPDATE: 'adminBookingUpdate',
  ERROR: 'error'
};

module.exports = socketEvents;