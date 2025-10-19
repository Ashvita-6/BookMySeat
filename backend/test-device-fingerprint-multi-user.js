const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance (simulates same device)
const deviceAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // These headers simulate a specific device
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  }
});

let user1Token = '';
let user2Token = '';

// Set auth token interceptor
deviceAPI.interceptors.request.use(config => {
  // Use the appropriate token based on which user is "logged in"
  const token = config.headers['X-Test-User'] === 'user2' ? user2Token : user1Token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Clean up test header
  delete config.headers['X-Test-User'];
  return config;
});

// Test users
const testUser1 = {
  name: 'Device Test User 1',
  email: `devicetest1_${Date.now()}@example.com`,
  password: 'Test123456',
  rollNumber: `DT1_${Date.now()}`,
  department: 'Computer Science',
  year: 3,
  phoneNumber: '9876543210'
};

const testUser2 = {
  name: 'Device Test User 2',
  email: `devicetest2_${Date.now()}@example.com`,
  password: 'Test123456',
  rollNumber: `DT2_${Date.now()}`,
  department: 'Electronics',
  year: 2,
  phoneNumber: '9876543211'
};

const testLocation = {
  latitude: 25.261071,
  longitude: 82.983812
};

console.log('🧪 Testing Device Fingerprinting Across Multiple User Accounts');
console.log('==============================================================\n');

async function registerAndLogin(userData, userLabel) {
  console.log(`📝 Registering ${userLabel}...`);
  try {
    // Register
    const regResponse = await deviceAPI.post('/auth/register', userData);
    console.log(`✅ ${userLabel} registered successfully`);
    
    // Grant location permission
    const locResponse = await deviceAPI.post('/auth/grant-location-permission', {
      userId: regResponse.data.userId,
      ...testLocation
    });
    
    console.log(`✅ ${userLabel} location permission granted`);
    return locResponse.data.token;
  } catch (error) {
    console.log(`❌ ${userLabel} registration failed:`, error.response?.data?.message);
    return null;
  }
}

async function testCrossAccountDeviceRestriction() {
  console.log('\n🔐 CRITICAL TEST: Cross-Account Device Restriction');
  console.log('===================================================');
  
  // Step 1: Register both users
  user1Token = await registerAndLogin(testUser1, 'User 1');
  user2Token = await registerAndLogin(testUser2, 'User 2');
  
  if (!user1Token || !user2Token) {
    console.log('❌ Failed to set up test users');
    return false;
  }
  
  // Get available seats
  const seatsResponse = await deviceAPI.get('/seats', {
    headers: { 'X-Test-User': 'user1' }
  });
  const seats = seatsResponse.data.seats;
  
  if (seats.length < 2) {
    console.log('❌ Need at least 2 seats for testing');
    return false;
  }
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  
  // Step 2: User 1 books a seat from 1 PM to 3 PM
  console.log('\n📍 Step 1: User 1 books seat from 13:00 to 15:00');
  try {
    const booking1 = await deviceAPI.post('/bookings/book', {
      seatId: seats[0]._id,
      date: dateStr,
      startTime: '13:00',
      endTime: '15:00'
    }, {
      headers: { 'X-Test-User': 'user1' }
    });
    console.log('✅ User 1 booking successful');
    console.log(`   Seat: ${booking1.data.booking.seat.seatNumber}`);
    console.log(`   Time: 13:00 - 15:00`);
  } catch (error) {
    console.log('❌ User 1 booking failed:', error.response?.data?.message);
    return false;
  }
  
  // Step 3: Try to book overlapping time with User 1 (should fail - same device)
  console.log('\n📍 Step 2: User 1 tries to book another seat from 14:00 to 16:00');
  try {
    await deviceAPI.post('/bookings/book', {
      seatId: seats[1]._id,
      date: dateStr,
      startTime: '14:00',
      endTime: '16:00'
    }, {
      headers: { 'X-Test-User': 'user1' }
    });
    console.log('❌ FAILED: Should have rejected overlapping booking from same device');
    return false;
  } catch (error) {
    if (error.response?.data?.message.includes('device already has a booking')) {
      console.log('✅ Correctly rejected overlapping booking from User 1');
      console.log(`   Error: ${error.response.data.message}`);
    } else {
      console.log('❌ Wrong error message:', error.response?.data?.message);
      return false;
    }
  }
  
  // Step 4: CRITICAL TEST - User 2 logs in and tries to book overlapping time
  console.log('\n📍 Step 3: User 2 (different account, SAME DEVICE) tries to book from 14:00 to 16:00');
  try {
    await deviceAPI.post('/bookings/book', {
      seatId: seats[1]._id,
      date: dateStr,
      startTime: '14:00',
      endTime: '16:00'
    }, {
      headers: { 'X-Test-User': 'user2' }
    });
    console.log('❌ CRITICAL FAILURE: Device fingerprinting not working!');
    console.log('   User 2 was able to book overlapping time from the same device.');
    return false;
  } catch (error) {
    if (error.response?.data?.message.includes('device already has a booking')) {
      console.log('✅ SUCCESS: Correctly rejected booking from User 2 on same device');
      console.log(`   Error: ${error.response.data.message}`);
      console.log('   ✓ Device fingerprinting is working correctly!');
    } else {
      console.log('❌ Wrong error message:', error.response?.data?.message);
      return false;
    }
  }
  
  // Step 5: User 2 tries to book non-overlapping time (should succeed)
  console.log('\n📍 Step 4: User 2 tries to book NON-overlapping time from 08:00 to 10:00');
  try {
    const booking2 = await deviceAPI.post('/bookings/book', {
      seatId: seats[1]._id,
      date: dateStr,
      startTime: '08:00',
      endTime: '10:00'
    }, {
      headers: { 'X-Test-User': 'user2' }
    });
    console.log('✅ User 2 booking successful (non-overlapping time)');
    console.log(`   Seat: ${booking2.data.booking.seat.seatNumber}`);
    console.log(`   Time: 08:00 - 10:00`);
  } catch (error) {
    console.log('❌ User 2 non-overlapping booking failed:', error.response?.data?.message);
    return false;
  }
  
  // Step 6: Now User 2 has a booking, try overlapping with it from User 1
  console.log('\n📍 Step 5: User 1 tries to book overlapping with User 2\'s time slot (08:30-09:30)');
  try {
    await deviceAPI.post('/bookings/book', {
      seatId: seats[0]._id,
      date: dateStr,
      startTime: '08:30',
      endTime: '09:30'
    }, {
      headers: { 'X-Test-User': 'user1' }
    });
    console.log('❌ FAILED: Should have rejected overlapping booking');
    return false;
  } catch (error) {
    if (error.response?.data?.message.includes('device already has a booking')) {
      console.log('✅ Correctly rejected overlapping booking from User 1');
      console.log(`   Error: ${error.response.data.message}`);
    } else {
      console.log('❌ Wrong error message:', error.response?.data?.message);
      return false;
    }
  }
  
  return true;
}

