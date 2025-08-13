const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = require('./config/database');

// Make pool available globally
app.locals.db = pool;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;