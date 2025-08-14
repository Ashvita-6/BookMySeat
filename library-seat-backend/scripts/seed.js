const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Seat = require('../src/models/Seat');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user seeding...');
      return;
    }

    const saltRounds = 10;
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const studentPassword = await bcrypt.hash('student123', saltRounds);

    const users = [
      {
        email: 'admin@library.edu',
        password: adminPassword,
        name: 'Library Admin',
        student_id: 'ADMIN001',
        role: 'admin'
      },
      {
        email: 'john.doe@student.edu',
        password: studentPassword,
        name: 'John Doe',
        student_id: 'STU001',
        role: 'student'
      },
      {
        email: 'jane.smith@student.edu',
        password: studentPassword,
        name: 'Jane Smith',
        student_id: 'STU002',
        role: 'student'
      },
      {
        email: 'mike.johnson@student.edu',
        password: studentPassword,
        name: 'Mike Johnson',
        student_id: 'STU003',
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
    // Check if seats already exist
    const existingSeats = await Seat.countDocuments();
    if (existingSeats > 0) {
      console.log('Seats already exist, skipping seat seeding...');
      return;
    }

    const seats = [
      // Floor 1 - Individual Study Seats
      { floor: 1, section: 'A', seat_number: '1', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 1, section: 'A', seat_number: '2', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 1, section: 'A', seat_number: '3', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 1, section: 'A', seat_number: '4', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 1, section: 'A', seat_number: '5', seat_type: 'individual', has_power: true, has_monitor: false },
      
      // Floor 1 - Quiet Zone
      { floor: 1, section: 'B', seat_number: '1', seat_type: 'quiet', has_power: true, has_monitor: false },
      { floor: 1, section: 'B', seat_number: '2', seat_type: 'quiet', has_power: true, has_monitor: false },
      { floor: 1, section: 'B', seat_number: '3', seat_type: 'quiet', has_power: true, has_monitor: false },
      { floor: 1, section: 'B', seat_number: '4', seat_type: 'quiet', has_power: true, has_monitor: false },
      { floor: 1, section: 'B', seat_number: '5', seat_type: 'quiet', has_power: true, has_monitor: false },
      
      // Floor 2 - Group Study Areas
      { floor: 2, section: 'A', seat_number: '1', seat_type: 'group', has_power: true, has_monitor: false },
      { floor: 2, section: 'A', seat_number: '2', seat_type: 'group', has_power: true, has_monitor: false },
      { floor: 2, section: 'A', seat_number: '3', seat_type: 'group', has_power: true, has_monitor: false },
      { floor: 2, section: 'A', seat_number: '4', seat_type: 'group', has_power: true, has_monitor: false },
      
      // Floor 2 - Computer Stations
      { floor: 2, section: 'B', seat_number: '1', seat_type: 'computer', has_power: true, has_monitor: true },
      { floor: 2, section: 'B', seat_number: '2', seat_type: 'computer', has_power: true, has_monitor: true },
      { floor: 2, section: 'B', seat_number: '3', seat_type: 'computer', has_power: true, has_monitor: true },
      { floor: 2, section: 'B', seat_number: '4', seat_type: 'computer', has_power: true, has_monitor: true },
      { floor: 2, section: 'B', seat_number: '5', seat_type: 'computer', has_power: true, has_monitor: true },
      
      // Floor 3 - Individual Study Seats
      { floor: 3, section: 'A', seat_number: '1', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'A', seat_number: '2', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'A', seat_number: '3', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'A', seat_number: '4', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'A', seat_number: '5', seat_type: 'individual', has_power: true, has_monitor: false },
      
      { floor: 3, section: 'B', seat_number: '1', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'B', seat_number: '2', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'B', seat_number: '3', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'B', seat_number: '4', seat_type: 'individual', has_power: true, has_monitor: false },
      { floor: 3, section: 'B', seat_number: '5', seat_type: 'individual', has_power: true, has_monitor: false }
    ];

    await Seat.insertMany(seats);
    console.log('✓ Seats seeded successfully');
    
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