require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

const SAMPLE_HOTELS = [
  {
    name: 'The Taj Mahal Palace',
    city: 'Mumbai',
    address: 'Apollo Bunder, Colaba, Mumbai',
    roomType: 'Luxury Suite',
    pricePerNight: 12500,
    totalRooms: 12,
    availableRooms: 5,
    amenities: ['Sea View', 'Free Wi-Fi', 'Pool', 'Spa'],
    description:
      'Iconic waterfront luxury hotel offering timeless hospitality, fine dining, and panoramic views of the Gateway of India.',
    gradient: 'from-indigo-600 to-violet-600',
  },
  {
    name: 'Emerald Valley Resort',
    city: 'Pune',
    address: 'Koregaon Park Annexe, Pune',
    roomType: 'Deluxe Room',
    pricePerNight: 6200,
    totalRooms: 20,
    availableRooms: 8,
    amenities: ['Breakfast Included', 'Free Wi-Fi', 'Gym', 'Garden'],
    description:
      'Serene boutique retreat nestled amidst lush greenery, designed for both leisure travelers and business stays.',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    name: 'Skyline Business Hotel',
    city: 'Bengaluru',
    address: 'MG Road, Central Business District, Bengaluru',
    roomType: 'Executive Room',
    pricePerNight: 7800,
    totalRooms: 18,
    availableRooms: 3,
    amenities: ['Workspace', 'Free Wi-Fi', 'Airport Shuttle', 'Lounge'],
    description:
      'Modern high-rise hotel tailored for tech professionals with high-speed fiber internet and rooftop dining.',
    gradient: 'from-sky-600 to-blue-700',
  },
  {
    name: 'Heritage Haveli Inn',
    city: 'Jaipur',
    address: 'MI Road, Pink City, Jaipur',
    roomType: 'Heritage Suite',
    pricePerNight: 8900,
    totalRooms: 10,
    availableRooms: 4,
    amenities: ['Courtyard Dining', 'Free Wi-Fi', 'Pool', 'Cultural Show'],
    description:
      'Restored royal mansion blending traditional Rajasthani architecture with contemporary comfort and warm service.',
    gradient: 'from-amber-600 to-orange-600',
  },
];

async function ensureUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) return false;

  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashedPassword, role });
  return true;
}

async function seedDatabase() {
  await connectDB();

  const existingHotels = await Hotel.countDocuments();
  if (existingHotels === 0) {
    await Hotel.insertMany(SAMPLE_HOTELS);
    console.log(`Seeded ${SAMPLE_HOTELS.length} sample hotels.`);
  } else {
    console.log(`Hotels collection already has ${existingHotels} records.`);
  }

  const adminCreated = await ensureUser({
    name: 'Hotel Admin',
    email: 'admin@stayhub.com',
    password: 'Admin123!',
    role: 'admin',
  });
  const guestCreated = await ensureUser({
    name: 'Jolin',
    email: 'jolin@stayhub.com',
    password: 'Guest123!',
    role: 'user',
  });

  if (adminCreated) console.log('Created demo admin: admin@stayhub.com / Admin123!');
  if (guestCreated) console.log('Created demo guest: jolin@stayhub.com / Guest123!');

  await mongoose.disconnect();
}

seedDatabase().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
