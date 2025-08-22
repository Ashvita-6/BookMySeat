// library-seat-backend/scripts/forceSeedDatabase.js
// This script will COMPLETELY reset and properly seed your database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-seat-booking';
    console.log('🔌 Connecting to:', mongoUri.split('@')[1] || mongoUri); // Hide password in logs
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

// Define schemas WITHOUT unique constraints first
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  student_id: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

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

// Get or create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

// DROP AND RECREATE COLLECTIONS
const resetCollections = async () => {
  console.log('\n🔥 DROPPING EXISTING COLLECTIONS...');
  
  try {
    // Drop the entire seats collection including all indexes
    await mongoose.connection.db.dropCollection('seats');
    console.log('  ✅ Dropped seats collection');
  } catch (err) {
    if (err.code === 26) {
      console.log('  ℹ️  Seats collection does not exist');
    } else {
      console.error('  ⚠️  Error dropping seats:', err.message);
    }
  }
  
  try {
    // Drop users collection
    await mongoose.connection.db.dropCollection('users');
    console.log('  ✅ Dropped users collection');
  } catch (err) {
    if (err.code === 26) {
      console.log('  ℹ️  Users collection does not exist');
    } else {
      console.error('  ⚠️  Error dropping users:', err.message);
    }
  }
  
  // Recreate collections with proper indexes
  console.log('\n📦 CREATING FRESH COLLECTIONS...');
  
  // Create seats collection with compound index
  await Seat.createCollection();
  await Seat.collection.createIndex(
    { building: 1, floor_hall: 1, section: 1, seat_number: 1 },
    { unique: true }
  );
  await Seat.collection.createIndex({ is_active: 1 });
  await Seat.collection.createIndex({ building: 1, floor_hall: 1 });
  console.log('  ✅ Created seats collection with indexes');
  
  // Create users collection
  await User.createCollection();
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ student_id: 1 }, { unique: true });
  console.log('  ✅ Created users collection with indexes');
};

// Seed users
const seedUsers = async () => {
  console.log('\n👥 CREATING USERS...');
  
  const users = [
    {
      email: 'admin@library.edu',
      password: await bcrypt.hash('admin123', 10),
      name: 'Library Admin',
      student_id: 'ADM001',
      role: 'admin'
    },
    {
      email: 'john.doe@student.edu',
      password: await bcrypt.hash('student123', 10),
      name: 'John Doe',
      student_id: 'STU001',
      role: 'student'
    },
    {
      email: 'jane.smith@student.edu',
      password: await bcrypt.hash('student123', 10),
      name: 'Jane Smith',
      student_id: 'STU002',
      role: 'student'
    }
  ];
  
  for (const userData of users) {
    try {
      await User.create(userData);
      console.log(`  ✅ Created user: ${userData.email}`);
    } catch (err) {
      console.error(`  ❌ Failed to create user ${userData.email}:`, err.message);
    }
  }
};

