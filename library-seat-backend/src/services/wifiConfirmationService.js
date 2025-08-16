const Booking = require('../models/Booking');
const User = require('../models/User');
const cron = require('node-cron');

class WiFiConfirmationService {
  constructor() {
    this.activeJobs = new Map(); // Track scheduled cancellation jobs
    this.startCronJob();
  }

  // Start cron job to check for unconfirmed bookings every minute
  startCronJob() {
    cron.schedule('* * * * *', async () => {
      await this.cancelUnconfirmedBookings();
    });
    console.log('WiFi confirmation cron job started');
  }

  // Schedule auto-cancellation for a booking
  async scheduleAutoCancellation(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== 'pending') {
        return;
      }

      // Calculate timeout (15 minutes from creation)
      const timeoutMs = booking.confirmation_deadline.getTime() - Date.now();
      
      if (timeoutMs <= 0) {
        // Already past deadline, cancel immediately
        await this.cancelBooking(bookingId, 'auto_cancelled');
        return;
      }

      // Store job ID for tracking
      const jobId = `auto_cancel_${bookingId}`;
      booking.auto_cancel_job_id = jobId;
      await booking.save();

      console.log(`Scheduled auto-cancellation for booking ${bookingId} in ${timeoutMs}ms`);
    } catch (error) {
      console.error('Error scheduling auto-cancellation:', error);
    }
  }

  // Check and cancel unconfirmed bookings
  async cancelUnconfirmedBookings() {
    try {
      const now = new Date();
      const expiredBookings = await Booking.find({
        status: 'pending',
        confirmation_deadline: { $lt: now }
      }).populate('seat_id user_id');

      for (const booking of expiredBookings) {
        await this.cancelBooking(booking._id, 'auto_cancelled');
        console.log(`Auto-cancelled booking ${booking._id} for user ${booking.user_id.name}`);
      }
    } catch (error) {
      console.error('Error checking unconfirmed bookings:', error);
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId, status = 'cancelled') {
    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true }
      ).populate('seat_id user_id');

      if (booking) {
        // Remove from active jobs
        const jobId = booking.auto_cancel_job_id;
        if (jobId && this.activeJobs.has(jobId)) {
          clearTimeout(this.activeJobs.get(jobId));
          this.activeJobs.delete(jobId);
        }

        // Emit socket event for real-time updates
        if (global.io) {
          global.io.emit('bookingCancelled', {
            booking_id: bookingId,
            seat_id: booking.seat_id._id,
            reason: status === 'auto_cancelled' ? 'No WiFi confirmation within 15 minutes' : 'Manual cancellation'
          });
        }

        return booking;
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Confirm booking via WiFi connection
  async confirmBookingViaWiFi(userMacAddress, userIdentifier) {
    try {
      // Find user by student ID or email
      const user = await User.findOne({
        $or: [
          { student_id: userIdentifier },
          { email: userIdentifier }
        ]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Find pending booking for this user
      const booking = await Booking.findOne({
        user_id: user._id,
        status: 'pending',
        confirmation_deadline: { $gt: new Date() }
      }).populate('seat_id');

      if (!booking) {
        throw new Error('No pending booking found or confirmation deadline passed');
      }

      // Confirm the booking
      booking.status = 'confirmed';
      booking.confirmed_at = new Date();
      booking.wifi_mac_address = userMacAddress;
      await booking.save();

      // Clear scheduled auto-cancellation
      if (booking.auto_cancel_job_id && this.activeJobs.has(booking.auto_cancel_job_id)) {
        clearTimeout(this.activeJobs.get(booking.auto_cancel_job_id));
        this.activeJobs.delete(booking.auto_cancel_job_id);
      }

      // Emit socket event
      if (global.io) {
        global.io.emit('bookingConfirmed', {
          booking_id: booking._id,
          seat_id: booking.seat_id._id,
          user_id: user._id
        });
      }

      console.log(`Booking ${booking._id} confirmed via WiFi for user ${user.name}`);
      return booking;
    } catch (error) {
      console.error('Error confirming booking via WiFi:', error);
      throw error;
    }
  }

  // Manual confirmation endpoint (for testing or manual confirmation)
  async manualConfirmBooking(bookingId) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.status !== 'pending') {
        throw new Error('Booking not found or not in pending status');
      }

      if (new Date() > booking.confirmation_deadline) {
        throw new Error('Confirmation deadline has passed');
      }

      booking.status = 'confirmed';
      booking.confirmed_at = new Date();
      await booking.save();

      // Clear scheduled auto-cancellation
      if (booking.auto_cancel_job_id && this.activeJobs.has(booking.auto_cancel_job_id)) {
        clearTimeout(this.activeJobs.get(booking.auto_cancel_job_id));
        this.activeJobs.delete(booking.auto_cancel_job_id);
      }

      return booking;
    } catch (error) {
      console.error('Error manually confirming booking:', error);
      throw error;
    }
  }
}

module.exports = new WiFiConfirmationService();
