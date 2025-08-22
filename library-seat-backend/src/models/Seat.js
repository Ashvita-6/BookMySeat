// library-seat-backend/src/models/Seat.js
const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  building: {
    type: String,
    required: true,
    enum: ['reading'], // REMOVED 'main'
    default: 'reading'
  },
  floor_hall: {
    type: String,
    required: true,
    enum: ['hall_1', 'hall_2', 'hall_3'] // Only reading halls
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
    enum: ['individual'], // Only individual seats
    default: 'individual'
  },
  has_power: {
    type: Boolean,
    default: true // All reading hall seats have power
  },
  has_monitor: {
    type: Boolean,
    default: false // Reading halls don't have monitors
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