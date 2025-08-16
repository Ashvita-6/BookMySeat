// library-seat-backend/src/app.js
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

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import and use routes with error handling
const routes = [
  { path: '/api/auth', file: './routes/auth' },
  { path: '/api/seats', file: './routes/seats' },
  { path: '/api/bookings', file: './routes/bookings' },
  { path: '/api/users', file: './routes/users' },
  { path: '/api/wifi', file: './routes/wifi' }
];

routes.forEach(({ path, file }) => {
  try {
    const route = require(file);
    if (typeof route === 'function' || (route && typeof route.handle === 'function')) {
      app.use(path, route);
      console.log(`✓ Route loaded: ${path}`);
    } else {
      console.warn(`⚠️ Invalid route export for ${path}, skipping`);
    }
  } catch (error) {
    console.warn(`⚠️ Failed to load route ${path}:`, error.message);
    // Create a minimal fallback route
    app.use(path, (req, res) => {
      res.status(503).json({ 
        error: `${path} service temporarily unavailable`,
        message: 'Route not properly configured'
      });
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`📱 User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`📱 User disconnected: ${socket.id}`);
  });
  
  // Handle seat selection
  socket.on('selectSeat', (data) => {
    socket.broadcast.emit('seatSelected', {
      seatId: data.seatId,
      userId: data.userId
    });
  });

  // Handle booking updates
  socket.on('bookingUpdate', (data) => {
    socket.broadcast.emit('bookingChanged', data);
  });
});

// Initialize WiFi confirmation service with error handling
try {
  const wifiConfirmationService = require('./services/wifiConfirmationService');
  wifiConfirmationService.initialize(io);
  console.log('✓ WiFi confirmation service initialized');
} catch (error) {
  console.warn('⚠️ WiFi confirmation service not available:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export both app and server so server.js can use them
module.exports = { app, server };