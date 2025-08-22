// library-seat-backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-seat-booking';
    console.log('🔌 Connecting to MongoDB at:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Make sure MongoDB is running on your system!');
    return false;
  }
};

// Define schemas inline to avoid model conflicts
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  student_id: { type: String, required: true, unique: true, uppercase: true, trim: true },
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

// Add indexes
seatSchema.index({ building: 1, floor_hall: 1, section: 1, seat_number: 1 }, { unique: true });
seatSchema.index({ building: 1, floor_hall: 1 });
seatSchema.index({ is_active: 1 });

// Get or create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

const clearDatabase = async () => {
  console.log('\n🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Seat.deleteMany({});
  console.log('✅ Database cleared');
};

const seedUsers = async () => {
  try {
    console.log('\n👥 Creating users...');
    
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

    await User.insertMany(users, { ordered: false }).catch(err => {
      // Ignore duplicate key errors
      if (err.code !== 11000) throw err;
    });
    
    console.log(`✅ Created ${users.length} users`);
    return true;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    return false;
  }
};

const seedSeats = async () => {
  try {
    console.log('\n💺 Creating seats...');
    
    const seats = [];
    
    // MAIN LIBRARY - Ground Floor (50 seats)
    console.log('  📍 Main Library - Ground Floor');
    // Section A - Individual seats (18)
    for (let i = 1; i <= 18; i++) {
      seats.push({
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
      seats.push({
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
    
    // Section C - Group study seats (15)
    for (let i = 1; i <= 15; i++) {
      seats.push({
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
    console.log('  📍 Main Library - First Floor');
    // Section A - Individual seats (15)
    for (let i = 1; i <= 15; i++) {
      seats.push({
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
      seats.push({
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
      seats.push({
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

    // READING ROOM - Hall 1 (70 seats)
    console.log('  📍 Reading Room - Hall 1');
    for (let i = 1; i <= 35; i++) {
      seats.push({
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
      seats.push({
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

    // READING ROOM - Hall 2 (50 seats)
    console.log('  📍 Reading Room - Hall 2');
    for (let i = 1; i <= 25; i++) {
      seats.push({
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
      seats.push({
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

    // READING ROOM - Hall 3 (70 seats)
    console.log('  📍 Reading Room - Hall 3');
    for (let i = 1; i <= 35; i++) {
      seats.push({
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
    for (let i = 1; i <= 35; i++) {
      seats.push({
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

    // Bulk insert with error handling
    console.log(`\n💾 Inserting ${seats.length} seats...`);
    
    try {
      await Seat.insertMany(seats, { ordered: false });
    } catch (err) {
      // Continue even if some seats already exist
      if (err.code === 11000) {
        console.log('⚠️  Some seats already existed, continuing...');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Seats created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error seeding seats:', error.message);
    return false;
  }
};

const verifySeats = async () => {
  console.log('\n🔍 Verifying seats...');
  
  // Test the exact queries your app uses
  const testQueries = [
    { is_active: true, building: 'main', floor_hall: 'ground_floor' },
    { is_active: true, building: 'main', floor_hall: 'first_floor' },
    { is_active: true, building: 'reading', floor_hall: 'hall_1' },
    { is_active: true, building: 'reading', floor_hall: 'hall_2' },
    { is_active: true, building: 'reading', floor_hall: 'hall_3' }
  ];
  
  console.log('\n📊 Seat counts by location:');
  for (const query of testQueries) {
    const count = await Seat.countDocuments(query);
    console.log(`  ${query.building} - ${query.floor_hall}: ${count} active seats`);
  }
  
  const totalActive = await Seat.countDocuments({ is_active: true });
  const totalSeats = await Seat.countDocuments();
  
  console.log('\n📈 Total Summary:');
  console.log(`  Active seats: ${totalActive}`);
  console.log(`  Total seats: ${totalSeats}`);
  
  return totalActive > 0;
};

const main = async () => {
  console.log('🚀 Starting Database Setup...\n');
  console.log('================================');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('\n❌ Failed to connect to database. Exiting...');
    process.exit(1);
  }
  
  try {
    // Clear and seed database
    await clearDatabase();
    
    const usersCreated = await seedUsers();
    const seatsCreated = await seedSeats();
    
    if (!usersCreated || !seatsCreated) {
      throw new Error('Failed to seed database');
    }
    
    // Verify the data
    const verified = await verifySeats();
    
    if (verified) {
      console.log('\n================================');
      console.log('✅ DATABASE SETUP SUCCESSFUL!');
      console.log('================================\n');
      console.log('📋 Login Credentials:');
      console.log('  Admin: admin@library.edu / admin123');
      console.log('  Student: john.doe@student.edu / student123');
      console.log('\n🎉 Your application should now show all seats!');
    } else {
      throw new Error('Verification failed - no active seats found');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { connectDB, seedUsers, seedSeats };