const Activity = require('../models/Activity');

// GET /api/activities (admin)
async function getActivities(req, res, next) {
  try {
    const { type, limit = '50', page = '1' } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const parsedPage = Math.max(Number(page) || 1, 1);
    const skip = (parsedPage - 1) * parsedLimit;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('user', 'name email role')
        .populate('hotel', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Activity.countDocuments(filter),
    ]);

    return res.status(200).json({
      activities,
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/activities/stats (admin)
async function getActivityStats(req, res, next) {
  try {
    const stats = await Activity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastOccurred: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalActivities = await Activity.countDocuments();

    return res.status(200).json({
      totalActivities,
      byType: stats,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getActivities,
  getActivityStats,
};

