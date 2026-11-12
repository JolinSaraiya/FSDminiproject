const express = require('express');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotelById);

// Admin-only routes
router.post('/', protect, adminOnly, createHotel);
router.put('/:id', protect, adminOnly, updateHotel);
router.delete('/:id', protect, adminOnly, deleteHotel);

module.exports = router;
