// library-seat-backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store io instance in app locals for use in controllers
app.locals.io = io;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Library Seat Booking API',
    version: '1.0.0'
  });
});

console.log('🔧 Loading routes...');

// Auth routes
try {
  const authRoutes = require('./routes/auth');
  if (authRoutes) {
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
  } else {
    throw new Error('Auth routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  app.use('/api/auth', (req, res) => {
    res.status(503).json({ error: 'Auth service unavailable' });
  });
}

// Seat routes
try {
  const seatRoutes = require('./routes/seats');
  if (seatRoutes) {
    app.use('/api/seats', seatRoutes);
    console.log('✅ Seat routes loaded');
  } else {
    throw new Error('Seat routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load seat routes:', error.message);
  app.use('/api/seats', (req, res) => {
    res.status(503).json({ error: 'Seat service unavailable' });
  });
}

// Booking routes
try {
  const bookingRoutes = require('./routes/bookings');
  if (bookingRoutes) {
    app.use('/api/bookings', bookingRoutes);
    console.log('✅ Booking routes loaded');
  } else {
    throw new Error('Booking routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load booking routes:', error.message);
  app.use('/api/bookings', (req, res) => {
    res.status(503).json({ error: 'Booking service unavailable' });
  });
}

// Break routes
try {
  const breakRoutes = require('./routes/breaks');
  if (breakRoutes) {
    app.use('/api/breaks', breakRoutes);
    console.log('✅ Break routes loaded');
  } else {
    throw new Error('Break routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load break routes:', error.message);
  app.use('/api/breaks', (req, res) => {
    res.status(503).json({ error: 'Break service unavailable' });
  });
}

// Users routes
try {
  const userRoutes = require('./routes/users');
  if (userRoutes) {
    app.use('/api/users', userRoutes);
    console.log('✅ User routes loaded');
  } else {
    throw new Error('User routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
  app.use('/api/users', (req, res) => {
    res.status(503).json({ error: 'User service unavailable' });
  });
}

// NOTE: WiFi routes removed as per requirement

console.log('✅ Route loading complete!');

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join seat room for real-time updates
  socket.on('joinSeat', (seatId) => {
    socket.join(`seat_${seatId}`);
    console.log(`User ${socket.id} joined seat room: seat_${seatId}`);
  });

  // Leave seat room
  socket.on('leaveSeat', (seatId) => {
    socket.leave(`seat_${seatId}`);
    console.log(`User ${socket.id} left seat room: seat_${seatId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = { app, server };