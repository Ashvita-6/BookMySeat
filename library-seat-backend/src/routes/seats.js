// library-seat-backend/src/routes/seats.js
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { getAllSeats, getSeatById, createSeat, updateSeat, deleteSeat } = require('../controllers/seatController');

const router = express.Router();

// Get all seats
router.get('/', getAllSeats);

// Get seat by ID - Fixed parameter syntax for Express 5
router.get('/:id(\\d+)', getSeatById);

// Create new seat (admin only)
router.post('/', adminAuth, createSeat);

// Update seat (admin only) - Fixed parameter syntax
router.put('/:id(\\d+)', adminAuth, updateSeat);

// Delete seat (admin only) - Fixed parameter syntax
router.delete('/:id(\\d+)', adminAuth, deleteSeat);

module.exports = router;