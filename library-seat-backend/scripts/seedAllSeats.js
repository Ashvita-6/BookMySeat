require('dotenv').config();
const mongoose = require('mongoose');
const Seat = require('../src/models/Seat');

const seedAllSeats = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-seats');
    console.log('Connected to MongoDB');

    // Clear existing seats (optional - comment out if you want to keep existing)
    // await Seat.deleteMany({});
    // console.log('Cleared existing seats');

    const seats = [];

    // MAIN LIBRARY - Ground Floor (50 seats)
    console.log('Creating Main Library Ground Floor seats...');
    
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
    console.log('Creating Main Library First Floor seats...');
    
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
    console.log(`Inserting ${seats.length} seats...`);
    
    for (const seatData of seats) {
      try {
        // Check if seat already exists
        const existing = await Seat.findOne({
          building: seatData.building,
          floor_hall: seatData.floor_hall,
          section: seatData.section,
          seat_number: seatData.seat_number
        });

        if (!existing) {
          await Seat.create(seatData);
          console.log(`Created seat: ${seatData.building}-${seatData.floor_hall}-${seatData.section}${seatData.seat_number}`);
        } else {
          console.log(`Seat already exists: ${seatData.building}-${seatData.floor_hall}-${seatData.section}${seatData.seat_number}`);
        }
      } catch (error) {
        console.error(`Error creating seat:`, error.message);
      }
    }

    console.log('Seeding completed successfully!');
    
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

    console.log('\n=== Seat Summary ===');
    summary.forEach(item => {
      console.log(`${item._id.building} - ${item._id.floor_hall}: ${item.count} seats`);
    });

    const total = await Seat.countDocuments();
    console.log(`\nTotal seats in database: ${total}`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedAllSeats();