// library-seat-backend/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');
const wifiConfirmationService = require('../services/wifiConfirmationService');

const createBooking = async (req, res) => {
  try {
    const { seat_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

    console.log('Booking request data:', { seat_id, start_time, end_time, user_id });

    // Validate and parse times
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    const now = new Date();

    // Additional time validations
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (startDate <= now) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check maximum booking duration (4 hours)
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > 4) {
      return res.status(400).json({ error: 'Maximum booking duration is 4 hours' });
    }

    // Check minimum booking duration (30 minutes)
    if (durationHours < 0.5) {
      return res.status(400).json({ error: 'Minimum booking duration is 30 minutes' });
    }

    // Check if seat exists and is active
    const seat = await Seat.findById(seat_id);
    if (!seat || !seat.is_active) {
      return res.status(404).json({ error: 'Seat not found or inactive' });
    }

    console.log('Seat found:', seat);

    // Check if seat is available during the requested time
    const conflictingBooking = await Booking.findOne({
      seat_id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          start_time: { $lt: endDate },
          end_time: { $gt: startDate }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({ 
        error: 'Seat is not available during the requested time',
        conflicting_booking: {
          start: conflictingBooking.start_time,
          end: conflictingBooking.end_time,
          status: conflictingBooking.status
        }
      });
    }

    // Check user's active bookings limit (including pending ones)
    const userActiveBookings = await Booking.countDocuments({
      user_id,
      status: { $in: ['pending', 'confirmed', 'active'] },
      end_time: { $gt: now }
    });

    if (userActiveBookings >= 2) {
      return res.status(400).json({ error: 'Maximum active bookings limit (2) reached' });
    }

    // Create booking with pending status
    const booking = new Booking({
      user_id,
      seat_id,
      start_time: startDate,
      end_time: endDate,
      status: 'pending' // Start as pending, requiring WiFi confirmation
    });

    await booking.save();
    console.log('Booking created with pending status:', booking);

    // Schedule auto-cancellation after 15 minutes
    await wifiConfirmationService.scheduleAutoCancellation(booking._id);

    // Get complete booking info with seat and user details
    const completeBooking = await Booking.findById(booking._id)
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .populate('user_id', 'name');

    const response = {
      id: completeBooking._id,
      user_id: completeBooking.user_id._id,
      seat_id: completeBooking.seat_id._id,
      start_time: completeBooking.start_time,
      end_time: completeBooking.end_time,
      status: completeBooking.status,
      confirmation_deadline: completeBooking.confirmation_deadline,
      building: completeBooking.seat_id.building,
      floor_hall: completeBooking.seat_id.floor_hall,
      section: completeBooking.seat_id.section,
      seat_number: completeBooking.seat_id.seat_number,
      seat_type: completeBooking.seat_id.seat_type,
      user_name: completeBooking.user_id.name,
      created_at: completeBooking.createdAt,
      updated_at: completeBooking.updatedAt
    };

    res.status(201).json({
      message: 'Booking created successfully. Please connect to library WiFi within 15 minutes to confirm.',
      booking: response,
      confirmation_required: true,
      confirmation_deadline: completeBooking.confirmation_deadline
    });

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('seatBooked', {
        seat_id,
        booking: response
      });
    }

  } catch (error) {
    console.error('Create booking error:', error);
    
    // Handle specific MongoDB/Mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid seat ID format' });
    }
    
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    const query = { user_id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      user_id: booking.user_id,
      seat_id: booking.seat_id._id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      confirmation_deadline: booking.confirmation_deadline,
      confirmed_at: booking.confirmed_at,
      building: booking.seat_id.building,
      floor_hall: booking.seat_id.floor_hall,
      section: booking.seat_id.section,
      seat_number: booking.seat_id.seat_number,
      seat_type: booking.seat_id.seat_type,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: id,
      user_id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!['pending', 'confirmed', 'active'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        user_id: booking.user_id,
        seat_id: booking.seat_id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        created_at: booking.createdAt,
        updated_at: booking.updatedAt
      }
    });

    // Emit socket event for real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emit('seatFreed', {
        seat_id: booking.seat_id,
        booking_id: id
      });
    }

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, seat_id, limit = 20, offset = 0 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (seat_id) query.seat_id = seat_id;

    const bookings = await Booking.find(query)
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .populate('user_id', 'name student_id')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      user_id: booking.user_id._id,
      seat_id: booking.seat_id._id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      confirmation_deadline: booking.confirmation_deadline,
      confirmed_at: booking.confirmed_at,
      building: booking.seat_id.building,
      floor_hall: booking.seat_id.floor_hall,
      section: booking.seat_id.section,
      seat_number: booking.seat_id.seat_number,
      seat_type: booking.seat_id.seat_type,
      user_name: booking.user_id.name,
      student_id: booking.user_id.student_id,
      created_at: booking.createdAt,
      updated_at: booking.updatedAt
    }));

    res.json({ bookings: formattedBookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking, getAllBookings };