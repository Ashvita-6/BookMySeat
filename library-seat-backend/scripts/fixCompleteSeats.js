const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seatSchema = new mongoose.Schema({
  building: { type: String, required: true, enum: ['main', 'reading'] },
  floor_hall: { type: String, required: true },
  section: { type: String, required: true },
  seat_number: { type: String, required: true },
  seat_type: { type: String, required: true, enum: ['individual', 'group', 'computer'] },
  has_power: { type: Boolean, default: false },
  has_monitor: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

seatSchema.index({ building: 1, floor_hall: 1, section: 1, seat_number: 1 }, { unique: true });

const Seat = mongoose.model('Seat', seatSchema);

const fixCompleteSeats = async () => {
  await connectDB();
  
  console.log('🚀 Starting Complete Seat Database Fix...');
  
  // Step 1: Clear ALL existing seats to start fresh
  const deleteResult = await Seat.deleteMany({});
  console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing seats`);
  
  // Step 2: Create ALL seats from scratch
  const allSeats = [];
  
  // MAIN LIBRARY - Ground Floor (50 seats)
  console.log('📝 Creating Main Library Ground Floor seats...');
  
  // Section A - Individual seats (18)
  for (let i = 1; i <= 18; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'ground_floor',
      section: 'A',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // Section B - Individual seats (17)
  for (let i = 1; i <= 17; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'ground_floor',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // Section C - Group seats (15)
  for (let i = 1; i <= 15; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'ground_floor',
      section: 'C',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'group',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // MAIN LIBRARY - First Floor (50 seats)
  console.log('📝 Creating Main Library First Floor seats...');
  
  // Section A - Individual seats (15)
  for (let i = 1; i <= 15; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'first_floor',
      section: 'A',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // Section B - Individual seats (15)
  for (let i = 1; i <= 15; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'first_floor',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // Section C - Computer stations (20)
  for (let i = 1; i <= 20; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'first_floor',
      section: 'C',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'computer',
      has_power: true,
      has_monitor: true,
      is_active: true
    });
  }
  
  // READING ROOM - Hall 1 (70 seats: 35+35)
  console.log('📝 Creating Reading Room Hall 1 seats...');
  for (let i = 1; i <= 35; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_1',
      section: 'A',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  for (let i = 1; i <= 35; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_1',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // READING ROOM - Hall 2 (50 seats: 25+25)
  console.log('📝 Creating Reading Room Hall 2 seats...');
  for (let i = 1; i <= 25; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_2',
      section: 'A',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  for (let i = 1; i <= 25; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_2',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // READING ROOM - Hall 3 (50 seats: 25+25)
  console.log('📝 Creating Reading Room Hall 3 seats...');
  for (let i = 1; i <= 25; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_3',
      section: 'A',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  for (let i = 1; i <= 25; i++) {
    allSeats.push({
      building: 'reading',
      floor_hall: 'hall_3',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'individual',
      has_power: true,
      has_monitor: false,
      is_active: true
    });
  }
  
  // Step 3: Insert all seats
  console.log(`💾 Inserting ${allSeats.length} seats...`);
  await Seat.insertMany(allSeats);
  
  // Step 4: Verify results
  const mainGround = await Seat.countDocuments({ building: 'main', floor_hall: 'ground_floor' });
  const mainFirst = await Seat.countDocuments({ building: 'main', floor_hall: 'first_floor' });
  const hall1 = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_1' });
  const hall2 = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_2' });
  const hall3 = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_3' });
  const totalMain = await Seat.countDocuments({ building: 'main' });
  const totalReading = await Seat.countDocuments({ building: 'reading' });
  const totalAll = await Seat.countDocuments();
  
  console.log('✅ Complete Seat Fix Results:');
  console.log('📊 Main Library:');
  console.log(`   - Ground Floor: ${mainGround} seats (should be 50)`);
  console.log(`   - First Floor: ${mainFirst} seats (should be 50)`);
  console.log(`   - Total Main: ${totalMain} seats (should be 100)`);
  console.log('📖 Reading Room:');
  console.log(`   - Hall 1: ${hall1} seats (should be 70)`);
  console.log(`   - Hall 2: ${hall2} seats (should be 50)`);
  console.log(`   - Hall 3: ${hall3} seats (should be 50)`);
  console.log(`   - Total Reading: ${totalReading} seats (should be 170)`);
  console.log(`🎯 Grand Total: ${totalAll} seats (should be 270)`);
  
  if (mainGround === 50 && mainFirst === 50 && hall1 === 70 && hall2 === 50 && hall3 === 50) {
    console.log('🎉 All seat counts are correct!');
  } else {
    console.log('⚠️  Some seat counts are incorrect!');
  }
  
  // Step 5: Test a specific query that frontend would make
  console.log('\n🧪 Testing Frontend Queries:');
  const hall2Seats = await Seat.find({ 
    building: 'reading', 
    floor_hall: 'hall_2',
    is_active: true 
  }).limit(5);
  
  const hall3Seats = await Seat.find({ 
    building: 'reading', 
    floor_hall: 'hall_3',
    is_active: true 
  }).limit(5);
  
  console.log('Hall 2 Sample Seats:');
  hall2Seats.forEach(seat => {
    console.log(`  ${seat.building}-${seat.floor_hall}-${seat.section}${seat.seat_number}`);
  });
  
  console.log('Hall 3 Sample Seats:');
  hall3Seats.forEach(seat => {
    console.log(`  ${seat.building}-${seat.floor_hall}-${seat.section}${seat.seat_number}`);
  });
  
  process.exit(0);
};

// Run the complete fix
if (require.main === module) {
  fixCompleteSeats().catch(console.error);
}

module.exports = { fixCompleteSeats };