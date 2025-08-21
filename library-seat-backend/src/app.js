require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server: SocketServer } = require('socket.io');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io accessible throughout the app
app.locals.io = io;
global.io = io; // Make available for cleanup jobs

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS configuration - FIXED: More permissive CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and development
    return req.path === '/api/health' || process.env.NODE_ENV === 'development';
  }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: 'Server is running correctly'
  });
});

// Load routes with better error handling
console.log('🔄 Loading routes...');

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

// Seats routes
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

// Bookings routes
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

// WiFi routes
try {
  const wifiRoutes = require('./routes/wifi');
  if (wifiRoutes) {
    app.use('/api/wifi', wifiRoutes);
    console.log('✅ WiFi routes loaded');
  } else {
    throw new Error('WiFi routes module returned undefined');
  }
} catch (error) {
  console.error('❌ Failed to load wifi routes:', error.message);
  app.use('/api/wifi', (req, res) => {
    res.status(503).json({ error: 'WiFi service unavailable' });
  });
}

console.log('✅ Route loading complete!');

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle seat-related events
  socket.on('joinSeat', (seatId) => {
    socket.join(`seat_${seatId}`);
    console.log(`👤 User ${socket.id} joined seat ${seatId}`);
  });

  socket.on('leaveSeat', (seatId) => {
    socket.leave(`seat_${seatId}`);
    console.log(`👤 User ${socket.id} left seat ${seatId}`);
  });

  // Handle break-related events
  socket.on('joinBreaks', () => {
    socket.join('breaks');
    console.log(`👤 User ${socket.id} joined breaks channel`);
  });

  socket.on('leaveBreaks', () => {
    socket.leave('breaks');
    console.log(`👤 User ${socket.id} left breaks channel`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

module.exports = { app, server };