async function testNonOverlappingAllowed() {
  console.log('\n✅ ADDITIONAL TEST: Non-overlapping bookings should be allowed');
  console.log('================================================================');
  
  const seatsResponse = await deviceAPI.get('/seats', {
    headers: { 'X-Test-User': 'user1' }
  });
  const seats = seatsResponse.data.seats;
  
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dateStr = dayAfterTomorrow.toISOString().split('T')[0];
  
  // Book first slot
  console.log('\n📍 User 1 books 10:00-12:00');
  try {
    await deviceAPI.post('/bookings/book', {
      seatId: seats[0]._id,
      date: dateStr,
      startTime: '10:00',
      endTime: '12:00'
    }, {
      headers: { 'X-Test-User': 'user1' }
    });
    console.log('✅ First booking successful');
  } catch (error) {
    console.log('❌ First booking failed:', error.response?.data?.message);
    return false;
  }
  
  // Try to book immediately after (should succeed)
  console.log('\n📍 User 1 tries to book 12:00-14:00 (immediately after)');
  try {
    await deviceAPI.post('/bookings/book', {
      seatId: seats[1]._id,
      date: dateStr,
      startTime: '12:00',
      endTime: '14:00'
    }, {
      headers: { 'X-Test-User': 'user1' }
    });
    console.log('✅ Non-overlapping consecutive booking allowed');
    return true;
  } catch (error) {
    console.log('❌ Should have allowed non-overlapping booking:', error.response?.data?.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Device Fingerprinting Tests\n');
  
  let testsPassed = 0;
  let totalTests = 2;
  
  // Test 1: Cross-account device restriction
  if (await testCrossAccountDeviceRestriction()) {
    testsPassed++;
  }
  
  // Test 2: Non-overlapping bookings allowed
  if (await testNonOverlappingAllowed()) {
    testsPassed++;
  }
  
  // Summary
  console.log('\n========================================');
  console.log('📊 FINAL TEST SUMMARY');
  console.log('========================================');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${((testsPassed/totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🎉 Device fingerprinting is working correctly!');
    console.log('📝 One device can only have one booking at a time,');
    console.log('   regardless of which user account is logged in.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Please review the output above for details.');
  }
  
  process.exit(testsPassed === totalTests ? 0 : 1);
}

// Run all tests
runAllTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});