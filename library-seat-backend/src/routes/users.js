const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', adminAuth, getAllUsers);
router.put('/:id/role', adminAuth, updateUserRole);
router.delete('/:id', adminAuth, deleteUser);

module.exports = router;
