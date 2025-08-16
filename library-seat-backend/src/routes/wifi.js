// library-seat-backend/src/routes/wifi.js
const express = require('express');
const router = express.Router();
const {
  confirmViaWiFi,
  manualConfirm,
  getPendingConfirmations,
  simulateWiFiConnection
} = require('../controllers/wifiController');
const auth = require('../middleware/auth');

// Public endpoint for WiFi system webhook
router.post('/confirm', confirmViaWiFi);

// Admin endpoints
router.get('/pending', auth, getPendingConfirmations);
router.put('/manual-confirm/:id', auth, manualConfirm);

// Testing endpoint (for development)
router.post('/simulate', auth, simulateWiFiConnection);

module.exports = router;