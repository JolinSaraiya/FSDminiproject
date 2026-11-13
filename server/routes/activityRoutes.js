const express = require('express');
const {
  getActivities,
  getActivityStats,
  simulateLiveEvent,
} = require('../controllers/activityController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, getActivities);
router.get('/stats', protect, adminOnly, getActivityStats);
router.post('/simulate', protect, adminOnly, simulateLiveEvent);

module.exports = router;

