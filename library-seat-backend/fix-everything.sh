#!/bin/bash

echo "🚀 COMPLETE DATABASE AND SERVER FIX"
echo "=================================="

# Navigate to backend directory
cd library-seat-backend

echo "📍 Step 1: Stopping any running MongoDB processes..."
# Kill any existing MongoDB processes
pkill -f mongod 2>/dev/null || true

echo "📍 Step 2: Starting MongoDB..."
# Start MongoDB (adjust path as needed)
if command -v brew &> /dev/null; then
    echo "🍺 Starting MongoDB via Homebrew..."
    brew services start mongodb-community
elif command -v systemctl &> /dev/null; then
    echo "🐧 Starting MongoDB via systemctl..."
    sudo systemctl start mongod
else
    echo "🐳 Starting MongoDB manually..."
    mongod --dbpath=/usr/local/var/mongodb --logpath=/usr/local/var/log/mongodb/mongo.log --fork
fi

echo "⏳ Waiting for MongoDB to start..."
sleep 5

echo "📍 Step 3: Clearing and reseeding database..."
# Clear the database completely
echo "🗑️ Clearing database..."
mongosh --eval "use library-seat-booking; db.dropDatabase();"

echo "📍 Step 4: Running seat seeding script..."
# Run the seat seeding script
npm run fix-seats

echo "📍 Step 5: Verifying database..."
# Check if seats were created
SEAT_COUNT=$(mongosh --quiet --eval "use library-seat-booking; print(db.seats.countDocuments())")
echo "📊 Total seats in database: $SEAT_COUNT"

if [ "$SEAT_COUNT" -gt "0" ]; then
    echo "✅ Database seeded successfully!"
else
    echo "❌ Database seeding failed. Trying alternative method..."
    
    # Try alternative seeding
    node -e "
    const mongoose = require('mongoose');
    const Seat = require('./src/models/Seat');
    
    async function emergencySeed() {
        try {
            await mongoose.connect('mongodb://localhost:27017/library-seat-booking');
            console.log('🔗 Connected to MongoDB');
            
            // Clear existing
            await Seat.deleteMany({});
            console.log('🗑️ Cleared existing seats');
            
            const seats = [];
            
            // Main Library Ground Floor (30 seats)
            for (let i = 1; i <= 15; i++) {
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
            for (let i = 1; i <= 15; i++) {
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
            
            // Main Library First Floor (60 seats)
            for (let i = 1; i <= 30; i++) {
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
            for (let i = 1; i <= 30; i++) {
                seats.push({
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
            
            // Reading Halls (50 each)
            for (let hall = 1; hall <= 3; hall++) {
                for (let i = 1; i <= 50; i++) {
                    seats.push({
                        building: 'reading',
                        floor_hall: \`hall_\${hall}\`,
                        section: 'A',
                        seat_number: i.toString().padStart(2, '0'),
                        seat_type: 'individual',
                        has_power: true,
                        has_monitor: false,
                        is_active: true
                    });
                }
            }
            
            await Seat.insertMany(seats);
            console.log(\`✅ Inserted \${seats.length} seats successfully!\`);
            
            const count = await Seat.countDocuments();
            console.log(\`📊 Final count: \${count} seats\`);
            
            process.exit(0);
        } catch (error) {
            console.error('❌ Emergency seeding failed:', error);
            process.exit(1);
        }
    }
    
    emergencySeed();
    "
fi

echo "📍 Step 6: Starting server..."
# Start the server
echo "🚀 Starting server..."
npm start &
SERVER_PID=$!

echo "📍 Server started with PID: $SERVER_PID"
echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🎯 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Register a new account or login"
echo "   3. You should now see seats available for booking"
echo ""
echo "🔧 To stop the server: kill $SERVER_PID"
echo "=================================="