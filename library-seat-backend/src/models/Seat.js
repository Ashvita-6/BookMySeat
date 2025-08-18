// library-seat-backend/src/models/Seat.js
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  building: {
    type: String,
    required: true,
    enum: ['main', 'reading']
  },
  floor_hall: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  seat_number: {
    type: String,
    required: true
  },
  seat_type: {
    type: String,
    required: true,
    enum: ['individual', 'group', 'computer']
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

// Compound index to ensure unique seats per location
seatSchema.index({ building: 1, floor_hall: 1, section: 1, seat_number: 1 }, { unique: true });

// Indexes for better performance
seatSchema.index({ building: 1, floor_hall: 1 });
seatSchema.index({ seat_type: 1 });
seatSchema.index({ is_active: 1 });

module.exports = mongoose.model('Seat', seatSchema);