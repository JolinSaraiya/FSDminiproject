const express = require('express');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/', protect, adminOnly, getAllBookings);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;

