// library-seat-backend/src/routes/bookings.js
const express = require('express');
const router = express.Router();

// Mock booking data for now
const mockBookings = [
  {
    id: 1,
    seat_id: 1,
    user_id: 1,
    start_time: new Date(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'active',
    created_at: new Date()
  }
];

// GET /api/bookings/my-bookings
router.get('/my-bookings', (req, res) => {
  console.log('📍 GET /api/bookings/my-bookings requested');
  
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    
    let filteredBookings = mockBookings;
    
    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }
    
    const paginatedBookings = filteredBookings.slice(offset, offset + parseInt(limit));
    
    res.json({
      bookings: paginatedBookings,
      total: filteredBookings.length,
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error in my-bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings - Get all bookings (admin)
router.get('/', (req, res) => {
  console.log('📍 GET /api/bookings requested');
  
  try {
    const { status, seat_id, limit = 10, offset = 0 } = req.query;
    
    let filteredBookings = mockBookings;
    
    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }
    
    if (seat_id) {
      filteredBookings = filteredBookings.filter(booking => booking.seat_id === parseInt(seat_id));
    }
    
    const paginatedBookings = filteredBookings.slice(offset, offset + parseInt(limit));
    
    res.json({
      bookings: paginatedBookings,
      total: filteredBookings.length,
      message: 'All bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error in get all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create new booking
router.post('/', (req, res) => {
  console.log('📍 POST /api/bookings requested');
  console.log('Request body:', req.body);
  
  try {
    const { seat_id, start_time, end_time } = req.body;
    
    if (!seat_id || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newBooking = {
      id: mockBookings.length + 1,
      seat_id: parseInt(seat_id),
      user_id: 1, // Mock user ID
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status: 'active',
      created_at: new Date()
    };
    
    mockBookings.push(newBooking);
    
    res.status(201).json({
      booking: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', (req, res) => {
  console.log(`📍 PUT /api/bookings/${req.params.id}/cancel requested`);
  
  try {
    const bookingId = parseInt(req.params.id);
    const booking = mockBookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    booking.status = 'cancelled';
    
    res.json({
      booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// PUT /api/bookings/:id/complete - Complete booking
router.put('/:id/complete', (req, res) => {
  console.log(`📍 PUT /api/bookings/${req.params.id}/complete requested`);
  
  try {
    const bookingId = parseInt(req.params.id);
    const booking = mockBookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    booking.status = 'completed';
    
    res.json({
      booking,
      message: 'Booking completed successfully'
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

module.exports = router;