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

// Import and use routes with error handling (WiFi route removed)
const routes = [
  { path: '/api/auth', file: './routes/auth' },
  { path: '/api/seats', file: './routes/seats' },
  { path: '/api/bookings', file: './routes/bookings' },
  { path: '/api/breaks', file: './routes/breaks' },
  { path: '/api/users', file: './routes/users' }
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
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle seat-related events
  socket.on('joinSeat', (seatId) => {
    socket.join(`seat_${seatId}`);
    console.log(`User ${socket.id} joined seat ${seatId}`);
  });

  socket.on('leaveSeat', (seatId) => {
    socket.leave(`seat_${seatId}`);
    console.log(`User ${socket.id} left seat ${seatId}`);
  });

  // Handle break-related events
  socket.on('joinBreaks', () => {
    socket.join('breaks');
    console.log(`User ${socket.id} joined breaks channel`);
  });

  socket.on('leaveBreaks', () => {
    socket.leave('breaks');
    console.log(`User ${socket.id} left breaks channel`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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