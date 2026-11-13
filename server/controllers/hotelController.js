const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const emitSocketEvent = require('../utils/emitSocketEvent');
const logActivity = require('../utils/logActivity');

function normalizeAmenities(rawAmenities) {
  if (Array.isArray(rawAmenities)) {
    return rawAmenities.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof rawAmenities === 'string') {
    return rawAmenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateAndBuildHotelPayload(body) {
  const {
    name,
    city,
    address,
    roomType,
    pricePerNight,
    totalRooms,
    availableRooms,
    amenities,
    description,
    gradient,
    imageUrl,
  } = body || {};

  const requiredStrings = { name, city, address, roomType, description };
  for (const [field, value] of Object.entries(requiredStrings)) {
    if (typeof value !== 'string' || !value.trim()) {
      return { error: `${field} is required and must be a non-empty string` };
    }
  }

  const parsedPrice = Number(pricePerNight);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return { error: 'pricePerNight must be a positive number' };
  }

  const parsedTotalRooms = Number(totalRooms);
  if (!Number.isInteger(parsedTotalRooms) || parsedTotalRooms < 1) {
    return { error: 'totalRooms must be an integer of at least 1' };
  }

  const parsedAvailableRooms =
    availableRooms === undefined || availableRooms === ''
      ? parsedTotalRooms
      : Number(availableRooms);
  if (
    !Number.isInteger(parsedAvailableRooms) ||
    parsedAvailableRooms < 0 ||
    parsedAvailableRooms > parsedTotalRooms
  ) {
    return { error: 'availableRooms must be an integer between 0 and totalRooms' };
  }

  const cleanImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  if (
    cleanImageUrl &&
    !cleanImageUrl.startsWith('/') &&
    !/^https?:\/\/.+/i.test(cleanImageUrl)
  ) {
    return { error: 'imageUrl must be a valid http(s) URL or /images path' };
  }

  return {
    data: {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      roomType: roomType.trim(),
      pricePerNight: parsedPrice,
      totalRooms: parsedTotalRooms,
      availableRooms: parsedAvailableRooms,
      amenities: normalizeAmenities(amenities),
      description: description.trim(),
      gradient:
        typeof gradient === 'string' && gradient.trim()
          ? gradient.trim()
          : 'from-indigo-600 to-violet-600',
      imageUrl: cleanImageUrl,
    },
  };
}

// GET /api/hotels
async function getHotels(req, res, next) {
  try {
    const {
      search = '',
      roomType = '',
      maxPrice = '',
      availableOnly = '',
      sort = 'recommended',
      amenity = '',
    } = req.query;
    const filter = {};

    const cleanSearch = String(search).trim();
    if (cleanSearch) {
      const regex = new RegExp(escapeRegex(cleanSearch), 'i');
      filter.$or = [{ name: regex }, { city: regex }, { description: regex }];
    }

    const cleanRoomType = String(roomType).trim();
    if (cleanRoomType && cleanRoomType !== 'All') {
      filter.roomType = cleanRoomType;
    }

    const cleanAmenity = String(amenity).trim();
    if (cleanAmenity && cleanAmenity !== 'All') {
      filter.amenities = { $in: [new RegExp(`^${escapeRegex(cleanAmenity)}$`, 'i')] };
    }

    const parsedMaxPrice = Number(maxPrice);
    if (maxPrice !== '' && Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0) {
      filter.pricePerNight = { $lte: parsedMaxPrice };
    }

    if (availableOnly === 'true') {
      filter.availableRooms = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { pricePerNight: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { pricePerNight: -1 };
    } else if (sort === 'rooms_desc') {
      sortOption = { availableRooms: -1 };
    } else if (sort === 'name_asc') {
      sortOption = { name: 1 };
    }

    const hotels = await Hotel.find(filter).sort(sortOption);
    return res.status(200).json(hotels);
  } catch (error) {
    return next(error);
  }
}

// GET /api/hotels/:id
async function getHotelById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid hotel ID' });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json(hotel);
  } catch (error) {
    return next(error);
  }
}

// POST /api/hotels (admin)
async function createHotel(req, res, next) {
  try {
    const { error, data } = validateAndBuildHotelPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const hotel = await Hotel.create({
      ...data,
      ...(req.user ? { createdBy: req.user._id } : {}),
    });

    emitSocketEvent(req, 'hotel:created', {
      type: 'HOTEL_CREATED',
      message: `New hotel added: ${hotel.name} (${hotel.city})`,
      hotel,
    });

    await logActivity({
      req,
      type: 'HOTEL_CREATED',
      message: `New hotel added: ${hotel.name} (${hotel.city})`,
      userId: req.user?._id,
      hotelId: hotel._id,
      metadata: { name: hotel.name, city: hotel.city, pricePerNight: hotel.pricePerNight },
    });

    return res.status(201).json({
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (err) {
    return next(err);
  }
}

// PUT /api/hotels/:id (admin)
async function updateHotel(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid hotel ID' });
    }

    const { error, data } = validateAndBuildHotelPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const hotel = await Hotel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    emitSocketEvent(req, 'hotel:updated', {
      type: 'HOTEL_UPDATED',
      message: `Hotel updated: ${hotel.name} (${hotel.availableRooms} rooms available)`,
      hotel,
    });

    await logActivity({
      req,
      type: 'HOTEL_UPDATED',
      message: `Hotel updated: ${hotel.name} (${hotel.availableRooms} rooms available)`,
      userId: req.user?._id,
      hotelId: hotel._id,
      metadata: { name: hotel.name, availableRooms: hotel.availableRooms },
    });

    return res.status(200).json({
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (err) {
    return next(err);
  }
}

// DELETE /api/hotels/:id (admin)
async function deleteHotel(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid hotel ID' });
    }

    const hotel = await Hotel.findByIdAndDelete(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    await Booking.deleteMany({ hotel: hotel._id });

    emitSocketEvent(req, 'hotel:deleted', {
      type: 'HOTEL_DELETED',
      message: `Hotel listing removed: ${hotel.name}`,
      hotel: { _id: hotel._id, name: hotel.name },
    });

    await logActivity({
      req,
      type: 'HOTEL_DELETED',
      message: `Hotel listing removed: ${hotel.name}`,
      userId: req.user?._id,
      hotelId: hotel._id,
      metadata: { name: hotel.name },
    });

    return res.status(200).json({
      message: 'Hotel deleted successfully',
      hotel,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  validateAndBuildHotelPayload,
};
