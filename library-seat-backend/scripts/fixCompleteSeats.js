// library-seat-backend/scripts/fixCompleteSeats.js
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
  
  // Step 2: Create ALL seats from scratch with corrected seat counts
  const allSeats = [];
  
  // MAIN LIBRARY - Ground Floor (30 seats total)
  console.log('📝 Creating Main Library Ground Floor seats...');
  
  // Section A - Individual seats (15)
  for (let i = 1; i <= 15; i++) {
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
  
  // Section B - Individual seats (15)
  for (let i = 1; i <= 15; i++) {
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
  
  // MAIN LIBRARY - First Floor (60 seats total)
  console.log('📝 Creating Main Library First Floor seats...');
  
  // Section A - Individual seats (30)
  for (let i = 1; i <= 30; i++) {
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
  
  // Section B - Computer stations (30)
  for (let i = 1; i <= 30; i++) {
    allSeats.push({
      building: 'main',
      floor_hall: 'first_floor',
      section: 'B',
      seat_number: i.toString().padStart(2, '0'),
      seat_type: 'computer',
      has_power: true,
      has_monitor: true,
      is_active: true
    });
  }
  
  // READING ROOM - Hall 1 (50 seats)
  console.log('📝 Creating Reading Room Hall 1 seats...');
  for (let i = 1; i <= 50; i++) {
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
  
  // READING ROOM - Hall 2 (50 seats)
  console.log('📝 Creating Reading Room Hall 2 seats...');
  for (let i = 1; i <= 50; i++) {
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
  
  // READING ROOM - Hall 3 (50 seats)
  console.log('📝 Creating Reading Room Hall 3 seats...');
  for (let i = 1; i <= 50; i++) {
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
  
  // Insert all seats
  console.log(`📝 Inserting ${allSeats.length} seats...`);
  
  try {
    await Seat.insertMany(allSeats);
    console.log('✅ All seats inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting seats:', error);
    
    // Try inserting one by one if bulk insert fails
    console.log('🔄 Trying individual inserts...');
    let successCount = 0;
    for (const seatData of allSeats) {
      try {
        await Seat.create(seatData);
        successCount++;
      } catch (err) {
        console.error(`Failed to create seat: ${seatData.building}-${seatData.floor_hall}-${seatData.section}-${seatData.seat_number}`, err.message);
      }
    }
    console.log(`✅ ${successCount} seats inserted successfully`);
  }
  
  // Show summary
  const summary = await Seat.aggregate([
    {
      $group: {
        _id: { building: '$building', floor_hall: '$floor_hall' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.building': 1, '_id.floor_hall': 1 } }
  ]);

  console.log('\n=== Final Seat Summary ===');
  summary.forEach(item => {
    console.log(`${item._id.building} - ${item._id.floor_hall}: ${item.count} seats`);
  });

  const total = await Seat.countDocuments();
  console.log(`\n✅ Total seats in database: ${total}`);
  console.log('\n🎯 Expected seat distribution:');
  console.log('   📚 Main Library Ground Floor: 30 seats');
  console.log('   📚 Main Library First Floor: 60 seats (30 individual + 30 computer)');
  console.log('   📖 Reading Hall 1: 50 seats');
  console.log('   📖 Reading Hall 2: 50 seats');
  console.log('   📖 Reading Hall 3: 50 seats');
  console.log('   📊 Total Expected: 240 seats');

  await mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
  process.exit(0);
};

fixCompleteSeats().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});