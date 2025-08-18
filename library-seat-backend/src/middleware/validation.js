// library-seat-backend/src/middleware/validation.js
const validateBooking = (req, res, next) => {
  const { seat_id, start_time, end_time } = req.body;

  if (!seat_id) {
    return res.status(400).json({ error: 'Seat ID is required' });
  }

  if (!start_time) {
    return res.status(400).json({ error: 'Start time is required' });
  }

  if (!end_time) {
    return res.status(400).json({ error: 'End time is required' });
  }

  // Validate date format
  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  if (isNaN(startDate.getTime())) {
    return res.status(400).json({ error: 'Invalid start time format' });
  }

  if (isNaN(endDate.getTime())) {
    return res.status(400).json({ error: 'Invalid end time format' });
  }

  // Check if end time is after start time
  if (endDate <= startDate) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  // Check if start time is in the future
  const now = new Date();
  if (startDate < now) {
    return res.status(400).json({ error: 'Start time cannot be in the past' });
  }

  // Check maximum booking duration (e.g., 8 hours)
  const maxDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
  if (endDate - startDate > maxDuration) {
    return res.status(400).json({ error: 'Booking duration cannot exceed 8 hours' });
  }

  next();
};

// Add missing validateLogin function
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};

const validateBreak = (req, res, next) => {
  const { booking_id, break_start_time, break_end_time } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  if (!break_start_time) {
    return res.status(400).json({ error: 'Break start time is required' });
  }

  if (!break_end_time) {
    return res.status(400).json({ error: 'Break end time is required' });
  }

  // Validate date format
  const startTime = new Date(break_start_time);
  const endTime = new Date(break_end_time);

  if (isNaN(startTime.getTime())) {
    return res.status(400).json({ error: 'Invalid break start time format' });
  }

  if (isNaN(endTime.getTime())) {
    return res.status(400).json({ error: 'Invalid break end time format' });
  }

  // Validate duration
  const durationMs = endTime - startTime;
  const minDuration = 30 * 60 * 1000; // 30 minutes
  const maxDuration = 5 * 60 * 60 * 1000; // 5 hours

  if (durationMs < minDuration) {
    return res.status(400).json({ 
      error: 'Break duration must be at least 30 minutes' 
    });
  }

  if (durationMs > maxDuration) {
    return res.status(400).json({ 
      error: 'Break duration cannot exceed 5 hours' 
    });
  }

  // Check if end time is after start time
  if (endTime <= startTime) {
    return res.status(400).json({ 
      error: 'Break end time must be after start time' 
    });
  }

  // Validate notes length if provided
  if (req.body.notes && req.body.notes.length > 200) {
    return res.status(400).json({ 
      error: 'Notes cannot exceed 200 characters' 
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, student_id, password } = req.body;

  if (!name || !email || !student_id || !password) {
    return res.status(400).json({ 
      error: 'Name, email, student ID, and password are required' 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  // Validate student ID format (adjust regex as needed)
  const studentIdRegex = /^[A-Z0-9]{6,12}$/;
  if (!studentIdRegex.test(student_id.toUpperCase())) {
    return res.status(400).json({ 
      error: 'Student ID must be 6-12 characters long and contain only letters and numbers' 
    });
  }

  next();
};

const validateSeat = (req, res, next) => {
  const { building, floor_hall, section, seat_number, seat_type } = req.body;

  if (!building || !floor_hall || !section || !seat_number || !seat_type) {
    return res.status(400).json({ 
      error: 'Building, floor/hall, section, seat number, and seat type are required' 
    });
  }

  // Validate building
  if (!['main', 'reading'].includes(building)) {
    return res.status(400).json({ 
      error: 'Building must be either "main" or "reading"' 
    });
  }

  // Validate seat type
  if (!['individual', 'group', 'computer'].includes(seat_type)) {
    return res.status(400).json({ 
      error: 'Seat type must be "individual", "group", or "computer"' 
    });
  }

  next();
};

module.exports = {
  validateBooking,
  validateLogin,  // Added this export
  validateBreak,
  validateUser,
  validateSeat
};