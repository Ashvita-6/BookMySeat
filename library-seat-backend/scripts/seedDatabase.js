// library-seat-backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-seat-booking');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas directly in the script to avoid import issues
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

// Create indexes
seatSchema.index({ building: 1, floor_hall: 1, section: 1, seat_number: 1 }, { unique: true });
seatSchema.index({ building: 1, floor_hall: 1 });
seatSchema.index({ seat_type: 1 });
seatSchema.index({ is_active: 1 });

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

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
      },
      {
        email: 'alice.johnson@student.edu',
        password: await bcrypt.hash('student123', 10),
        name: 'Alice Johnson',
        student_id: 'STU003',
        role: 'student'
      },
      {
        email: 'bob.wilson@student.edu',
        password: await bcrypt.hash('student123', 10),
        name: 'Bob Wilson',
        student_id: 'STU004',
        role: 'student'
      }
    ];

    await User.insertMany(users);
    console.log(`✅ Created ${users.length} users successfully`);
    
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

const seedSeats = async () => {
  try {
    // Clear ALL existing seats
    await Seat.deleteMany({});
    console.log('🗑️  Cleared all existing seats');

    const seats = [];

    // MAIN LIBRARY - Ground Floor (50 seats total)
    console.log('📝 Creating Main Library Ground Floor seats...');
    
    // Section A - Individual seats (18 seats)
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
    
    // Section B - Individual seats (17 seats)
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
    
    // Section C - Group study seats (15 seats)
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

    // MAIN LIBRARY - First Floor (50 seats total)
    console.log('📝 Creating Main Library First Floor seats...');
    
    // Section A - Individual seats (15 seats)
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
    
    // Section B - Individual seats (15 seats)
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
    
    // Section C - Computer stations (20 seats)
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
    console.log('📝 Creating Reading Room Hall 1 seats...');
    
    // Section A (35 seats)
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
    
    // Section B (35 seats)
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
    console.log('📝 Creating Reading Room Hall 2 seats...');
    
    // Section A (25 seats)
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
    
    // Section B (25 seats)
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
    console.log('📝 Creating Reading Room Hall 3 seats...');
    
    // Section A (35 seats)
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
    
    // Section B (35 seats)
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

    // Insert all seats in bulk
    console.log(`💾 Inserting ${seats.length} seats into database...`);
    await Seat.insertMany(seats);
    
    console.log('✅ All seats created successfully!');
    
    // Verify and show summary
    const summary = await Seat.aggregate([
      {
        $group: {
          _id: { 
            building: '$building', 
            floor_hall: '$floor_hall',
            is_active: '$is_active'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.building': 1, '_id.floor_hall': 1 } }
    ]);

    console.log('\n📊 === SEAT SUMMARY ===');
    summary.forEach(item => {
      const status = item._id.is_active ? 'Active' : 'Inactive';
      console.log(`   ${item._id.building} - ${item._id.floor_hall}: ${item.count} seats (${status})`);
    });

    const totalActive = await Seat.countDocuments({ is_active: true });
    const totalInactive = await Seat.countDocuments({ is_active: false });
    const total = await Seat.countDocuments();
    
    console.log('\n📈 === TOTALS ===');
    console.log(`   Active seats: ${totalActive}`);
    console.log(`   Inactive seats: ${totalInactive}`);
    console.log(`   Total seats in database: ${total}`);
    
    // Breakdown by building
    const mainSeats = await Seat.countDocuments({ building: 'main', is_active: true });
    const readingSeats = await Seat.countDocuments({ building: 'reading', is_active: true });
    
    console.log('\n🏢 === BY BUILDING ===');
    console.log(`   Main Library: ${mainSeats} active seats`);
    console.log(`   Reading Room: ${readingSeats} active seats`);
    
  } catch (error) {
    console.error('❌ Error seeding seats:', error.message);
    throw error;
  }
};

const verifyDatabase = async () => {
  console.log('\n🔍 === VERIFICATION ===');
  
  // Test queries that match your application's filters
  const testQueries = [
    { is_active: true, building: 'main', floor_hall: 'ground_floor' },
    { is_active: true, building: 'main', floor_hall: 'first_floor' },
    { is_active: true, building: 'reading', floor_hall: 'hall_1' },
    { is_active: true, building: 'reading', floor_hall: 'hall_2' },
    { is_active: true, building: 'reading', floor_hall: 'hall_3' }
  ];
  
  for (const query of testQueries) {
    const count = await Seat.countDocuments(query);
    console.log(`   Query ${JSON.stringify(query)}: ${count} seats found`);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🚀 Starting Complete Database Seeding...\n');
    
    await connectDB();
    
    await seedUsers();
    console.log('');
    
    await seedSeats();
    console.log('');
    
    await verifyDatabase();
    
    console.log('\n✅ === DATABASE SEEDING COMPLETED SUCCESSFULLY ===');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@library.edu / admin123');
    console.log('   Students: *.student.edu / student123');
    console.log('\n🎉 Your application should now show all seats!');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };