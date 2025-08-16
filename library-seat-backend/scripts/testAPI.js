// library-seat-backend/scripts/testAPI.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', healthResponse.data);
    console.log('');

    // Test seats endpoint
    console.log('2. Testing seats endpoint...');
    const seatsResponse = await axios.get(`${BASE_URL}/seats`);
    console.log('✅ Seats:', {
      total_seats: seatsResponse.data.seats?.length || 0,
      pagination: seatsResponse.data.pagination,
      summary: seatsResponse.data.summary
    });

    if (seatsResponse.data.seats?.length > 0) {
      console.log('📋 Sample seat data:');
      console.log(seatsResponse.data.seats[0]);
    }
    console.log('');

    // Test seats by building
    console.log('3. Testing seats by building (main)...');
    const mainSeatsResponse = await axios.get(`${BASE_URL}/seats?building=main`);
    console.log('✅ Main building seats:', mainSeatsResponse.data.seats?.length || 0);
    console.log('');

    // Test WiFi health endpoint
    console.log('4. Testing WiFi health endpoint...');
    const wifiHealthResponse = await axios.get(`${BASE_URL}/wifi/health`);
    console.log('✅ WiFi Health:', wifiHealthResponse.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  testEndpoints();
}

module.exports = { testEndpoints };