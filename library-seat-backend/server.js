// library-seat-backend/server.js
require('dotenv').config();

const { app, server } = require('./src/app');
const connectDB = require('./src/config/database');

// Improved error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error('Stack:', error.stack);
  console.log('Server continuing despite uncaught exception...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Server continuing despite unhandled rejection...');
});

const startServer = async () => {
  try {
    // Connect to database first
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Initialize cleanup jobs after database connection
    try {
      const { initBreakCleanupJob } = require('./src/jobs/breakCleanup');
      initBreakCleanupJob();
      console.log('✅ Break cleanup job initialized');
    } catch (error) {
      console.warn('⚠️  Break cleanup job failed to initialize:', error.message);
    }

    const PORT = process.env.PORT || 5001;
    
    server.listen(PORT, '0.0.0.0', (error) => {
      if (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
      }
      
      console.log('\n🚀 ====== SERVER STARTED SUCCESSFULLY ======');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`📡 Socket.IO: Active`);
      console.log(`💾 Database: Connected`);
      console.log('');
      console.log('🎯 Available API Endpoints:');
      console.log(`   ✅ GET  http://localhost:${PORT}/api/health`);
      console.log(`   ✅ GET  http://localhost:${PORT}/api/seats`);
      console.log(`   ✅ POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   ✅ POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   ✅ GET  http://localhost:${PORT}/api/bookings/my-bookings`);
      console.log(`   ✅ GET  http://localhost:${PORT}/api/breaks/available`);
      console.log('');
      console.log('🎉 Ready for connections!');
      console.log('==========================================\n');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connection
        require('mongoose').connection.close(() => {
          console.log('✅ Database connection closed');
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
      console.error('💡 Port is already in use. Try stopping other processes or use a different port.');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Database connection refused. Make sure MongoDB is running.');
    }
    
    process.exit(1);
  }
};

// Start the server
startServer();