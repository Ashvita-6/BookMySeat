// library-seat-backend/scripts/newSeed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Seat = require('../src/models/Seat');
const connectDB = require('../src/config/database');

const seedUsers = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user seeding...');
      return;
    }

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

    await User.insertMany(users);
    console.log('✓ Users seeded successfully');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedSeats = async () => {
  try {
    const existingSeats = await Seat.countDocuments();
    if (existingSeats > 0) {
      console.log('Seats already exist, skipping seat seeding...');
      return;
    }

    const seats = [];

    // MAIN LIBRARY - Ground Floor (50 seats total)
    // Individual seats (35 seats)
    for (let i = 1; i <= 35; i++) {
      const section = i <= 18 ? 'A' : 'B';
      const seatNum = i <= 18 ? i : i - 18;
      seats.push({
        building: 'main',
        floor_hall: 'ground_floor',
        section: section,
        seat_number: seatNum.toString(),
        seat_type: 'individual',
        has_power: true,
        has_monitor: false
      });
    }

    // Group study seats (15 seats)
    for (let i = 1; i <= 15; i++) {
      seats.push({
        building: 'main',
        floor_hall: 'ground_floor',
        section: 'C',
        seat_number: i.toString(),
        seat_type: 'group',
        has_power: true,
        has_monitor: false
      });
    }

    // MAIN LIBRARY - First Floor (50 seats total)
    // Individual seats (30 seats)
    for (let i = 1; i <= 30; i++) {
      const section = i <= 15 ? 'A' : 'B';
      const seatNum = i <= 15 ? i : i - 15;
      seats.push({
        building: 'main',
        floor_hall: 'first_floor',
        section: section,
        seat_number: seatNum.toString(),
        seat_type: 'individual',
        has_power: true,
        has_monitor: false
      });
    }

    // Computer stations (20 seats)
    for (let i = 1; i <= 20; i++) {
      seats.push({
        building: 'main',
        floor_hall: 'first_floor',
        section: 'C',
        seat_number: i.toString(),
        seat_type: 'computer',
        has_power: true,
        has_monitor: true
      });
    }

    // READING ROOM - Hall 1 (70 seats)
    for (let i = 1; i <= 70; i++) {
      const section = i <= 35 ? 'A' : 'B';
      const seatNum = i <= 35 ? i : i - 35;
      seats.push({
        building: 'reading',
        floor_hall: 'hall_1',
        section: section,
        seat_number: seatNum.toString(),
        seat_type: 'individual',
        has_power: true,
        has_monitor: false
      });
    }

    // READING ROOM - Hall 2 (50 seats)
    for (let i = 1; i <= 50; i++) {
      const section = i <= 25 ? 'A' : 'B';
      const seatNum = i <= 25 ? i : i - 25;
      seats.push({
        building: 'reading',
        floor_hall: 'hall_2',
        section: section,
        seat_number: seatNum.toString(),
        seat_type: 'individual',
        has_power: true,
        has_monitor: false
      });
    }

    // READING ROOM - Hall 3 (70 seats)
    for (let i = 1; i <= 70; i++) {
      const section = i <= 35 ? 'A' : 'B';
      const seatNum = i <= 35 ? i : i - 35;
      seats.push({
        building: 'reading',
        floor_hall: 'hall_3',
        section: section,
        seat_number: seatNum.toString(),
        seat_type: 'individual',
        has_power: true,
        has_monitor: false
      });
    }

    await Seat.insertMany(seats);
    console.log('✓ Seats seeded successfully');
    console.log(`  - Main Library Ground Floor: 50 seats (35 individual + 15 group)`);
    console.log(`  - Main Library First Floor: 50 seats (30 individual + 20 computer)`);
    console.log(`  - Reading Room Hall 1: 70 seats (individual)`);
    console.log(`  - Reading Room Hall 2: 50 seats (individual)`);
    console.log(`  - Reading Room Hall 3: 70 seats (individual)`);
    console.log(`  - Total: 290 seats`);
    
  } catch (error) {
    console.error('Error seeding seats:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Starting database seeding...');
    
    await seedUsers();
    await seedSeats();
    
    console.log('✓ Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@library.edu / admin123');
    console.log('Student: john.doe@student.edu / student123');
    console.log('Student: jane.smith@student.edu / student123');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };