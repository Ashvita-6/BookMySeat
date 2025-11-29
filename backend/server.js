// server.js
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    'https://bookmyseat-wl7m.onrender.com',
  ],
  credentials: true
}));

// Routes (attach after defining app)
const authRoutes = require('./routes/auth');
const seatRoutes = require('./routes/seats');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const { startExpirationChecker } = require('./services/bookingExpirationService');

app.use('/api/auth', authRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    features: {
      autoExpiration: 'enabled',
      autoBreakEnd: 'enabled'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library-booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✓ Connected to MongoDB');
  // startExpirationChecker will be started after server starts listening below
})
.catch((error) => console.error('MongoDB connection error:', error));

// Create HTTP server and attach Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// store io on app so controllers/workers can use it: req.app.get('io') or app.get('io')
app.set('io', io);

io.on("connection", (socket) => {
  console.log("WebSocket connected:", socket.id);

  // Send a simple message on connection
  socket.emit("hello", { msg: "WebSocket connection established" });

  socket.on('disconnect', () => {
    // optional: console.log('Socket disconnected:', socket.id);
  });
});

// Restore pending bookings attendance checks on server restart
const Booking = require('./models/Booking');
const { scheduleAttendanceCheck } = require('./services/attendanceChecker');

async function restoreAttendanceChecks() {
  try {
    const now = new Date();
    const pendingBookings = await Booking.find({
      status: 'pending',
      attendanceConfirmed: false,
      date: { $gte: now }
    });

    console.log(`Restoring ${pendingBookings.length} attendance checks...`);

    for (const booking of pendingBookings) {
      scheduleAttendanceCheck(booking);
    }
  } catch (error) {
    console.error('Error restoring attendance checks:', error);
  }
}

// Start server and then auxiliary services
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Once server is listening and DB is connected, start the expiration checker and restore checks
  try {
    await startExpirationChecker(); // if this expects DB ready
  } catch (e) {
    console.warn('startExpirationChecker failed or already running:', e.message || e);
  }
  await restoreAttendanceChecks();
});

module.exports = app;
