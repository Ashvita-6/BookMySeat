// library-seat-backend/src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');

const createBooking = async (req, res) => {
  try {
    const { seat_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

    // Check if seat exists and is available
    const seat = await Seat.findById(seat_id);
    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    if (!seat.is_active) {
      return res.status(400).json({ error: 'Seat is not available for booking' });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      seat_id,
      status: 'active',
      $or: [
        {
          start_time: { $lt: endTime },
          end_time: { $gt: startTime }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        error: 'Seat is already booked for the selected time period' 
      });
    }

    // Check if user has overlapping bookings
    const userOverlappingBooking = await Booking.findOne({
      user_id,
      status: 'active',
      $or: [
        {
          start_time: { $lt: endTime },
          end_time: { $gt: startTime }
        }
      ]
    });

    if (userOverlappingBooking) {
      return res.status(400).json({ 
        error: 'You already have a booking during this time period' 
      });
    }

    // Create the booking - now active immediately (no WiFi verification)
    const booking = new Booking({
      user_id,
      seat_id,
      start_time: startTime,
      end_time: endTime,
      status: 'active'
    });

    const savedBooking = await booking.save();

    // Populate the booking for response
    const completeBooking = await Booking.findById(savedBooking._id)
      .populate('user_id', 'name student_id email')
      .populate('seat_id', 'building floor_hall section seat_number seat_type');

    const response = {
      id: completeBooking._id,
      user_id: completeBooking.user_id._id,
      seat_id: completeBooking.seat_id._id,
      start_time: completeBooking.start_time,
      end_time: completeBooking.end_time,
      status: completeBooking.status,
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
      message: 'Booking created successfully',
      booking: response
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

    const booking = await Booking.findOne({
      _id: id,
      user_id: user_id
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Get populated booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('seat_id', 'building floor_hall section seat_number seat_type');

    const response = {
      id: populatedBooking._id,
      user_id: populatedBooking.user_id,
      seat_id: populatedBooking.seat_id._id,
      start_time: populatedBooking.start_time,
      end_time: populatedBooking.end_time,
      status: populatedBooking.status,
      building: populatedBooking.seat_id.building,
      floor_hall: populatedBooking.seat_id.floor_hall,
      section: populatedBooking.seat_id.section,
      seat_number: populatedBooking.seat_id.seat_number,
      seat_type: populatedBooking.seat_id.seat_type,
      created_at: populatedBooking.createdAt,
      updated_at: populatedBooking.updatedAt
    };

    res.json({ 
      message: 'Booking cancelled successfully',
      booking: response 
    });

    // Emit socket event
    if (req.app.locals.io) {
      req.app.locals.io.emit('seatFreed', {
        seat_id: booking.seat_id,
        booking_id: booking._id
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
      .populate('user_id', 'name student_id email')
      .populate('seat_id', 'building floor_hall section seat_number seat_type')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      user_id: booking.user_id._id,
      user_name: booking.user_id.name,
      user_student_id: booking.user_id.student_id,
      user_email: booking.user_id.email,
      seat_id: booking.seat_id._id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
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
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  getAllBookings
};