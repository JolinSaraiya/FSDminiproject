const express = require('express');
const { getActivities, getActivityStats } = require('../controllers/activityController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, adminOnly, getActivities);
router.get('/stats', protect, adminOnly, getActivityStats);

module.exports = router;

