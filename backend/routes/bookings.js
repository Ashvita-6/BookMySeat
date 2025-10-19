const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { 
  checkAttendance, 
  scheduleAttendanceCheck, 
  checkAndCancelExpiredBookings 
} = require('../services/attendanceChecker');
const { checkUserBookingsExpiration } = require('../services/bookingExpirationService');
const { validateBookingWindow } = require('../utils/timeValidation');

// Helper functions
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isTimeWithinBreak(startTime, endTime, breakStart, breakEnd) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const bStart = timeToMinutes(breakStart);
  const bEnd = timeToMinutes(breakEnd);
  
  return start >= bStart && end <= bEnd;
}

function timeRangesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  return s1 < e2 && e1 > s2;
}

function generateDeviceFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  return `${userAgent}-${acceptLanguage}-${acceptEncoding}`;
}

// Book a seat - FIXED: Now checks device fingerprint instead of user
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const { seatId, date, startTime, endTime } = req.body;

    if (!seatId || !date || !startTime || !endTime) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Validate booking window
    const bookingWindowCheck = validateBookingWindow(startTime, endTime);
    if (!bookingWindowCheck.isValid) {
      return res.status(400).json({ 
        message: bookingWindowCheck.message 
      });
    }

    // Generate device fingerprint FIRST (before any checks)
    if (!req.headers['user-agent'] || !req.headers['accept-language']) {
      return res.status(400).json({ 
        message: 'Browser information is required to make a booking. Please ensure cookies and headers are enabled.' 
      });
    }
    const deviceFingerprint = generateDeviceFingerprint(req);

    // FIXED: Check if DEVICE already has a booking in THIS SPECIFIC time slot
    const bookingDate = new Date(date);
    const dayStart = new Date(bookingDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingDate);
    dayEnd.setHours(23, 59, 59, 999);

    // CRITICAL FIX: Query by deviceFingerprint instead of user
    const deviceBookings = await Booking.find({
      deviceFingerprint: deviceFingerprint,  // <-- Changed from user: req.userId
      date: {
        $gte: dayStart,
        $lt: dayEnd
      },
      status: { $in: ['pending', 'confirmed', 'on-break'] }
    });

    // Check for time overlap with any booking from this device
    for (const deviceBooking of deviceBookings) {
      const bookStartMin = timeToMinutes(deviceBooking.startTime);
      const bookEndMin = timeToMinutes(deviceBooking.endTime);
      const reqStartMin = timeToMinutes(startTime);
      const reqEndMin = timeToMinutes(endTime);

      // Check for overlap: reqStart < bookEnd AND bookStart < reqEnd
      if (reqStartMin < bookEndMin && bookStartMin < reqEndMin) {
        return res.status(400).json({ 
          message: `This device already has a booking from ${deviceBooking.startTime} to ${deviceBooking.endTime}. Cannot book overlapping time slots from the same device.` 
        });
      }
    }

    const seat = await Seat.findById(seatId);
    if (!seat) {
      return res.status(404).json({ 
        message: 'Seat not found' 
      });
    }
   
    if (seat.status == 'occupied' ) {
      return res.status(400).json({ 
        message: 'Seat is not available' 
      });
    }

    // Check if seat has conflicting bookings for THIS SPECIFIC time slot
    const existingBookings = await Booking.find({
      seat: seatId,
      date: {
        $gte: dayStart,
        $lt: dayEnd
      },
      status: { $in: ['pending', 'confirmed', 'on-break'] }
    });

    // Check each existing booking for time conflicts
    for (const existingBooking of existingBookings) {
      const bookStartMin = timeToMinutes(existingBooking.startTime);
      const bookEndMin = timeToMinutes(existingBooking.endTime);
      const reqStartMin = timeToMinutes(startTime);
      const reqEndMin = timeToMinutes(endTime);

      if (existingBooking.status === 'on-break' && existingBooking.currentBreak) {
        // If the booking is on break, check if requested time is within the break
        const isWithinBreak = isTimeWithinBreak(
          startTime,
          endTime,
          existingBooking.currentBreak.startTime,
          existingBooking.currentBreak.endTime
        );

        if (!isWithinBreak) {
          // Requested time is NOT within break, check for overlap with non-break portions
          if (reqStartMin < bookEndMin && reqEndMin > bookStartMin) {
            return res.status(400).json({ 
              message: 'Seat is already booked for this time slot (outside break time)' 
            });
          }
        }
        // If within break, this booking doesn't conflict - continue
      } else {
        // Regular booking - check for ANY time overlap
        if (reqStartMin < bookEndMin && reqEndMin > bookStartMin) {
          return res.status(400).json({ 
            message: 'Seat is already booked for this time slot' 
          });
        }
      }
    }

    // Create the booking
    const booking = new Booking({
      user: req.userId,
      seat: seatId,
      date: bookingDate,
      startTime,
      endTime,
      status: 'pending',
      deviceFingerprint,
      attendanceConfirmed: false
    });

    await booking.save();

    seat.status = 'occupied';
    await seat.save();

    scheduleAttendanceCheck(booking);

    const populatedBooking = await Booking.findById(booking._id).populate('seat user');

    res.status(201).json({
      message: 'Booking created successfully. Please confirm attendance within 20 minutes.',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      message: 'Error creating booking',
      error: error.message 
    });
  }
});

