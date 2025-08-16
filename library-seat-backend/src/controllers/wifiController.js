// library-seat-backend/src/controllers/wifiController.js
const wifiConfirmationService = require('../services/wifiConfirmationService');
const Booking = require('../models/Booking');

// Webhook endpoint for WiFi system to confirm user presence
const confirmViaWiFi = async (req, res) => {
  try {
    const { mac_address, user_identifier } = req.body;

    if (!mac_address || !user_identifier) {
      return res.status(400).json({ 
        error: 'MAC address and user identifier are required' 
      });
    }

    const booking = await wifiConfirmationService.confirmBookingViaWiFi(
      mac_address, 
      user_identifier
    );

    res.json({
      message: 'Booking confirmed via WiFi',
      booking: {
        id: booking._id,
        user_id: booking.user_id,
        seat_id: booking.seat_id,
        status: booking.status,
        confirmed_at: booking.confirmed_at
      }
    });
  } catch (error) {
    console.error('WiFi confirmation error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Manual confirmation endpoint (for admin or testing)
const manualConfirm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await wifiConfirmationService.manualConfirmBooking(id);

    res.json({
      message: 'Booking confirmed manually',
      booking: {
        id: booking._id,
        user_id: booking.user_id,
        seat_id: booking.seat_id,
        status: booking.status,
        confirmed_at: booking.confirmed_at
      }
    });
  } catch (error) {
    console.error('Manual confirmation error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get pending bookings that need confirmation
const getPendingConfirmations = async (req, res) => {
  try {
    const pendingBookings = await Booking.find({
      status: 'pending',
      confirmation_deadline: { $gt: new Date() }
    })
    .populate('user_id', 'name student_id email')
    .populate('seat_id', 'building floor_hall section seat_number seat_type')
    .sort({ createdAt: -1 });

    const formattedBookings = pendingBookings.map(booking => ({
      id: booking._id,
      user: {
        id: booking.user_id._id,
        name: booking.user_id.name,
        student_id: booking.user_id.student_id,
        email: booking.user_id.email
      },
      seat: {
        id: booking.seat_id._id,
        building: booking.seat_id.building,
        floor_hall: booking.seat_id.floor_hall,
        section: booking.seat_id.section,
        seat_number: booking.seat_id.seat_number,
        seat_type: booking.seat_id.seat_type
      },
      start_time: booking.start_time,
      end_time: booking.end_time,
      confirmation_deadline: booking.confirmation_deadline,
      time_remaining: Math.max(0, booking.confirmation_deadline.getTime() - Date.now()),
      created_at: booking.createdAt
    }));

    res.json({ pending_bookings: formattedBookings });
  } catch (error) {
    console.error('Error getting pending confirmations:', error);
    res.status(500).json({ error: 'Failed to get pending confirmations' });
  }
};

// Simulate WiFi connection (for testing purposes)
const simulateWiFiConnection = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // Generate a fake MAC address for simulation
    const fakeMacAddress = `02:${Math.random().toString(16).substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}:${Math.random().toString(16).substr(2, 2)}`;
    
    // Find user and try to confirm their booking
    const User = require('../models/User');
    const user = await User.findById(user_id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const booking = await wifiConfirmationService.confirmBookingViaWiFi(
      fakeMacAddress,
      user.student_id
    );

    res.json({
      message: 'WiFi connection simulated and booking confirmed',
      booking: {
        id: booking._id,
        status: booking.status,
        confirmed_at: booking.confirmed_at,
        wifi_mac_address: booking.wifi_mac_address
      }
    });
  } catch (error) {
    console.error('WiFi simulation error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  confirmViaWiFi,
  manualConfirm,
  getPendingConfirmations,
  simulateWiFiConnection
};