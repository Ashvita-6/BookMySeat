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

const fixReadingHalls = async () => {
  await connectDB();
  
  console.log('🚀 Starting Reading Halls Fix...');
  
  // Step 1: Remove all existing reading hall seats
  const deleteResult = await Seat.deleteMany({
    building: 'reading'
  });
  console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing reading hall seats`);
  
  // Step 2: Create fresh reading hall seats
  const readingSeats = [];
  
  // READING ROOM - Hall 1 (70 seats: 35+35)
  console.log('📝 Creating Reading Room Hall 1 seats (70 total)...');
  for (let i = 1; i <= 35; i++) {
    readingSeats.push({
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
    readingSeats.push({
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
  console.log('📝 Creating Reading Room Hall 2 seats (50 total)...');
  for (let i = 1; i <= 25; i++) {
    readingSeats.push({
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
    readingSeats.push({
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
  console.log('📝 Creating Reading Room Hall 3 seats (50 total)...');
  for (let i = 1; i <= 25; i++) {
    readingSeats.push({
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
    readingSeats.push({
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
  
  // Step 3: Insert all reading seats
  console.log(`💾 Inserting ${readingSeats.length} reading hall seats...`);
  await Seat.insertMany(readingSeats);
  
  // Step 4: Verify the results
  const hall1Count = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_1' });
  const hall2Count = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_2' });
  const hall3Count = await Seat.countDocuments({ building: 'reading', floor_hall: 'hall_3' });
  const totalReading = await Seat.countDocuments({ building: 'reading' });
  
  console.log('✅ Reading Halls Fixed Successfully!');
  console.log(`📊 Results:`);
  console.log(`   - Reading Hall 1: ${hall1Count} seats (should be 70)`);
  console.log(`   - Reading Hall 2: ${hall2Count} seats (should be 50)`);
  console.log(`   - Reading Hall 3: ${hall3Count} seats (should be 50)`);
  console.log(`   - Total Reading: ${totalReading} seats (should be 170)`);
  
  if (hall1Count === 70 && hall2Count === 50 && hall3Count === 50) {
    console.log('🎉 All reading halls have correct seat counts!');
  } else {
    console.log('⚠️  Some halls have incorrect seat counts!');
  }
  
  process.exit(0);
};

// Run the fix
if (require.main === module) {
  fixReadingHalls().catch(console.error);
}

module.exports = { fixReadingHalls };