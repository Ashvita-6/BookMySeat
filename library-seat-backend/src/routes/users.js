// library-seat-backend/src/routes/users.js
const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, getAllUsers);

// Update user role (admin only)
router.put('/:id/role', adminAuth, updateUserRole);

// Delete user (admin only)
router.delete('/:id', adminAuth, deleteUser);

module.exports = router;