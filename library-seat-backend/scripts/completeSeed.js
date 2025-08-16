// library-seat-backend/scripts/completeSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Seat = require('../src/models/Seat');
const connectDB = require('../src/config/database');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users...');

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
    console.log('✓ Users seeded successfully');
    console.log('  - Admin: admin@library.edu / admin123');
    console.log('  - Students: *.edu / student123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedSeats = async () => {
  try {
    // Clear existing seats
    await Seat.deleteMany({});
    console.log('Cleared existing seats...');

    const seats = [];

    // MAIN LIBRARY - Ground Floor (50 seats total)
    console.log('Creating Main Library Ground Floor seats...');
    
    // Individual seats Section A (18 seats)
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

    // Individual seats Section B (17 seats)
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

    // Group study seats Section C (15 seats)
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
    console.log('Creating Main Library First Floor seats...');
    
    // Individual seats Section A (15 seats)
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

    // Individual seats Section B (15 seats)
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

    // Computer stations Section C (20 seats)
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
    console.log('Creating Reading Room Hall 1 seats...');
    
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
    console.log('Creating Reading Room Hall 2 seats...');
    
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
    console.log('Creating Reading Room Hall 3 seats...');
    
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

    // Insert all seats
    await Seat.insertMany(seats);
    console.log('✓ Seats seeded successfully');
    console.log(`  - Main Library Ground Floor: 50 seats (18+17 individual, 15 group)`);
    console.log(`  - Main Library First Floor: 50 seats (15+15 individual, 20 computer)`);
    console.log(`  - Reading Room Hall 1: 70 seats (35+35 individual)`);
    console.log(`  - Reading Room Hall 2: 50 seats (25+25 individual)`);
    console.log(`  - Reading Room Hall 3: 70 seats (35+35 individual)`);
    console.log(`  - Total: ${seats.length} seats`);
    
    // Verify seat creation
    const seatCount = await Seat.countDocuments();
    console.log(`✓ Verified: ${seatCount} seats in database`);
    
  } catch (error) {
    console.error('Error seeding seats:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedSeats();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    
    const userCount = await User.countDocuments();
    const seatCount = await Seat.countDocuments();
    
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Seats: ${seatCount}`);
    
    // Show sample data
    console.log('\n📋 Sample login credentials:');
    console.log('   Admin: admin@library.edu / admin123');
    console.log('   Student: john.doe@student.edu / student123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedUsers, seedSeats, seedDatabase };