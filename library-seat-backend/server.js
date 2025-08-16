// library-seat-backend/server.js
require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

// Improved error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  // Don't exit immediately, log the error but continue
  console.log('Server continuing despite uncaught exception...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
  console.log('Server continuing despite unhandled rejection...');
});

const startServer = async () => {
  try {
    // Connect to database first
    console.log('Connecting to database...');
    await connectDB();
    console.log('✓ Database connected successfully');

    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, (error) => {
      if (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
      }
      
      console.log('🚀 Server Status:');
      console.log(`   📍 Port: ${PORT}`);
      console.log(`   🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`   📡 Socket.IO: Active`);
      console.log(`   📶 WiFi Service: Active`);
      console.log(`   💾 Database: Connected`);
      console.log('');
      console.log('🎯 API Endpoints:');
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   GET  http://localhost:${PORT}/api/seats`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/api/wifi/health`);
      console.log('');
      console.log('Ready for connections! 🎉');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✓ HTTP server closed');
        
        // Close database connection
        require('mongoose').connection.close(() => {
          console.log('✓ Database connection closed');
          console.log('👋 Server shutdown complete');
          process.exit(0);
        });
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Stack trace:', error.stack);
    
    // Try to give more specific error messages
    if (error.message.includes('EADDRINUSE')) {
      console.error('💡 Port is already in use. Try:');
      console.error('   - Kill existing process: pkill -f node');
      console.error('   - Use different port: PORT=5001 npm start');
    }
    
    if (error.message.includes('MongoNetworkError')) {
      console.error('💡 Database connection failed. Check:');
      console.error('   - MongoDB is running: brew services start mongodb/brew/mongodb-community');
      console.error('   - Connection string in .env file');
    }
    
    process.exit(1);
  }
};

// Auto-check for missing dependencies
const checkDependencies = () => {
  const requiredPackages = [
    'express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 
    'cors', 'helmet', 'socket.io', 'dotenv'
  ];
  
  const missing = [];
  
  requiredPackages.forEach(pkg => {
    try {
      require.resolve(pkg);
    } catch (err) {
      missing.push(pkg);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ Missing dependencies:', missing.join(', '));
    console.error('💡 Install with: npm install', missing.join(' '));
    process.exit(1);
  }
};

// Check environment variables
const checkEnvironment = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('💡 Create .env file with:');
    missing.forEach(key => {
      if (key === 'MONGODB_URI') {
        console.error(`   ${key}=mongodb://localhost:27017/bookmyseat`);
      } else if (key === 'JWT_SECRET') {
        console.error(`   ${key}=your-super-secret-jwt-key-here`);
      }
    });
    process.exit(1);
  }
};

// Run startup checks
console.log('🔍 Running startup checks...');
checkDependencies();
checkEnvironment();
console.log('✓ All checks passed\n');

// Start the server
startServer();