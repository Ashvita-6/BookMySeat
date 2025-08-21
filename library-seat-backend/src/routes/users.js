// library-seat-backend/src/routes/users.js
const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, getAllUsers);

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', requireAdmin, updateUserRole);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;