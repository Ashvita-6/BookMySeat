
const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');
const { createBooking, getUserBookings, cancelBooking, getAllBookings } = require('../controllers/bookingController');

const router = express.Router();

// Create booking
router.post('/', auth, validateBooking, createBooking);

// Get user's bookings
router.get('/my-bookings', auth, getUserBookings);

// Cancel booking - FIXED: Removed restrictive regex pattern
router.put('/:id/cancel', auth, cancelBooking);

// Get all bookings (admin only)
router.get('/', adminAuth, getAllBookings);

module.exports = router;

// ==================================================
// 3. UPDATED SEAT CONTROLLER - library-seat-backend/src/controllers/seatController.js
// ==================================================

const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const getAllSeats = async (req, res) => {
  try {
    const {
      building,
      floor_hall,
      section,
      seat_type,
      has_power,
      has_monitor,
      status,
      page = 1,
      limit = 1000  // Increased limit to ensure all seats are returned
    } = req.query;

    // Build filter object
    const filter = { is_active: true };
    
    if (building) filter.building = building;
    if (floor_hall) filter.floor_hall = floor_hall;
    if (section) filter.section = section;
    if (seat_type) filter.seat_type = seat_type;
    if (has_power !== undefined) filter.has_power = has_power === 'true';
    if (has_monitor !== undefined) filter.has_monitor = has_monitor === 'true';

    console.log('Seat filter applied:', filter);

    // Get seats with pagination
    const seats = await Seat.find(filter)
      .sort({ building: 1, floor_hall: 1, section: 1, seat_number: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${seats.length} seats for filter:`, filter);

    // Debug specific issue
    if (building === 'reading' && (floor_hall === 'hall_2' || floor_hall === 'hall_3')) {
      console.log(`🔍 Debug - ${building} ${floor_hall}: Found ${seats.length} seats`);
      if (seats.length > 0) {
        console.log('Sample seats:', seats.slice(0, 3).map(s => `${s.building}-${s.floor_hall}-${s.section}${s.seat_number}`));
      }
    }

    // Get current time for status checking
    const now = new Date();

    // Get active bookings for these seats
    const seatIds = seats.map(seat => seat._id);
    const activeBookings = await Booking.find({
      seat_id: { $in: seatIds },
      status: 'active',
      start_time: { $lte: now },
      end_time: { $gt: now }
    }).populate('user_id', 'name');

    // Create a map of seat_id to booking info
    const bookingMap = {};
    activeBookings.forEach(booking => {
      bookingMap[booking.seat_id.toString()] = {
        occupied_by: booking.user_id._id,
        occupied_by_name: booking.user_id.name,
        occupied_until: booking.end_time,
        booking_status: booking.status
      };
    });

    // Format seats with booking status
    const formattedSeats = seats.map(seat => {
      const seatId = seat._id.toString();
      const bookingInfo = bookingMap[seatId];
      
      return {
        id: seat._id,
        building: seat.building,
        floor_hall: seat.floor_hall,
        section: seat.section,
        seat_number: seat.seat_number,
        seat_type: seat.seat_type,
        has_power: seat.has_power,
        has_monitor: seat.has_monitor,
        is_active: seat.is_active,
        status: bookingInfo ? 'occupied' : 'available',
        occupied_by: bookingInfo?.occupied_by || null,
        occupied_until: bookingInfo?.occupied_until || null,
        occupied_by_name: bookingInfo?.occupied_by_name || null,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      };
    });

    // Apply status filter if requested
    const filteredSeats = status 
      ? formattedSeats.filter(seat => seat.status === status)
      : formattedSeats;

    console.log(`Returning ${filteredSeats.length} seats after status filter`);

    res.json({ 
      seats: filteredSeats,
      total: filteredSeats.length,
      page: parseInt(page),
      limit: parseInt(limit),
      debug: {
        filter_applied: filter,
        raw_seat_count: seats.length,
        final_seat_count: filteredSeats.length
      }
    });

  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ error: 'Failed to get seats' });
  }
};

const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await Seat.findById(id);

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    // Check if seat is currently occupied
    const now = new Date();
    const activeBooking = await Booking.findOne({
      seat_id: id,
      status: 'active',
      start_time: { $lte: now },
      end_time: { $gt: now }
    }).populate('user_id', 'name');

    const formattedSeat = {
      id: seat._id,
      building: seat.building,
      floor_hall: seat.floor_hall,
      section: seat.section,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      has_power: seat.has_power,
      has_monitor: seat.has_monitor,
      is_active: seat.is_active,
      status: activeBooking ? 'occupied' : 'available',
      occupied_by: activeBooking?.user_id._id || null,
      occupied_until: activeBooking?.end_time || null,
      occupied_by_name: activeBooking?.user_id.name || null,
      created_at: seat.createdAt,
      updated_at: seat.updatedAt
    };

    res.json({ seat: formattedSeat });

  } catch (error) {
    console.error('Get seat error:', error);
    res.status(500).json({ error: 'Failed to get seat' });
  }
};

const createSeat = async (req, res) => {
  try {
    const { 
      building, 
      floor_hall, 
      section, 
      seat_number, 
      seat_type, 
      has_power = false, 
      has_monitor = false 
    } = req.body;

    // Check if seat already exists
    const existingSeat = await Seat.findOne({
      building,
      floor_hall,
      section,
      seat_number
    });

    if (existingSeat) {
      return res.status(400).json({ 
        error: 'Seat already exists in this location' 
      });
    }

    const seat = new Seat({
      building,
      floor_hall,
      section,
      seat_number,
      seat_type,
      has_power,
      has_monitor,
      is_active: true
    });

    await seat.save();

    const formattedSeat = {
      id: seat._id,
      building: seat.building,
      floor_hall: seat.floor_hall,
      section: seat.section,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      has_power: seat.has_power,
      has_monitor: seat.has_monitor,
      is_active: seat.is_active,
      status: 'available',
      occupied_by: null,
      occupied_until: null,
      occupied_by_name: null,
      created_at: seat.createdAt,
      updated_at: seat.updatedAt
    };

    res.status(201).json({
      message: 'Seat created successfully',
      seat: formattedSeat
    });

  } catch (error) {
    console.error('Create seat error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ error: 'Failed to create seat' });
  }
};

const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates._id;
    delete updates.created_at;
    delete updates.updated_at;

    const seat = await Seat.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    // Check current booking status
    const now = new Date();
    const activeBooking = await Booking.findOne({
      seat_id: id,
      status: 'active',
      start_time: { $lte: now },
      end_time: { $gt: now }
    }).populate('user_id', 'name');

    const formattedSeat = {
      id: seat._id,
      building: seat.building,
      floor_hall: seat.floor_hall,
      section: seat.section,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      has_power: seat.has_power,
      has_monitor: seat.has_monitor,
      is_active: seat.is_active,
      status: activeBooking ? 'occupied' : 'available',
      occupied_by: activeBooking?.user_id._id || null,
      occupied_until: activeBooking?.end_time || null,
      occupied_by_name: activeBooking?.user_id.name || null,
      created_at: seat.createdAt,
      updated_at: seat.updatedAt
    };

    res.json({
      message: 'Seat updated successfully',
      seat: formattedSeat
    });

  } catch (error) {
    console.error('Update seat error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ error: 'Failed to update seat' });
  }
};

const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if seat has any active bookings
    const now = new Date();
    const activeBookings = await Booking.find({
      seat_id: id,
      status: 'active',
      end_time: { $gt: now }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete seat with active bookings' 
      });
    }

    const seat = await Seat.findByIdAndDelete(id);

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.json({ message: 'Seat deleted successfully' });

  } catch (error) {
    console.error('Delete seat error:', error);
    res.status(500).json({ error: 'Failed to delete seat' });
  }
};

module.exports = {
  getAllSeats,
  getSeatById,
  createSeat,
  updateSeat,
  deleteSeat
};