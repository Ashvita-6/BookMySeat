// library-seat-backend/src/routes/wifi.js
const express = require('express');
const router = express.Router();

// Import controller functions properly
let wifiController;
try {
  wifiController = require('../controllers/wifiController');
} catch (error) {
  console.error('Error importing wifi controller:', error);
  // Provide fallback functions
  wifiController = {
    confirmViaWiFi: (req, res) => res.status(500).json({ error: 'WiFi controller not available' }),
    manualConfirm: (req, res) => res.status(500).json({ error: 'WiFi controller not available' }),
    getPendingConfirmations: (req, res) => res.status(500).json({ error: 'WiFi controller not available' }),
    simulateWiFiConnection: (req, res) => res.status(500).json({ error: 'WiFi controller not available' })
  };
}

// Import auth middleware safely
let auth;
try {
  auth = require('../middleware/auth');
} catch (error) {
  console.error('Error importing auth middleware:', error);
  // Provide fallback auth middleware
  auth = (req, res, next) => {
    console.warn('Auth middleware not available, proceeding without authentication');
    next();
  };
}

// Destructure with error handling
const {
  confirmViaWiFi,
  manualConfirm,
  getPendingConfirmations,
  simulateWiFiConnection
} = wifiController;

// Public endpoint for WiFi system webhook
router.post('/confirm', confirmViaWiFi);

// Admin endpoints (with auth)
router.get('/pending', auth, getPendingConfirmations);
router.put('/manual-confirm/:id', auth, manualConfirm);

// Testing endpoint (for development)
router.post('/simulate', auth, simulateWiFiConnection);

// Health check for wifi service
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WiFi Confirmation Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;