const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const { createBooking, getUserBookings, cancelBooking, getAllBookings } = require('../controllers/bookingController');

const router = express.Router();

router.post('/', auth, validateBooking, createBooking);
router.get('/my-bookings', auth, getUserBookings);
router.put('/:id/cancel', auth, cancelBooking);
router.get('/', adminAuth, getAllBookings);

module.exports = router;
