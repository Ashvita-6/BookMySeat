// library-seat-backend/src/controllers/breakController.js
const Break = require('../models/Break');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');

// Create a new break
const createBreak = async (req, res) => {
  try {
    const { booking_id, break_start_time, break_end_time, notes } = req.body;
    const user_id = req.user.id;

    // Validate the booking exists and belongs to the user
    const booking = await Booking.findOne({
      _id: booking_id,
      user_id,
      status: { $in: ['confirmed', 'active'] }
    }).populate('seat_id');

    if (!booking) {
      return res.status(404).json({ error: 'Active booking not found' });
    }

    const breakStart = new Date(break_start_time);
    const breakEnd = new Date(break_end_time);
    const now = new Date();

    // Validate break times are within booking period
    if (breakStart < booking.start_time || breakEnd > booking.end_time) {
      return res.status(400).json({ 
        error: 'Break time must be within your booking period' 
      });
    }

    // Validate break hasn't started in the past (allow 5 minute buffer)
    if (breakStart < new Date(now.getTime() - 5 * 60 * 1000)) {
      return res.status(400).json({ 
        error: 'Break start time cannot be in the past' 
      });
    }

    // Check if there's already an active break for this booking
    const existingBreak = await Break.findOne({
      booking_id,
      status: 'active',
      break_end_time: { $gt: now }
    });

    if (existingBreak) {
      return res.status(400).json({ 
        error: 'You already have an active break for this booking' 
      });
    }

    // Create the break
    const newBreak = new Break({
      booking_id,
      user_id,
      seat_id: booking.seat_id._id,
      break_start_time: breakStart,
      break_end_time: breakEnd,
      notes: notes || ''
    });

    await newBreak.save();

    // Populate the response
    const populatedBreak = await Break.findById(newBreak._id)
      .populate('user_id', 'name student_id')
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .populate('booking_id', 'start_time end_time');

    const response = {
      id: populatedBreak._id,
      booking_id: populatedBreak.booking_id._id,
      user_id: populatedBreak.user_id._id,
      user_name: populatedBreak.user_id.name,
      seat_id: populatedBreak.seat_id._id,
      building: populatedBreak.seat_id.building,
      floor_hall: populatedBreak.seat_id.floor_hall,
      section: populatedBreak.seat_id.section,
      seat_number: populatedBreak.seat_id.seat_number,
      seat_type: populatedBreak.seat_id.seat_type,
      break_start_time: populatedBreak.break_start_time,
      break_end_time: populatedBreak.break_end_time,
      status: populatedBreak.status,
      notes: populatedBreak.notes,
      duration_minutes: Math.round((breakEnd - breakStart) / (60 * 1000)),
      created_at: populatedBreak.createdAt,
      updated_at: populatedBreak.updatedAt
    };

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('breakCreated', {
        break: response
      });
    }

    res.status(201).json({
      message: 'Break created successfully',
      break: response
    });

  } catch (error) {
    console.error('Create break error:', error);
    
    if (error.message.includes('Break duration')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create break' });
  }
};

// Get available breaks
const getAvailableBreaks = async (req, res) => {
  try {
    const { building, floor_hall, seat_type, min_duration } = req.query;
    
    const filters = {};
    if (building) filters['seat_id.building'] = building;
    if (floor_hall) filters['seat_id.floor_hall'] = floor_hall;
    if (seat_type) filters['seat_id.seat_type'] = seat_type;

    let breaks = await Break.findAvailable();

    // Filter by minimum duration if specified
    if (min_duration) {
      const minDurationMs = parseInt(min_duration) * 60 * 1000;
      breaks = breaks.filter(breakItem => {
        const remaining = breakItem.break_end_time - new Date();
        return remaining >= minDurationMs;
      });
    }

    const formattedBreaks = breaks.map(breakItem => ({
      id: breakItem._id,
      booking_id: breakItem.booking_id._id,
      user_id: breakItem.user_id._id,
      user_name: breakItem.user_id.name,
      user_student_id: breakItem.user_id.student_id,
      seat_id: breakItem.seat_id._id,
      building: breakItem.seat_id.building,
      floor_hall: breakItem.seat_id.floor_hall,
      section: breakItem.seat_id.section,
      seat_number: breakItem.seat_id.seat_number,
      seat_type: breakItem.seat_id.seat_type,
      break_start_time: breakItem.break_start_time,
      break_end_time: breakItem.break_end_time,
      duration_minutes: Math.round((breakItem.break_end_time - breakItem.break_start_time) / (60 * 1000)),
      time_remaining_minutes: Math.round((breakItem.break_end_time - new Date()) / (60 * 1000)),
      notes: breakItem.notes,
      original_booking_start: breakItem.booking_id.start_time,
      original_booking_end: breakItem.booking_id.end_time,
      created_at: breakItem.createdAt
    }));

    res.json({ breaks: formattedBreaks });

  } catch (error) {
    console.error('Get available breaks error:', error);
    res.status(500).json({ error: 'Failed to get available breaks' });
  }
};