// Start a break
router.post('/start-break/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { breakStartTime, breakEndTime } = req.body;

    if (!breakStartTime || !breakEndTime) {
      return res.status(400).json({ 
        message: 'Break start and end times are required' 
      });
    }

    const booking = await Booking.findById(bookingId).populate('seat');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Unauthorized' 
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Can only take breaks during confirmed bookings' 
      });
    }

    if (!timeRangesOverlap(
      breakStartTime, 
      breakEndTime, 
      booking.startTime, 
      booking.endTime
    )) {
      return res.status(400).json({ 
        message: 'Break time must be within your booking time' 
      });
    }

    const seat = await Seat.findById(booking.seat._id);
    if (!seat) {
      return res.status(404).json({ 
        message: 'Seat not found' 
      });
    }

    const dayStart = new Date(booking.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(booking.date);
    dayEnd.setHours(23, 59, 59, 999);

    const otherBookings = await Booking.find({
      seat: booking.seat._id,
      date: {
        $gte: dayStart,
        $lt: dayEnd
      },
      _id: { $ne: booking._id },
      status: { $in: ['pending', 'confirmed'] }
    });

    for (const otherBooking of otherBookings) {
      if (!isTimeWithinBreak(
        otherBooking.startTime,
        otherBooking.endTime,
        breakStartTime,
        breakEndTime
      )) {
        return res.status(400).json({ 
          message: `Another user has booked this seat during your break time (${otherBooking.startTime} - ${otherBooking.endTime})` 
        });
      }
    }

    if (booking.breaks && booking.breaks.length > 0) {
      for (const existingBreak of booking.breaks) {
        if (timeRangesOverlap(
          existingBreak.startTime,
          existingBreak.endTime,
          breakStartTime,
          breakEndTime
        )) {
          return res.status(400).json({ 
            message: `Break time overlaps with an existing break (${existingBreak.startTime} - ${existingBreak.endTime})` 
          });
        }
      }
    }

    booking.currentBreak = {
      startTime: breakStartTime,
      endTime: breakEndTime,
      startedAt: new Date()
    };
    seat.status = 'on-break';
    booking.status = 'on-break';
    
    booking.markModified('currentBreak');
    booking.markModified('status');
    await seat.save();
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId).populate('seat');
   
    res.json({
      message: 'Break started successfully. Your seat is now available for others during break time.',
      booking: updatedBooking,
      currentBreak: updatedBooking.currentBreak
    });
  } catch (error) {
    console.error('Start break error:', error);
    res.status(500).json({ 
      message: 'Error starting break',
      error: error.message 
    });
  }
});

