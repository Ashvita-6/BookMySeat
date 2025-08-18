// library-seat-backend/src/models/Break.js
const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  break_start_time: {
    type: Date,
    required: true
  },
  break_end_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'taken', 'expired', 'cancelled'],
    default: 'active'
  },
  taken_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  taken_at: {
    type: Date,
    default: null
  },
  // Break booking details for the person who takes the break
  break_booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  notes: {
    type: String,
    maxlength: 200,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better performance
breakSchema.index({ booking_id: 1 });
breakSchema.index({ user_id: 1 });
breakSchema.index({ seat_id: 1 });
breakSchema.index({ status: 1 });
breakSchema.index({ break_start_time: 1, break_end_time: 1 });

// Validation: break_end_time must be after break_start_time
breakSchema.pre('save', function(next) {
  if (this.break_end_time <= this.break_start_time) {
    next(new Error('Break end time must be after break start time'));
  }
  
  // Validate break duration (30 minutes to 5 hours)
  const duration = this.break_end_time - this.break_start_time;
  const minDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
  const maxDuration = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  
  if (duration < minDuration) {
    next(new Error('Break duration must be at least 30 minutes'));
  } else if (duration > maxDuration) {
    next(new Error('Break duration cannot exceed 5 hours'));
  } else {
    next();
  }
});

// Virtual for break duration in minutes
breakSchema.virtual('duration_minutes').get(function() {
  return Math.round((this.break_end_time - this.break_start_time) / (60 * 1000));
});

// Virtual for remaining time
breakSchema.virtual('time_remaining').get(function() {
  const now = new Date();
  if (this.break_end_time <= now) return 0;
  return Math.max(0, this.break_end_time - now);
});

// Method to check if break is expired
breakSchema.methods.isExpired = function() {
  return new Date() >= this.break_end_time;
};

// Method to check if break is available for booking
breakSchema.methods.isAvailable = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.break_start_time && 
         now < this.break_end_time;
};

// Static method to find available breaks
breakSchema.statics.findAvailable = function(filters = {}) {
  const now = new Date();
  const query = {
    status: 'active',
    break_start_time: { $lte: now },
    break_end_time: { $gt: now },
    ...filters
  };
  
  return this.find(query)
    .populate('user_id', 'name student_id')
    .populate('seat_id', 'building floor_hall section seat_number seat_type')
    .populate('booking_id', 'start_time end_time')
    .sort({ break_end_time: 1 });
};

module.exports = mongoose.model('Break', breakSchema);