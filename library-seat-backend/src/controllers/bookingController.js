const pool = require('../config/database');

const createBooking = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { seat_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

    // Check if seat exists and is active
    const seatResult = await client.query('SELECT * FROM seats WHERE id = $1 AND is_active = true', [seat_id]);
    
    if (seatResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Seat not found or inactive' });
    }

    // Check if seat is available during the requested time
    const conflictResult = await client.query(
      'SELECT * FROM bookings WHERE seat_id = $1 AND status = $2 AND (($3 BETWEEN start_time AND end_time) OR ($4 BETWEEN start_time AND end_time) OR (start_time BETWEEN $3 AND $4))',
      [seat_id, 'active', start_time, end_time]
    );

    if (conflictResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Seat is not available during the requested time' });
    }

    // Check user's active bookings limit
    const userActiveBookings = await client.query(
      'SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND status = $2 AND end_time > NOW()',
      [user_id, 'active']
    );

    if (userActiveBookings.rows[0].count >= 2) { // Limit to 2 active bookings per user
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Maximum active bookings limit reached' });
    }

    // Create booking
    const bookingResult = await client.query(
      'INSERT INTO bookings (user_id, seat_id, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, seat_id, start_time, end_time, 'active']
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];

    // Get complete booking info with seat and user details
    const completeBooking = await pool.query(`
      SELECT b.*, s.floor, s.section, s.seat_number, s.seat_type, u.name as user_name
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [booking.id]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: completeBooking.rows[0]
    });

    // Emit socket event for real-time updates
    req.app.locals.io?.emit('seatBooked', {
      seat_id,
      booking: completeBooking.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT b.*, s.floor, s.section, s.seat_number, s.seat_type
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE b.user_id = $1
    `;
    const params = [user_id];

    if (status) {
      query += ' AND b.status = $2';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking exists and belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'active') {
      return res.status(400).json({ error: 'Booking is not active' });
    }

    // Update booking status
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    res.json({
      message: 'Booking cancelled successfully',
      booking: result.rows[0]
    });

    // Emit socket event for real-time updates
    req.app.locals.io?.emit('seatFreed', {
      seat_id: booking.seat_id,
      booking_id: id
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, seat_id, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT b.*, s.floor, s.section, s.seat_number, s.seat_type, u.name as user_name, u.student_id
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND b.status = $' + (params.length + 1);
      params.push(status);
    }

    if (seat_id) {
      query += ' AND b.seat_id = $' + (params.length + 1);
      params.push(seat_id);
    }

    query += ' ORDER BY b.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking, getAllBookings };