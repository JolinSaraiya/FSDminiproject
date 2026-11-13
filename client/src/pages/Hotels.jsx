import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import Button from '../components/Button';
import HotelCard from '../components/HotelCard';
import Loading from '../components/Loading';
import { useHotelState } from '../context/HotelContext';
import useAuth from '../hooks/useAuth';

const AMENITY_OPTIONS = [
  'All',
  'Free Wi-Fi',
  'Pool',
  'Spa',
  'Breakfast Included',
  'Workspace',
  'Airport Shuttle',
  'Lounge',
];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Available Rooms', value: 'rooms_desc' },
  { label: 'Hotel Name (A-Z)', value: 'name_asc' },
];

function Hotels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const {
    hotels,
    filteredHotels,
    filters,
    loading,
    error,
    recentlyBookedHotelId,
    setFilter,
    resetFilters,
  } = useHotelState();

  const [bookingHotel, setBookingHotel] = useState(null);

  // Sync URL search param into state
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setFilter('search', query);
    }
  }, [searchParams]);

  function handleBookClick(hotel) {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBookingHotel(hotel);
  }

  const roomTypes = ['All', ...new Set(hotels.map((h) => h.roomType).filter(Boolean))];
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.roomType !== 'All' ||
    Boolean(filters.maxPrice) ||
    filters.amenity !== 'All' ||
    filters.availableOnly ||
    filters.sort !== 'recommended';

  const controlClass =
    'w-full rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page Header Banner */}
      <section className="border-b border-slate-800 bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              StayHub Collection
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-bold md:text-4xl">
              Explore Hotels &amp; Suites
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Filter by destination, suite category, nightly rate, or amenities with real-time Socket.IO inventory updates.
            </p>
          </div>
          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Showing {filteredHotels.length} of {hotels.length} properties
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter & Sorting Controls */}
        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          {/* Main Controls Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <svg
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search city, property, or address..."
                className={`${controlClass} pl-10`}
              />
            </div>

            {/* Room Type */}
            <div>
              <select
                value={filters.roomType}
                onChange={(e) => setFilter('roomType', e.target.value)}
                className={controlClass}
              >
                {roomTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Room Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Budget */}
            <div>
              <input
                type="number"
                min="0"
                step="500"
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)}
                placeholder="Max price / night (₹)"
                className={controlClass}
              />
            </div>

            {/* Sorting */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className={controlClass}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenity Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 mr-1">Amenities:</span>
              {AMENITY_OPTIONS.map((amenity) => {
                const isActive = filters.amenity === amenity;
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => setFilter('amenity', amenity)}
                    className={`rounded-full px-3 py-1 font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => setFilter('availableOnly', e.target.checked)}
                  className="h-4 w-4 rounded-sm border-stone-300 text-amber-500 focus:ring-amber-500"
                />
                Available Only
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-semibold text-amber-600 underline hover:text-amber-800 cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading && <Loading message="Loading hotel collection..." />}

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-900">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filteredHotels.length === 0 && (
          <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-12 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl text-amber-600">
              🔍
            </span>
            <h3 className="mt-4 font-serif text-xl font-bold text-slate-900">
              No matching properties found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try adjusting your search criteria, price limit, or amenity filters.
            </p>
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !error && filteredHotels.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel._id}
                hotel={hotel}
                onBook={handleBookClick}
                isRecentlyBooked={hotel._id === recentlyBookedHotelId}
              />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        hotel={bookingHotel}
        onClose={() => setBookingHotel(null)}
      />
    </div>
  );
}

export default Hotels;
