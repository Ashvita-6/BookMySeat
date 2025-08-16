const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seat_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'auto_cancelled'],
    default: 'pending'
  },
  confirmation_deadline: {
    type: Date,
    required: true // 15 minutes from booking creation
  },
  confirmed_at: {
    type: Date
  },
  wifi_mac_address: {
    type: String // MAC address from WiFi connection
  },
  auto_cancel_job_id: {
    type: String // To track scheduled cancellation job
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ seat_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ start_time: 1, end_time: 1 });
bookingSchema.index({ confirmation_deadline: 1, status: 1 });

// Validation: end_time must be after start_time
bookingSchema.pre('save', function(next) {
  if (this.end_time <= this.start_time) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Set confirmation deadline before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmation_deadline) {
    this.confirmation_deadline = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);