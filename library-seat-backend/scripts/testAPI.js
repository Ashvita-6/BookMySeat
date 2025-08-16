// library-seat-backend/scripts/testAPI.js
require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.API_URL 
  : `http://localhost:${process.env.PORT || 5001}`;

console.log('🧪 Testing API Endpoints...');
console.log(`🌐 Base URL: ${BASE_URL}`);

const testEndpoints = async () => {
  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: `${BASE_URL}/api/health`,
      expectedStatus: 200
    },
    {
      name: 'Get All Seats',
      method: 'GET', 
      url: `${BASE_URL}/api/seats`,
      expectedStatus: 200
    },
    {
      name: 'WiFi Health Check',
      method: 'GET',
      url: `${BASE_URL}/api/wifi/health`,
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n${passed + failed + 1}. Testing ${test.name}...`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000,
        ...(test.data && { data: test.data })
      });

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} passed`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
        passed++;
      } else {
        console.log(`❌ ${test.name} failed`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${response.status}`);
        failed++;
      }

    } catch (error) {
      console.log(`❌ ${test.name} failed`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Response: ${JSON.stringify(error.response.data)}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Server not running on ${BASE_URL}`);
        console.log(`   💡 Make sure to start the server first: npm start`);
      }
      
      failed++;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure the server is running: npm start');
    console.log('2. Check if the port is correct in .env file');
    console.log('3. Verify MongoDB connection is working');
    console.log('4. Check for any error messages in server logs');
  }
};

// Test WiFi functionality with your credentials
const testWiFiConfirmation = async () => {
  console.log('\n🛜 Testing WiFi Confirmation with your credentials...');
  
  try {
    const wifiData = {
      mac_address: "3C:21:9C:F9:1F:41",
      router_ip: "172.17.0.1",
      device_info: {
        type: "laptop",
        browser: "chrome"
      }
    };

    const response = await axios.post(`${BASE_URL}/api/wifi/confirm`, wifiData, {
      timeout: 5000
    });

    console.log('✅ WiFi confirmation test passed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);

  } catch (error) {
    console.log('❌ WiFi confirmation test failed');
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, error.response.data);
    }
  }
};

// Run all tests
const runAllTests = async () => {
  await testEndpoints();
  await testWiFiConfirmation();
  
  console.log('\n🏁 Testing completed!');
};

// Handle script execution
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testEndpoints, testWiFiConfirmation };