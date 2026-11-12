const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const emitSocketEvent = require('../utils/emitSocketEvent');
const logActivity = require('../utils/logActivity');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseIsoDateOnly(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

// POST /api/bookings (authenticated user)
async function createBooking(req, res, next) {
  try {
    const { hotelId, checkInDate, checkOutDate, roomsBooked = 1, guests = 1 } = req.body || {};

    if (!mongoose.isValidObjectId(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID' });
    }

    const checkIn = parseIsoDateOnly(checkInDate);
    const checkOut = parseIsoDateOnly(checkOutDate);
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'Valid check-in and check-out dates are required' });
    }

    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);
    if (checkIn < todayMidnight) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    const nights = Math.round((checkOut - checkIn) / MS_PER_DAY);
    if (nights < 1) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const parsedRooms = Number(roomsBooked);
    if (!Number.isInteger(parsedRooms) || parsedRooms < 1) {
      return res.status(400).json({ message: 'roomsBooked must be a whole number of at least 1' });
    }

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      return res.status(400).json({ message: 'guests must be a whole number of at least 1' });
    }

    // Atomic conditional decrement prevents race conditions / overbooking
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id: hotelId, availableRooms: { $gte: parsedRooms } },
      { $inc: { availableRooms: -parsedRooms } },
      { new: true },
    );

    if (!updatedHotel) {
      const existingHotel = await Hotel.findById(hotelId);
      if (!existingHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      return res.status(400).json({
        message: `Only ${existingHotel.availableRooms} room(s) available for this property`,
      });
    }

    const totalPrice = nights * parsedRooms * updatedHotel.pricePerNight;

    let booking;
    try {
      booking = await Booking.create({
        user: req.user._id,
        hotel: updatedHotel._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomsBooked: parsedRooms,
        guests: parsedGuests,
        totalPrice,
        status: 'confirmed',
      });
    } catch (createErr) {
      await Hotel.findByIdAndUpdate(updatedHotel._id, {
        $inc: { availableRooms: parsedRooms },
      });
      throw createErr;
    }

    const populated = await Booking.findById(booking._id)
      .populate('hotel', 'name city address roomType pricePerNight availableRooms gradient imageUrl')
      .populate('user', 'name email role');

    emitSocketEvent(req, 'booking:created', {
      type: 'BOOKING_CREATED',
      message: `Room booked at ${updatedHotel.name} (${updatedHotel.availableRooms} room(s) left)`,
      hotel: updatedHotel,
      booking: populated,
    });

    await logActivity({
      req,
      type: 'BOOKING_CREATED',
      message: `Room booked at ${updatedHotel.name} (${updatedHotel.availableRooms} room(s) left)`,
      userId: req.user._id,
      hotelId: updatedHotel._id,
      bookingId: booking._id,
      metadata: { roomsBooked: parsedRooms, totalPrice, hotel: updatedHotel.name },
    });

    return res.status(201).json({
      message: 'Booking confirmed successfully',
      booking: populated,
      hotel: updatedHotel,
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/bookings/my (authenticated user)
async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name city address roomType pricePerNight availableRooms gradient imageUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return next(error);
  }
}

// GET /api/bookings (admin)
async function getAllBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('hotel', 'name city roomType pricePerNight availableRooms')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    return next(error);
  }
}

// PATCH /api/bookings/:id/cancel (owner or admin)
async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.user.equals(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const updatedHotel = await Hotel.findByIdAndUpdate(
      booking.hotel,
      { $inc: { availableRooms: booking.roomsBooked } },
      { new: true },
    );

    const populated = await Booking.findById(booking._id)
      .populate('hotel', 'name city address roomType pricePerNight availableRooms gradient imageUrl')
      .populate('user', 'name email role');

    emitSocketEvent(req, 'booking:cancelled', {
      type: 'BOOKING_CANCELLED',
      message: `Booking cancelled at ${updatedHotel?.name || 'hotel'} (${updatedHotel?.availableRooms ?? 0} room(s) left)`,
      hotel: updatedHotel,
      booking: populated,
    });

    await logActivity({
      req,
      type: 'BOOKING_CANCELLED',
      message: `Booking cancelled at ${updatedHotel?.name || 'hotel'} (${updatedHotel?.availableRooms ?? 0} room(s) left)`,
      userId: req.user._id,
      hotelId: booking.hotel,
      bookingId: booking._id,
      metadata: { roomsRestored: booking.roomsBooked, hotel: updatedHotel?.name },
    });

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: populated,
      hotel: updatedHotel,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
};

