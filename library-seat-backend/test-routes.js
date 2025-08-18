// library-seat-backend/test-routes.js - Create this file to test basic functionality
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Simple test routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/seats', (req, res) => {
  res.json({ 
    seats: [
      {
        id: 1,
        building: 'main',
        floor_hall: 'ground_floor',
        section: 'A',
        seat_number: '1',
        seat_type: 'individual',
        has_power: true,
        has_monitor: false,
        is_active: true,
        status: 'available',
        occupied_by: null,
        occupied_until: null,
        occupied_by_name: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
  });
});

app.get('/api/bookings/my-bookings', (req, res) => {
  res.json({ bookings: [] });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Seats: http://localhost:${PORT}/api/seats`);
});

module.exports = app;