// library-seat-backend/scripts/verifyDB.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-seat-booking';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

const seatSchema = new mongoose.Schema({
  building: { type: String, required: true },
  floor_hall: { type: String, required: true },
  section: { type: String, required: true },
  seat_number: { type: String, required: true },
  seat_type: { type: String, required: true },
  has_power: { type: Boolean, default: false },
  has_monitor: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

const verifyDatabase = async () => {
  console.log('\n🔍 DATABASE VERIFICATION TOOL');
  console.log('================================\n');
  
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  
  try {
    // Check total seats
    const totalSeats = await Seat.countDocuments();
    const activeSeats = await Seat.countDocuments({ is_active: true });
    const inactiveSeats = await Seat.countDocuments({ is_active: false });
    
    console.log('📊 OVERALL STATISTICS:');
    console.log(`  Total seats: ${totalSeats}`);
    console.log(`  Active seats: ${activeSeats}`);
    console.log(`  Inactive seats: ${inactiveSeats}`);
    
    if (totalSeats === 0) {
      console.log('\n⚠️  WARNING: No seats found in database!');
      console.log('Run: npm run seed');
      return;
    }
    
    // Check by building
    console.log('\n🏢 SEATS BY BUILDING:');
    const mainSeats = await Seat.countDocuments({ building: 'main', is_active: true });
    const readingSeats = await Seat.countDocuments({ building: 'reading', is_active: true });
    console.log(`  Main Library: ${mainSeats} active seats`);
    console.log(`  Reading Room: ${readingSeats} active seats`);
    
    // Check specific locations (the ones your app uses)
    console.log('\n📍 SEATS BY LOCATION:');
    const locations = [
      { building: 'main', floor_hall: 'ground_floor' },
      { building: 'main', floor_hall: 'first_floor' },
      { building: 'reading', floor_hall: 'hall_1' },
      { building: 'reading', floor_hall: 'hall_2' },
      { building: 'reading', floor_hall: 'hall_3' }
    ];
    
    for (const loc of locations) {
      const query = { ...loc, is_active: true };
      const count = await Seat.countDocuments(query);
      const status = count > 0 ? '✅' : '❌';
      console.log(`  ${status} ${loc.building} - ${loc.floor_hall}: ${count} seats`);
    }
    
    // Sample some seats to see their structure
    console.log('\n📋 SAMPLE SEATS:');
    const sampleSeats = await Seat.find({ is_active: true }).limit(3);
    sampleSeats.forEach(seat => {
      console.log(`  - ${seat.building}/${seat.floor_hall}/${seat.section}/${seat.seat_number} (${seat.seat_type})`);
    });
    
    // Test the exact query your app makes
    console.log('\n🧪 TESTING APP QUERIES:');
    const testQuery = { is_active: true, building: 'main', floor_hall: 'ground_floor' };
    const testResult = await Seat.find(testQuery).limit(5);
    console.log(`  Query: ${JSON.stringify(testQuery)}`);
    console.log(`  Results: ${testResult.length} seats found`);
    if (testResult.length > 0) {
      console.log('  First seat:', {
        building: testResult[0].building,
        floor_hall: testResult[0].floor_hall,
        section: testResult[0].section,
        seat_number: testResult[0].seat_number,
        is_active: testResult[0].is_active
      });
    }
    
    console.log('\n================================');
    if (activeSeats >= 290) {
      console.log('✅ DATABASE IS PROPERLY CONFIGURED!');
      console.log('Your application should work correctly.');
    } else if (activeSeats > 0) {
      console.log('⚠️  DATABASE HAS SOME SEATS BUT NOT ALL');
      console.log('Run: npm run seed');
    } else {
      console.log('❌ DATABASE NEEDS SEEDING!');
      console.log('Run: npm run seed');
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
};

// Run verification
if (require.main === module) {
  verifyDatabase();
}

module.exports = { verifyDatabase };