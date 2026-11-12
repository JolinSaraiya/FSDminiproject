const Activity = require('../models/Activity');

async function logActivity({ req, type, message, userId, hotelId, bookingId, metadata }) {
  try {
    const activity = await Activity.create({
      type,
      message,
      user: userId || undefined,
      hotel: hotelId || undefined,
      booking: bookingId || undefined,
      metadata: metadata || {},
    });

    const io = req?.app?.get('io');
    if (io) {
      const populated = await Activity.findById(activity._id)
        .populate('user', 'name email role')
        .populate('hotel', 'name city');
      io.emit('activity:logged', populated || activity);
    }
  } catch (err) {
    console.error('[Activity Log Error]', err.message);
  }
}

module.exports = logActivity;
