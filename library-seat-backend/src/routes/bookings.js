// library-seat-backend/src/routes/bookings.js
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const { createBooking, getUserBookings, cancelBooking, getAllBookings } = require('../controllers/bookingController');

const router = express.Router();

// Create booking
router.post('/', auth, validateBooking, createBooking);

// Get user's bookings
router.get('/my-bookings', auth, getUserBookings);

// Cancel booking - Fixed parameter syntax for Express 5
router.put('/:id(\\d+)/cancel', auth, cancelBooking);

// Get all bookings (admin only)
router.get('/', adminAuth, getAllBookings);

module.exports = router;