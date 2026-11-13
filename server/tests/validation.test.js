const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { validateAndBuildHotelPayload } = require('../controllers/hotelController');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');

test('validateAndBuildHotelPayload accepts valid input and normalizes amenities', () => {
  const { error, data } = validateAndBuildHotelPayload({
    name: '  Sea Breeze Resort  ',
    city: ' Goa ',
    address: '1 Beach Road, Goa',
    roomType: 'Deluxe Room',
    pricePerNight: '5500',
    totalRooms: '10',
    amenities: 'WiFi, Pool, , Breakfast',
    description: 'Oceanfront rooms with scenic sunset balconies.',
  });

  assert.equal(error, undefined);
  assert.equal(data.name, 'Sea Breeze Resort');
  assert.equal(data.city, 'Goa');
  assert.equal(data.pricePerNight, 5500);
  assert.equal(data.totalRooms, 10);
  assert.equal(data.availableRooms, 10);
  assert.deepEqual(data.amenities, ['WiFi', 'Pool', 'Breakfast']);
});

test('validateAndBuildHotelPayload rejects availableRooms > totalRooms', () => {
  const { error } = validateAndBuildHotelPayload({
    name: 'Overbooked Hotel',
    city: 'Mumbai',
    address: 'Marine Drive, Mumbai',
    roomType: 'Suite',
    pricePerNight: 9000,
    totalRooms: 4,
    availableRooms: 6,
    description: 'Invalid room inventory ratio.',
  });

  assert.match(error, /availableRooms must be an integer between 0 and totalRooms/);
});

test('generateToken signs HS256 JWT containing userId and fails without secret', () => {
  const originalSecret = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(() => generateToken('507f1f77bcf86cd799439011'), /JWT_SECRET is missing/);

    process.env.JWT_SECRET = 'unit_test_secret_value';
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    assert.equal(decoded.userId, '507f1f77bcf86cd799439011');
  } finally {
    if (originalSecret !== undefined) {
      process.env.JWT_SECRET = originalSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  }
});

test('Mongoose schemas enforce domain validation rules cleanly', async () => {
  const badUser = new User({ name: 'A', email: 'not-an-email', password: 'hash', role: 'superadmin' });
  await assert.rejects(
    () => badUser.validate(),
    (err) => Boolean(err.errors?.name && err.errors?.email && err.errors?.role),
  );

  const badHotel = new Hotel({
    name: 'Valid Inn',
    city: 'Pune',
    address: 'FC Road, Pune',
    roomType: 'Standard',
    pricePerNight: 3000,
    totalRooms: 5,
    availableRooms: 8,
    description: 'A cozy hotel in central Pune.',
  });
  await assert.rejects(
    () => badHotel.validate(),
    (err) => Boolean(err.errors?.availableRooms),
  );

  const checkIn = new Date('2026-12-10T00:00:00Z');
  const badBooking = new Booking({
    user: new mongoose.Types.ObjectId(),
    hotel: new mongoose.Types.ObjectId(),
    checkInDate: checkIn,
    checkOutDate: checkIn,
    roomsBooked: 1,
    guests: 2,
    totalPrice: 3000,
  });
  await assert.rejects(
    () => badBooking.validate(),
    (err) => Boolean(err.errors?.checkOutDate),
  );

  const badActivity = new Activity({ type: 'UNKNOWN_EVENT', message: 'test' });
  await assert.rejects(
    () => badActivity.validate(),
    (err) => Boolean(err.errors?.type),
  );

  const shortPasswordUser = new User({
    name: 'Short Pass',
    email: 'short@example.com',
    password: '123',
  });
  await assert.rejects(
    () => shortPasswordUser.validate(),
    (err) => Boolean(err.errors?.password),
  );
});

test('Hotel model price and room counts must not be negative', async () => {
  const negativePriceHotel = new Hotel({
    name: 'Negative Hotel',
    city: 'Mumbai',
    address: 'Colaba, Mumbai',
    roomType: 'Standard Room',
    pricePerNight: -500,
    totalRooms: 10,
    availableRooms: 10,
    description: 'Testing price validation rule.',
  });

  await assert.rejects(
    () => negativePriceHotel.validate(),
    (err) => Boolean(err.errors?.pricePerNight),
  );
});
