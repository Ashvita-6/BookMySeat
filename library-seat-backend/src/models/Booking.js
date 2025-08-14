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
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ user_id: 1 });
bookingSchema.index({ seat_id: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ start_time: 1, end_time: 1 });

// Validation: end_time must be after start_time
bookingSchema.pre('save', function(next) {
  if (this.end_time <= this.start_time) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Booking', bookingSchema);