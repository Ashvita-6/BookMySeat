// library-seat-backend/src/controllers/seatController.js
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
      limit = 100
    } = req.query;

    // Build filter object
    const filter = { is_active: true };
    
    if (building) filter.building = building;
    if (floor_hall) filter.floor_hall = floor_hall;
    if (section) filter.section = section;
    if (seat_type) filter.seat_type = seat_type;
    if (has_power !== undefined) filter.has_power = has_power === 'true';
    if (has_monitor !== undefined) filter.has_monitor = has_monitor === 'true';

    console.log('Seat filter:', filter);

    // Get seats with pagination
    const seats = await Seat.find(filter)
      .sort({ building: 1, floor_hall: 1, section: 1, seat_number: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${seats.length} seats`);

    // Get current time for status checking
    const now = new Date();

    // Get active bookings for these seats
    const seatIds = seats.map(seat => seat._id);
    const activeBookings = await Booking.find({
      seat_id: { $in: seatIds },
      status: { $in: ['confirmed', 'active'] },
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
        occupied_by_name: bookingInfo?.occupied_by_name || null,
        occupied_until: bookingInfo?.occupied_until || null,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      };
    });

    // Filter by status if requested
    let finalSeats = formattedSeats;
    if (status) {
      finalSeats = formattedSeats.filter(seat => seat.status === status);
    }

    // Get total count for pagination
    const totalCount = await Seat.countDocuments(filter);

    res.json({
      seats: finalSeats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      summary: {
        total_seats: finalSeats.length,
        available: finalSeats.filter(s => s.status === 'available').length,
        occupied: finalSeats.filter(s => s.status === 'occupied').length
      }
    });

  } catch (error) {
    console.error('Get all seats error:', error);
    res.status(500).json({ 
      error: 'Failed to get seats',
      details: error.message 
    });
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
      status: { $in: ['confirmed', 'active'] },
      start_time: { $lte: now },
      end_time: { $gt: now }
    }).populate('user_id', 'name');

    const seatData = {
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
      occupied_by_name: activeBooking?.user_id.name || null,
      occupied_until: activeBooking?.end_time || null,
      created_at: seat.createdAt,
      updated_at: seat.updatedAt
    };

    res.json({ seat: seatData });

  } catch (error) {
    console.error('Get seat by ID error:', error);
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
      seat_type = 'individual',
      has_power = false,
      has_monitor = false
    } = req.body;

    // Validate required fields
    if (!building || !floor_hall || !section || !seat_number) {
      return res.status(400).json({
        error: 'Missing required fields: building, floor_hall, section, seat_number'
      });
    }

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
      section: section.toUpperCase(),
      seat_number,
      seat_type,
      has_power,
      has_monitor,
      is_active: true
    });

    await seat.save();

    res.status(201).json({
      message: 'Seat created successfully',
      seat: {
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
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      }
    });

  } catch (error) {
    console.error('Create seat error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Seat already exists in this location'
      });
    }
    
    res.status(500).json({ error: 'Failed to create seat' });
  }
};

const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const seat = await Seat.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.json({
      message: 'Seat updated successfully',
      seat: {
        id: seat._id,
        building: seat.building,
        floor_hall: seat.floor_hall,
        section: seat.section,
        seat_number: seat.seat_number,
        seat_type: seat.seat_type,
        has_power: seat.has_power,
        has_monitor: seat.has_monitor,
        is_active: seat.is_active,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      }
    });

  } catch (error) {
    console.error('Update seat error:', error);
    res.status(500).json({ error: 'Failed to update seat' });
  }
};

const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if seat has active bookings
    const activeBookings = await Booking.find({
      seat_id: id,
      status: { $in: ['confirmed', 'active'] },
      end_time: { $gt: new Date() }
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

    res.json({ 
      message: 'Seat deleted successfully',
      deleted_seat: {
        id: seat._id,
        building: seat.building,
        floor_hall: seat.floor_hall,
        section: seat.section,
        seat_number: seat.seat_number
      }
    });

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