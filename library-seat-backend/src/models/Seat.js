const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  building: {
    type: String,
    enum: ['main', 'reading'],
    required: true
  },
  floor_hall: {
    type: String,
    required: true // For main: 'ground_floor', 'first_floor'. For reading: 'hall_1', 'hall_2', 'hall_3'
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
    enum: ['individual', 'group', 'computer'],
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
seatSchema.index({ building: 1, floor_hall: 1, section: 1, seat_number: 1 }, { unique: true });
seatSchema.index({ is_active: 1 });
seatSchema.index({ building: 1, floor_hall: 1 });

module.exports = mongoose.model('Seat', seatSchema);