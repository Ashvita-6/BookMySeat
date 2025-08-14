const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  floor: {
    type: Number,
    required: true
  },
  section: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  seat_number: {
    type: String,
    required: true,
    trim: true
  },
  seat_type: {
    type: String,
    enum: ['individual', 'group', 'quiet', 'computer'],
    default: 'individual'
  },
  has_power: {
    type: Boolean,
    default: false
  },
  has_monitor: {
    type: Boolean,
    default: false
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique seat identification
seatSchema.index({ floor: 1, section: 1, seat_number: 1 }, { unique: true });
seatSchema.index({ is_active: 1 });

module.exports = mongoose.model('Seat', seatSchema);