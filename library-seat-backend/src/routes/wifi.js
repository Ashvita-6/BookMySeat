// library-seat-backend/src/routes/wifi.js
const express = require('express');
const router = express.Router();

// Health check for wifi service (simplified)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WiFi Confirmation Service',
    timestamp: new Date().toISOString()
  });
});

// Simple placeholder endpoints to prevent router errors
router.post('/confirm', (req, res) => {
  res.status(501).json({ error: 'WiFi confirmation not implemented yet' });
});

router.get('/pending', (req, res) => {
  res.status(501).json({ error: 'Pending confirmations not implemented yet' });
});

router.put('/manual-confirm/:id', (req, res) => {
  res.status(501).json({ error: 'Manual confirmation not implemented yet' });
});

router.post('/simulate', (req, res) => {
  res.status(501).json({ error: 'WiFi simulation not implemented yet' });
});

module.exports = router;