const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const { getAllSeats, getSeatById, createSeat, updateSeat, deleteSeat } = require('../controllers/seatController');

const router = express.Router();

router.get('/', getAllSeats);
router.get('/:id', getSeatById);
router.post('/', adminAuth, createSeat);
router.put('/:id', adminAuth, updateSeat);
router.delete('/:id', adminAuth, deleteSeat);

module.exports = router;
