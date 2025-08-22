// library-seat-backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin role required.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ error: 'Access denied.' });
  }
};

// FIXED: Add the missing functions that user routes is looking for
const authenticateToken = auth; // Alias for consistency
const requireAdmin = adminAuth; // Alias for consistency

module.exports = { 
  auth, 
  adminAuth, 
  authenticateToken, 
  requireAdmin 
};