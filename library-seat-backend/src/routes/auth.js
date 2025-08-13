const express = require('express');
const { validateUser, validateLogin } = require('../middleware/validation');
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.get('/profile', auth, getProfile);

module.exports = router;
