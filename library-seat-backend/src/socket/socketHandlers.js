const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Store socket instance globally for use in controllers
  const app = require('../app');
  app.locals.io = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user-${socket.userId}`);

    // Join admin users to admin room
    if (socket.userRole === 'admin') {
      socket.join('admin');
    }

    // Handle joining seat-specific rooms for real-time updates
    socket.on('joinSeat', (seatId) => {
      socket.join(`seat-${seatId}`);
      console.log(`User ${socket.userId} joined seat ${seatId} room`);
    });

    socket.on('leaveSeat', (seatId) => {
      socket.leave(`seat-${seatId}`);
      console.log(`User ${socket.userId} left seat ${seatId} room`);
    });

    // Handle real-time seat status requests
    socket.on('getSeatStatus', async (seatId) => {
      try {
        const pool = require('../config/database');
        const result = await pool.query(`
          SELECT s.*, 
                 CASE 
                   WHEN b.id IS NOT NULL AND b.end_time > NOW() THEN 'occupied'
                   ELSE 'available'
                 END as status,
                 b.end_time as occupied_until
          FROM seats s
          LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.end_time > NOW()
          WHERE s.id = $1
        `, [seatId]);

        socket.emit('seatStatus', {
          seatId,
          status: result.rows[0]?.status || 'available',
          occupiedUntil: result.rows[0]?.occupied_until
        });
      } catch (error) {
        console.error('Error getting seat status:', error);
        socket.emit('error', { message: 'Failed to get seat status' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  // Function to emit seat updates to all clients
  const emitSeatUpdate = (seatId, data) => {
    io.to(`seat-${seatId}`).emit('seatUpdate', data);
    io.emit('seatListUpdate', { seatId, ...data });
  };

  // Function to emit booking updates
  const emitBookingUpdate = (userId, data) => {
    io.to(`user-${userId}`).emit('bookingUpdate', data);
    io.to('admin').emit('adminBookingUpdate', data);
  };

  return { emitSeatUpdate, emitBookingUpdate };
};
