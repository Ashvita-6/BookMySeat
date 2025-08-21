// library-seat-backend/src/routes/wifi.js
const express = require('express');
const router = express.Router();

// GET /api/wifi/health
router.get('/health', (req, res) => {
  console.log('📍 GET /api/wifi/health requested');
  
  res.json({
    status: 'OK',
    service: 'WiFi Confirmation Service',
    timestamp: new Date().toISOString(),
    message: 'WiFi service is running'
  });
});

// POST /api/wifi/confirm
router.post('/confirm', (req, res) => {
  console.log('📍 POST /api/wifi/confirm requested');
  console.log('Request body:', req.body);
  
  try {
    const { mac_address, router_ip, device_info } = req.body;
    
    if (!mac_address || !router_ip) {
      return res.status(400).json({ 
        error: 'Missing required fields: mac_address and router_ip' 
      });
    }
    
    // Mock WiFi confirmation logic
    const confirmation = {
      id: Date.now(),
      mac_address,
      router_ip,
      device_info: device_info || {},
      confirmed_at: new Date().toISOString(),
      status: 'confirmed'
    };
    
    res.json({
      confirmation,
      message: 'WiFi connection confirmed successfully'
    });
    
  } catch (error) {
    console.error('Error confirming WiFi:', error);
    res.status(500).json({ error: 'Failed to confirm WiFi connection' });
  }
});

// GET /api/wifi/status
router.get('/status', (req, res) => {
  console.log('📍 GET /api/wifi/status requested');
  
  res.json({
    service_status: 'active',
    connected_devices: 42,
    last_update: new Date().toISOString()
  });
});

module.exports = router;