// Book a break (take someone's break)
const bookBreak = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Find the break
    const breakRecord = await Break.findById(id)
      .populate('seat_id')
      .populate('booking_id')
      .populate('user_id', 'name');

    if (!breakRecord) {
      return res.status(404).json({ error: 'Break not found' });
    }

    // Check if user is trying to book their own break
    if (breakRecord.user_id._id.toString() === user_id) {
      return res.status(400).json({ error: 'You cannot book your own break' });
    }

    // Check if break is available
    if (!breakRecord.isAvailable()) {
      return res.status(400).json({ error: 'Break is no longer available' });
    }

    // Check if user already has an active booking that overlaps
    const overlappingBooking = await Booking.findOne({
      user_id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          start_time: { $lt: breakRecord.break_end_time },
          end_time: { $gt: breakRecord.break_start_time }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        error: 'You have a conflicting booking during this time' 
      });
    }

    // Create a new booking for the break period
    const breakBooking = new Booking({
      user_id,
      seat_id: breakRecord.seat_id._id,
      start_time: new Date(), // Start immediately
      end_time: breakRecord.break_end_time,
      status: 'active' // No need for wifi confirmation for breaks
    });

    await breakBooking.save();

    // Update the break record
    breakRecord.status = 'taken';
    breakRecord.taken_by = user_id;
    breakRecord.taken_at = new Date();
    breakRecord.break_booking_id = breakBooking._id;
    await breakRecord.save();

    // Format the response
    const response = {
      id: breakBooking._id,
      user_id: breakBooking.user_id,
      seat_id: breakBooking.seat_id,
      start_time: breakBooking.start_time,
      end_time: breakBooking.end_time,
      status: breakBooking.status,
      building: breakRecord.seat_id.building,
      floor_hall: breakRecord.seat_id.floor_hall,
      section: breakRecord.seat_id.section,
      seat_number: breakRecord.seat_id.seat_number,
      seat_type: breakRecord.seat_id.seat_type,
      is_break_booking: true,
      break_id: breakRecord._id,
      original_user: breakRecord.user_id.name,
      created_at: breakBooking.createdAt,
      updated_at: breakBooking.updatedAt
    };

    // Emit socket events
    if (req.app.locals.io) {
      req.app.locals.io.emit('breakTaken', {
        break_id: breakRecord._id,
        taken_by: user_id,
        booking: response
      });
    }

    res.json({
      message: 'Break booked successfully',
      booking: response
    });

  } catch (error) {
    console.error('Book break error:', error);
    res.status(500).json({ error: 'Failed to book break' });
  }
};

// Get user's breaks (both created and taken)
const getUserBreaks = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { type = 'all' } = req.query; // 'created', 'taken', 'all'

    let query = {};
    
    if (type === 'created') {
      query.user_id = user_id;
    } else if (type === 'taken') {
      query.taken_by = user_id;
    } else {
      query = {
        $or: [
          { user_id },
          { taken_by: user_id }
        ]
      };
    }

    const breaks = await Break.find(query)
      .populate('user_id', 'name student_id')
      .populate('taken_by', 'name student_id')
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .populate('booking_id', 'start_time end_time')
      .populate('break_booking_id', 'start_time end_time status')
      .sort({ createdAt: -1 });

    const formattedBreaks = breaks.map(breakItem => ({
      id: breakItem._id,
      booking_id: breakItem.booking_id._id,
      user_id: breakItem.user_id._id,
      user_name: breakItem.user_id.name,
      seat_id: breakItem.seat_id._id,
      building: breakItem.seat_id.building,
      floor_hall: breakItem.seat_id.floor_hall,
      section: breakItem.seat_id.section,
      seat_number: breakItem.seat_id.seat_number,
      seat_type: breakItem.seat_id.seat_type,
      break_start_time: breakItem.break_start_time,
      break_end_time: breakItem.break_end_time,
      status: breakItem.status,
      taken_by: breakItem.taken_by ? {
        id: breakItem.taken_by._id,
        name: breakItem.taken_by.name,
        student_id: breakItem.taken_by.student_id
      } : null,
      taken_at: breakItem.taken_at,
      notes: breakItem.notes,
      is_my_break: breakItem.user_id._id.toString() === user_id,
      break_booking: breakItem.break_booking_id ? {
        id: breakItem.break_booking_id._id,
        start_time: breakItem.break_booking_id.start_time,
        end_time: breakItem.break_booking_id.end_time,
        status: breakItem.break_booking_id.status
      } : null,
      created_at: breakItem.createdAt,
      updated_at: breakItem.updatedAt
    }));

    res.json({ breaks: formattedBreaks });

  } catch (error) {
    console.error('Get user breaks error:', error);
    res.status(500).json({ error: 'Failed to get breaks' });
  }
};

// Cancel a break
const cancelBreak = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const breakRecord = await Break.findOne({
      _id: id,
      user_id,
      status: 'active'
    });

    if (!breakRecord) {
      return res.status(404).json({ error: 'Active break not found' });
    }

    breakRecord.status = 'cancelled';
    await breakRecord.save();

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('breakCancelled', {
        break_id: id
      });
    }

    res.json({
      message: 'Break cancelled successfully',
      break: breakRecord
    });

  } catch (error) {
    console.error('Cancel break error:', error);
    res.status(500).json({ error: 'Failed to cancel break' });
  }
};

module.exports = {
  createBreak,
  getAvailableBreaks,
  bookBreak,
  getUserBreaks,
  cancelBreak
};