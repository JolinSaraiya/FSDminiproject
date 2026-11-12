export const HOTEL_IMAGE_PRESETS = [
  { label: 'Luxury Waterfront Palace', value: '/images/hotel-palace.jpg' },
  { label: 'Emerald Valley Resort', value: '/images/hotel-resort.jpg' },
  { label: 'Modern Skyline High-Rise', value: '/images/hotel-skyline.jpg' },
  { label: 'Royal Heritage Haveli', value: '/images/hotel-haveli.jpg' },
];

const GRADIENT_IMAGE_MAP = {
  'from-indigo-600 to-violet-600': '/images/hotel-palace.jpg',
  'from-emerald-600 to-teal-600': '/images/hotel-resort.jpg',
  'from-sky-600 to-blue-700': '/images/hotel-skyline.jpg',
  'from-amber-600 to-orange-600': '/images/hotel-haveli.jpg',
};

export function getFallbackHotelImage(hotel) {
  const name = (hotel?.name || '').toLowerCase();
  if (name.includes('taj') || name.includes('palace') || name.includes('sea')) {
    return '/images/hotel-palace.jpg';
  }
  if (name.includes('valley') || name.includes('resort') || name.includes('emerald')) {
    return '/images/hotel-resort.jpg';
  }
  if (name.includes('skyline') || name.includes('business') || name.includes('executive')) {
    return '/images/hotel-skyline.jpg';
  }
  if (name.includes('haveli') || name.includes('heritage') || name.includes('inn')) {
    return '/images/hotel-haveli.jpg';
  }

  if (hotel?.gradient && GRADIENT_IMAGE_MAP[hotel.gradient]) {
    return GRADIENT_IMAGE_MAP[hotel.gradient];
  }

  const key = String(hotel?._id || hotel?.name || 'stayhub');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % HOTEL_IMAGE_PRESETS.length;
  }
  return HOTEL_IMAGE_PRESETS[Math.abs(hash) % HOTEL_IMAGE_PRESETS.length].value;
}

export function resolveHotelImage(hotel) {
  const custom = typeof hotel?.imageUrl === 'string' ? hotel.imageUrl.trim() : '';
  return custom || getFallbackHotelImage(hotel);
}
