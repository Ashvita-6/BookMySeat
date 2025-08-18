// library-seat-backend/src/routes/breaks.js
const express = require('express');
const { auth } = require('../middleware/auth');
const { validateBreak } = require('../middleware/validation');
const { 
  createBreak, 
  getAvailableBreaks, 
  bookBreak, 
  getUserBreaks, 
  cancelBreak 
} = require('../controllers/breakController');

const router = express.Router();

// Create a new break
router.post('/', auth, validateBreak, createBreak);

// Get available breaks for booking
router.get('/available', auth, getAvailableBreaks);

// Get user's breaks (both created and taken)
router.get('/my-breaks', auth, getUserBreaks);

// Book a break (take someone's break)
router.post('/:id/book', auth, bookBreak);

// Cancel a break
router.put('/:id/cancel', auth, cancelBreak);

module.exports = router;