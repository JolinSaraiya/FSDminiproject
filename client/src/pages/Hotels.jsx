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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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
  
  // Calculate active filters count for the mobile pill badge
  const activeFiltersCount = [
    Boolean(filters.search.trim()),
    filters.roomType !== 'All',
    Boolean(filters.maxPrice),
    filters.amenity !== 'All',
    filters.availableOnly,
    filters.sort !== 'recommended',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const controlClass =
    'w-full rounded-2xl border border-white/60 bg-white/75 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="min-h-screen">
      {/* Glassmorphic Page Header Banner */}
      <section className="relative overflow-hidden border-b border-white/10 bg-slate-950/90 px-6 py-12 text-white backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                StayHub Collection
              </span>
              <span className="md:hidden rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                📱 Mobile View
              </span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
              Explore Hotels &amp; Suites
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-300">
              Filter by destination, suite category, nightly rate, or amenities with real-time Socket.IO inventory updates.
            </p>
          </div>
          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Showing {filteredHotels.length} of {hotels.length} properties
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* MOBILE VIEW FILTER SUITE (Change 3: Collapsible Drawer + Horizontal Amenity Scroll) */}
        <div className="md:hidden space-y-3">
          {/* Quick Search & Toggle Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
                placeholder="Search stays or city..."
                className="w-full rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2.5 text-sm font-bold transition shadow-xs cursor-pointer ${
                mobileFiltersOpen || activeFiltersCount > 0
                  ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'border-white/60 bg-white/80 text-slate-700 backdrop-blur-xl'
              }`}
            >
              <span>⚙️</span>
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[10px] font-extrabold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Touch-Friendly Horizontal Amenity Pill Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {AMENITY_OPTIONS.map((amenity) => {
              const isActive = filters.amenity === amenity;
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => setFilter('amenity', amenity)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'border border-white/60 bg-white/70 text-slate-700 shadow-2xs hover:bg-white'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>

          {/* Collapsible Mobile Glass Drawer */}
          {mobileFiltersOpen && (
            <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-stone-200/60 pb-3">
                <span className="font-serif text-base font-bold text-slate-900">Filter &amp; Sort</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sort Properties</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Category</label>
                  <select
                    value={filters.roomType}
                    onChange={(e) => setFilter('roomType', e.target.value)}
                    className={controlClass}
                  >
                    {roomTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === 'All' ? 'All Types' : type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Budget</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                    placeholder="₹ Max"
                    className={controlClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => setFilter('availableOnly', e.target.checked)}
                    className="h-4 w-4 rounded-sm border-stone-300 text-amber-500 focus:ring-amber-500"
                  />
                  Available Rooms Only
                </label>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP VIEW FILTER SUITE (Full 5-Column Glass Bar) */}
        <div className="hidden md:block space-y-4 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-stone-900/5 backdrop-blur-2xl">
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/50 pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 mr-1">Amenities:</span>
              {AMENITY_OPTIONS.map((amenity) => {
                const isActive = filters.amenity === amenity;
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => setFilter('amenity', amenity)}
                    className={`rounded-full px-3 py-1 font-medium transition cursor-pointer backdrop-blur-xs ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'border border-white/50 bg-white/60 text-slate-600 hover:bg-white'
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
        {loading && <Loading message="Loading luxury collection..." />}

        {error && (
          <div className="mt-6 rounded-3xl border border-rose-300/60 bg-rose-50/80 p-6 text-center text-rose-900 backdrop-blur-xl">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filteredHotels.length === 0 && (
          <div className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-12 text-center backdrop-blur-2xl shadow-lg">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
