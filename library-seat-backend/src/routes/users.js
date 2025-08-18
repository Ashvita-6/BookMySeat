// library-seat-backend/src/routes/users.js
const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, getAllUsers);

// Update user role (admin only) - Fixed parameter syntax for Express 5
router.put('/:id(\\d+)/role', adminAuth, updateUserRole);

// Delete user (admin only) - Fixed parameter syntax
router.delete('/:id(\\d+)', adminAuth, deleteUser);

module.exports = router;