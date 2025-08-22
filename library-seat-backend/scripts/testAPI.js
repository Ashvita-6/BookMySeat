// library-seat-backend/scripts/testAPI.js
const http = require('http');

const API_BASE = 'http://localhost:5001/api';

const makeRequest = (path) => {
  return new Promise((resolve, reject) => {
    http.get(`${API_BASE}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
};

const testAPI = async () => {
  console.log('🧪 TESTING API ENDPOINTS');
  console.log('========================\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣  Testing /api/health...');
    const health = await makeRequest('/health');
    console.log('   Status:', health.status || 'Failed');
    
    // Test seats endpoint
    console.log('\n2️⃣  Testing /api/seats...');
    const seats = await makeRequest('/seats');
    console.log('   Total seats returned:', seats.seats ? seats.seats.length : 0);
    console.log('   Total count:', seats.total || 0);
    
    if (seats.seats && seats.seats.length > 0) {
      console.log('   First seat:', {
        building: seats.seats[0].building,
        floor_hall: seats.seats[0].floor_hall,
        seat_number: seats.seats[0].seat_number
      });
    }
    
    // Test filtered seats
    console.log('\n3️⃣  Testing /api/seats with filters...');
    const filteredSeats = await makeRequest('/seats?building=main&floor_hall=ground_floor');
    console.log('   Filtered seats (main/ground_floor):', filteredSeats.seats ? filteredSeats.seats.length : 0);
    
    // Test bookings endpoint
    console.log('\n4️⃣  Testing /api/bookings/my-bookings...');
    const bookings = await makeRequest('/bookings/my-bookings');
    console.log('   Response:', bookings.error || `${bookings.bookings ? bookings.bookings.length : 0} bookings`);
    
    console.log('\n========================');
    if (seats.total > 0) {
      console.log('✅ API IS WORKING CORRECTLY!');
      console.log(`Found ${seats.total} seats in the database.`);
    } else {
      console.log('⚠️  API IS WORKING BUT NO SEATS FOUND!');
      console.log('Run: npm run seed');
    }
    
  } catch (error) {
    console.error('❌ API TEST FAILED:', error.message);
    console.log('\nMake sure the server is running:');
    console.log('  npm run dev');
  }
};

// Run test
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };