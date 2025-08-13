const pool = require('../config/database');

const getAllSeats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             CASE 
               WHEN b.id IS NOT NULL AND b.end_time > NOW() THEN 'occupied'
               ELSE 'available'
             END as status,
             b.user_id as occupied_by,
             b.end_time as occupied_until,
             u.name as occupied_by_name
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.end_time > NOW()
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY s.floor, s.section, s.seat_number
    `);

    res.json({ seats: result.rows });
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ error: 'Failed to get seats' });
  }
};

const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, 
             CASE 
               WHEN b.id IS NOT NULL AND b.end_time > NOW() THEN 'occupied'
               ELSE 'available'
             END as status,
             b.user_id as occupied_by,
             b.end_time as occupied_until,
             u.name as occupied_by_name
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id AND b.status = 'active' AND b.end_time > NOW()
      LEFT JOIN users u ON b.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.json({ seat: result.rows[0] });
  } catch (error) {
    console.error('Get seat error:', error);
    res.status(500).json({ error: 'Failed to get seat' });
  }
};

const createSeat = async (req, res) => {
  try {
    const { floor, section, seat_number, seat_type, has_power, has_monitor } = req.body;

    const result = await pool.query(
      'INSERT INTO seats (floor, section, seat_number, seat_type, has_power, has_monitor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [floor, section, seat_number, seat_type || 'individual', has_power || false, has_monitor || false]
    );

    res.status(201).json({ 
      message: 'Seat created successfully',
      seat: result.rows[0] 
    });
  } catch (error) {
    console.error('Create seat error:', error);
    res.status(500).json({ error: 'Failed to create seat' });
  }
};

const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const { floor, section, seat_number, seat_type, has_power, has_monitor, is_active } = req.body;

    const result = await pool.query(
      'UPDATE seats SET floor = $1, section = $2, seat_number = $3, seat_type = $4, has_power = $5, has_monitor = $6, is_active = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [floor, section, seat_number, seat_type, has_power, has_monitor, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.json({ 
      message: 'Seat updated successfully',
      seat: result.rows[0] 
    });
  } catch (error) {
    console.error('Update seat error:', error);
    res.status(500).json({ error: 'Failed to update seat' });
  }
};

const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if seat has active bookings
    const activeBookings = await pool.query(
      'SELECT * FROM bookings WHERE seat_id = $1 AND status = $2 AND end_time > NOW()',
      [id, 'active']
    );

    if (activeBookings.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete seat with active bookings' });
    }

    const result = await pool.query('DELETE FROM seats WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }

    res.json({ message: 'Seat deleted successfully' });
  } catch (error) {
    console.error('Delete seat error:', error);
    res.status(500).json({ error: 'Failed to delete seat' });
  }
};

module.exports = { getAllSeats, getSeatById, createSeat, updateSeat, deleteSeat };
