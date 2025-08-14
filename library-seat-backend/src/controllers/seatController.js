const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

const getAllSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ is_active: true }).sort({ floor: 1, section: 1, seat_number: 1 });
    
    // Get all active bookings
    const activeBookings = await Booking.find({
      status: 'active',
      end_time: { $gt: new Date() }
    }).populate('user_id', 'name');

    // Add status to each seat
    const seatsWithStatus = seats.map(seat => {
      const booking = activeBookings.find(b => b.seat_id.toString() === seat._id.toString());
      
      return {
        id: seat._id,
        floor: seat.floor,
        section: seat.section,
        seat_number: seat.seat_number,
        seat_type: seat.seat_type,
        has_power: seat.has_power,
        has_monitor: seat.has_monitor,
        is_active: seat.is_active,
        status: booking ? 'occupied' : 'available',
        occupied_by: booking ? booking.user_id._id : null,
        occupied_until: booking ? booking.end_time : null,
        occupied_by_name: booking ? booking.user_id.name : null,
        created_at: seat.createdAt,
        updated_at: seat.updatedAt
      };
    });

    res.json({ seats: seatsWithStatus });
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

    // Check if seat is currently booked
    const booking = await Booking.findOne({
      seat_id: id,
      status: 'active',
      end_time: { $gt: new Date() }
    }).populate('user_id', 'name');

    const seatWithStatus = {
      id: seat._id,
      floor: seat.floor,
      section: seat.section,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      has_power: seat.has_power,
      has_monitor: seat.has_monitor,
      is_active: seat.is_active,
      status: booking ? 'occupied' : 'available',
      occupied_by: booking ? booking.user_id._id : null,
      occupied_until: booking ? booking.end_time : null,
      occupied_by_name: booking ? booking.user_id.name : null,
      created_at: seat.createdAt,
      updated_at: seat.updatedAt
    };

    res.json({ seat: seatWithStatus });
  } catch (error) {
    console.error('Get seat error:', error);
    res.status(500).json({ error: 'Failed to get seat' });
  }
};

const createSeat = async (req, res) => {
  try {
    const { floor, section, seat_number, seat_type, has_power, has_monitor } = req.body;

    const seat = new Seat({
      floor,
      section: section.toUpperCase(),
      seat_number,
      seat_type: seat_type || 'individual',
      has_power: has_power || false,
      has_monitor: has_monitor || false
    });

    await seat.save();

    res.status(201).json({ 
      message: 'Seat created successfully',
      seat: {
        id: seat._id,
        floor: seat.floor,
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
    console.error('Create seat error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Seat already exists at this location' });
    }
    res.status(500).json({ error: 'Failed to create seat' });
  }
};

const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
        floor: seat.floor,
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
      status: 'active',
      end_time: { $gt: new Date() }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete seat with active bookings' });
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

module.exports = { getAllSeats, getSeatById, createSeat, updateSeat, deleteSeat };