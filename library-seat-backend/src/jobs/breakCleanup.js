// library-seat-backend/src/jobs/breakCleanup.js
const Break = require('../models/Break');
const cron = require('node-cron');

/**
 * Clean up expired breaks
 * Runs every 5 minutes to mark expired breaks
 */
const cleanupExpiredBreaks = async () => {
  try {
    const now = new Date();
    
    // Find all active breaks that have expired
    const expiredBreaks = await Break.find({
      status: 'active',
      break_end_time: { $lte: now }
    });

    if (expiredBreaks.length === 0) {
      console.log('Break cleanup: No expired breaks found');
      return;
    }

    // Update expired breaks to 'expired' status
    const result = await Break.updateMany(
      {
        status: 'active',
        break_end_time: { $lte: now }
      },
      {
        $set: { status: 'expired' }
      }
    );

    console.log(`Break cleanup: Marked ${result.modifiedCount} breaks as expired`);
    
    // Optionally emit socket events for real-time updates
    if (global.io) {
      expiredBreaks.forEach(breakRecord => {
        global.io.emit('breakExpired', {
          break_id: breakRecord._id
        });
      });
    }

  } catch (error) {
    console.error('Break cleanup error:', error);
  }
};

/**
 * Initialize break cleanup job
 * Runs every 5 minutes
 */
const initBreakCleanupJob = () => {
  // Run every 5 minutes: '*/5 * * * *'
  cron.schedule('*/5 * * * *', cleanupExpiredBreaks, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('✓ Break cleanup job scheduled (every 5 minutes)');
  
  // Run immediately on startup
  cleanupExpiredBreaks();
};

module.exports = {
  initBreakCleanupJob,
  cleanupExpiredBreaks
};