// Create all seats
const createAllSeats = async () => {
  console.log('\n💺 CREATING ALL SEATS...');
  
  const allSeats = [];
  let seatCounter = 0;
  
  // MAIN LIBRARY - GROUND FLOOR (50 seats total)
  console.log('\n  📍 Main Library - Ground Floor (50 seats)');
  
  // Section A - 18 individual seats
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
    seatCounter++;
  }
  
  // Section B - 17 individual seats
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
    seatCounter++;
  }
  
  // Section C - 15 group seats
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
    seatCounter++;
  }
  console.log(`    Created ${seatCounter} seats`);
  
  // MAIN LIBRARY - FIRST FLOOR (50 seats total)
  console.log('\n  📍 Main Library - First Floor (50 seats)');
  seatCounter = 0;
  
  // Section A - 15 individual seats
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
    seatCounter++;
  }
  
  // Section B - 15 individual seats
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
    seatCounter++;
  }
  
  // Section C - 20 computer stations
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
    seatCounter++;
  }
  console.log(`    Created ${seatCounter} seats`);
  
  // READING ROOM - HALL 1 (70 seats)
  console.log('\n  📍 Reading Room - Hall 1 (70 seats)');
  seatCounter = 0;
  
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
    seatCounter++;
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
    seatCounter++;
  }
  console.log(`    Created ${seatCounter} seats`);
  
  // READING ROOM - HALL 2 (50 seats)
  console.log('\n  📍 Reading Room - Hall 2 (50 seats)');
  seatCounter = 0;
  
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
    seatCounter++;
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
    seatCounter++;
  }
  console.log(`    Created ${seatCounter} seats`);
  
  // READING ROOM - HALL 3 (70 seats)
  console.log('\n  📍 Reading Room - Hall 3 (70 seats)');
  seatCounter = 0;
  
  for (let i = 1; i <= 35; i++) {
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
    seatCounter++;
  }
  
  for (let i = 1; i <= 35; i++) {
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
    seatCounter++;
  }
  console.log(`    Created ${seatCounter} seats`);
  
  // INSERT ALL SEATS
  console.log(`\n💾 Inserting total of ${allSeats.length} seats into database...`);
  
  try {
    const result = await Seat.insertMany(allSeats, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} seats!`);
  } catch (err) {
    console.error('⚠️  Bulk insert had some issues:', err.message);
    
    // Try individual inserts for failed seats
    let successCount = 0;
    let failCount = 0;
    
    for (const seat of allSeats) {
      try {
        await Seat.create(seat);
        successCount++;
      } catch (e) {
        failCount++;
      }
    }
    
    console.log(`  Retry results: ${successCount} success, ${failCount} failed`);
  }
};

// Verify the database
const verifyDatabase = async () => {
  console.log('\n🔍 VERIFYING DATABASE...');
  
  const locations = [
    { building: 'main', floor_hall: 'ground_floor', expected: 50 },
    { building: 'main', floor_hall: 'first_floor', expected: 50 },
    { building: 'reading', floor_hall: 'hall_1', expected: 70 },
    { building: 'reading', floor_hall: 'hall_2', expected: 50 },
    { building: 'reading', floor_hall: 'hall_3', expected: 70 }
  ];
  
  console.log('\n📊 Seat counts by location:');
  let totalFound = 0;
  let allCorrect = true;
  
  for (const loc of locations) {
    const count = await Seat.countDocuments({
      building: loc.building,
      floor_hall: loc.floor_hall,
      is_active: true
    });
    
    const status = count === loc.expected ? '✅' : '❌';
    console.log(`  ${status} ${loc.building} - ${loc.floor_hall}: ${count}/${loc.expected} seats`);
    
    totalFound += count;
    if (count !== loc.expected) allCorrect = false;
  }
  
  const totalSeats = await Seat.countDocuments();
  const activeSeats = await Seat.countDocuments({ is_active: true });
  
  console.log('\n📈 TOTALS:');
  console.log(`  Total seats: ${totalSeats}`);
  console.log(`  Active seats: ${activeSeats}`);
  console.log(`  Expected: 290`);
  
  return { totalSeats, activeSeats, allCorrect };
};

// Main execution
const main = async () => {
  console.log('🚀 FORCE SEED DATABASE - COMPLETE RESET');
  console.log('========================================\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  try {
    // Step 1: Drop and recreate collections
    await resetCollections();
    
    // Step 2: Seed users
    await seedUsers();
    
    // Step 3: Create all seats
    await createAllSeats();
    
    // Step 4: Verify
    const { totalSeats, activeSeats, allCorrect } = await verifyDatabase();
    
    console.log('\n========================================');
    
    if (allCorrect && activeSeats === 290) {
      console.log('✅ DATABASE SETUP COMPLETED SUCCESSFULLY!');
      console.log('========================================\n');
      console.log('📋 Login Credentials:');
      console.log('  Admin: admin@library.edu / admin123');
      console.log('  Student: john.doe@student.edu / student123');
      console.log('\n🎉 All 290 seats are now available in your application!');
    } else {
      console.log('⚠️  DATABASE SETUP COMPLETED WITH WARNINGS');
      console.log(`Found ${activeSeats}/290 expected seats`);
      console.log('Run the script again or check for errors above');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };