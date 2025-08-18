// library-seat-backend/src/routes/breaks.js (rename from break.js)
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

// Book a break (take someone's break) - Fixed parameter syntax
router.post('/:id(\\d+)/book', auth, bookBreak);

// Cancel a break - Fixed parameter syntax  
router.put('/:id(\\d+)/cancel', auth, cancelBreak);

module.exports = router;