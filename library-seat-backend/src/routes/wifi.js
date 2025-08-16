// library-seat-backend/src/config/wifi.js

const WIFI_CONFIG = {
  // Library WiFi network configuration
  LIBRARY_WIFI: {
    name: "IIT_BHU_Library",
    mac_address: "0a:09:85:4f:e1:58",
    router_ip: "172.17.0.1",
    allowed_devices: [
      "3C:21:9C:F9:1F:41" // Your device MAC address
    ]
  },
  
  // WiFi confirmation settings
  CONFIRMATION: {
    timeout: parseInt(process.env.WIFI_CONFIRMATION_TIMEOUT) || 900000, // 15 minutes
    max_attempts: 3,
    retry_interval: 30000 // 30 seconds
  },

  // Network validation patterns
  VALIDATION: {
    mac_pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    ip_pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  }
};

// Helper functions for WiFi validation
const validateMacAddress = (mac) => {
  return WIFI_CONFIG.VALIDATION.mac_pattern.test(mac);
};

const validateIPAddress = (ip) => {
  return WIFI_CONFIG.VALIDATION.ip_pattern.test(ip);
};

const isAllowedDevice = (mac) => {
  return WIFI_CONFIG.LIBRARY_WIFI.allowed_devices.includes(mac.toUpperCase());
};

const isLibraryNetwork = (routerIP) => {
  return routerIP === WIFI_CONFIG.LIBRARY_WIFI.router_ip;
};

// Simulate WiFi connection check (since we can't actually detect WiFi from server)
const simulateWiFiCheck = (deviceMac, routerIP) => {
  console.log('🔍 Simulating WiFi check...');
  console.log(`📱 Device MAC: ${deviceMac}`);
  console.log(`🌐 Router IP: ${routerIP}`);
  
  const validMac = validateMacAddress(deviceMac);
  const allowedDevice = isAllowedDevice(deviceMac);
  const libraryNetwork = isLibraryNetwork(routerIP);
  
  console.log(`✓ Valid MAC format: ${validMac}`);
  console.log(`✓ Allowed device: ${allowedDevice}`);
  console.log(`✓ Library network: ${libraryNetwork}`);
  
  return validMac && allowedDevice && libraryNetwork;
};

module.exports = {
  WIFI_CONFIG,
  validateMacAddress,
  validateIPAddress,
  isAllowedDevice,
  isLibraryNetwork,
  simulateWiFiCheck
};