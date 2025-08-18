// library-seat-backend/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // This automatically creates an index
    lowercase: true,
    trim: true
    // REMOVED: index: true - Don't add this when unique is already true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  student_id: {
    type: String,
    required: true,
    unique: true, // This automatically creates an index
    uppercase: true,
    trim: true
    // REMOVED: index: true - Don't add this when unique is already true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// REMOVED duplicate index creation
// userSchema.index({ email: 1 }); // REMOVED - unique already creates this
// userSchema.index({ student_id: 1 }); // REMOVED - unique already creates this

module.exports = mongoose.model('User', userSchema);