// End a break
router.post('/end-break/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('seat');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Unauthorized' 
      });
    }

    if (!booking.currentBreak || !booking.currentBreak.startTime) {
      return res.status(400).json({ 
        message: 'No active break found' 
      });
    }

    const dayStart = new Date(booking.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(booking.date);
    dayEnd.setHours(23, 59, 59, 999);

    const breakBookings = await Booking.find({
      seat: booking.seat._id,
      date: {
        $gte: dayStart,
        $lt: dayEnd
      },
      _id: { $ne: booking._id },
      status: { $in: ['pending', 'confirmed'] }
    });

    for (const otherBooking of breakBookings) {
      if (isTimeWithinBreak(
        otherBooking.startTime,
        otherBooking.endTime,
        booking.currentBreak.startTime,
        booking.currentBreak.endTime
      )) {
        return res.status(400).json({ 
          message: `Cannot end break yet. Another user has booked this seat during your break (${otherBooking.startTime} - ${otherBooking.endTime}). Please wait until their booking ends.` 
        });
      }
    }

    if (!booking.breaks) {
      booking.breaks = [];
    }
    
    booking.breaks.push({
      startTime: booking.currentBreak.startTime,
      endTime: booking.currentBreak.endTime,
      takenAt: booking.currentBreak.startedAt
    });

    booking.currentBreak = null;
    booking.status = 'confirmed';
    
    booking.markModified('breaks');
    booking.markModified('currentBreak');
    booking.markModified('status');
    
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId).populate('seat');

    res.json({
      message: 'Break ended successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('End break error:', error);
    res.status(500).json({ 
      message: 'Error ending break',
      error: error.message 
    });
  }
});

// Confirm attendance for a booking
router.post('/confirm-attendance/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Location coordinates are required' 
      });
    }

    const user = await User.findById(req.userId);
    if (user) {
      await User.findByIdAndUpdate(
        req.userId,
        {
          $set: {
            'lastKnownLocation.latitude': parseFloat(latitude),
            'lastKnownLocation.longitude': parseFloat(longitude),
            'lastKnownLocation.timestamp': new Date()
          }
        },
        { runValidators: false }
      );
    }

    const result = await checkAttendance(bookingId);

    if (result.success) {
      res.json({
        message: result.message,
        booking: result.booking,
        attendanceConfirmed: true
      });
    } else {
      res.status(400).json({
        message: result.message,
        attendanceConfirmed: false
      });
    }
  } catch (error) {
    console.error('Attendance confirmation error:', error);
    res.status(500).json({ 
      message: 'Error confirming attendance',
      error: error.message 
    });
  }
});

// Get user bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    // Check for expired bookings (attendance deadline passed)
    await checkAndCancelExpiredBookings(req.userId);
    
    // Check for completed bookings (slot time expired) and ended breaks
    await checkUserBookingsExpiration(req.userId);
    
    // Fetch all bookings
    const bookings = await Booking.find({ user: req.userId })
      .populate('seat')
      .sort({ date: -1, startTime: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings' 
    });
  }
});

// Get booking by ID
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('seat user');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }

    if (booking.user._id.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Unauthorized access to booking' 
      });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Fetch booking error:', error);
    res.status(500).json({ 
      message: 'Error fetching booking' 
    });
  }
});

// Cancel a booking
router.delete('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate('seat');

    if (!booking) {
      return res.status(404).json({ 
        message: 'Booking not found' 
      });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ 
        message: 'Unauthorized' 
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Booking already cancelled' 
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = 'Cancelled by user';
    await booking.save();

    if (booking.seat) {
      await Seat.findByIdAndUpdate(
        booking.seat._id,
        { $set: { status: 'available' } },
        { runValidators: false }
      );
    }

    res.json({ 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      message: 'Error cancelling booking' 
    });
  }
});

module.exports = router;