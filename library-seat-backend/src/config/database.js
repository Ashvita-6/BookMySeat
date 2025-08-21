// library-seat-backend/src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try MongoDB Atlas first, then fallback to local
    let mongoURI = process.env.MONGODB_URI;
    
    // If Atlas URI fails, use local MongoDB
    if (!mongoURI || mongoURI.includes('mongodb+srv://') && process.env.NODE_ENV === 'development') {
      console.log('🔄 Attempting to connect to local MongoDB...');
      mongoURI = 'mongodb://localhost:27017/library-seat-booking';
    }
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in logs
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📤 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // If Atlas connection fails, try local MongoDB
    if (error.message.includes('Atlas') || error.message.includes('whitelist') || error.message.includes('ServerSelectionError')) {
      console.log('⚠️  Atlas connection failed, attempting local MongoDB...');
      
      try {
        const localConn = await mongoose.connect('mongodb://localhost:27017/library-seat-booking', {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected to local MongoDB successfully');
        console.log(`📊 Database: ${localConn.connection.name}`);
        return localConn;
        
      } catch (localError) {
        console.error('❌ Local MongoDB also failed:', localError.message);
        console.log('\n💡 Solutions:');
        console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.log('2. Or fix Atlas IP whitelist: https://www.mongodb.com/docs/atlas/security-whitelist/');
        console.log('3. Or run without database (some features limited)');
        
        // Don't exit - continue without database for development
        console.log('⚠️  Continuing without database connection...');
        return null;
      }
    } else {
      console.error('❌ Unexpected database error:', error);
      process.exit(1);
    }
  }
};

module.exports = connectDB;