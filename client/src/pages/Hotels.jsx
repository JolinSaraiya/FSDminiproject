import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import Button from '../components/Button';
import HotelCard from '../components/HotelCard';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import useHotelRealtimeSync from '../hooks/useHotelRealtimeSync';
import { getHotels } from '../services/api';

function Hotels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [bookingHotel, setBookingHotel] = useState(null);

  useHotelRealtimeSync({ setHotels });

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHotels();
      setHotels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load hotels from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const data = await getHotels();
        if (active) {
          setHotels(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load hotels from server.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  function handleBookClick(hotel) {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setBookingHotel(hotel);
  }

  function handleHotelUpdated(updatedHotel) {
    setHotels((prev) =>
      prev.map((item) => (item._id === updatedHotel._id ? updatedHotel : item)),
    );
  }

  function resetFilters() {
    setSearchQuery('');
    setSelectedRoomType('All');
    setMaxPrice('');
    setAvailableOnly(false);
  }

  const roomTypes = ['All', ...new Set(hotels.map((hotel) => hotel.roomType))];
  const hasFilters =
    Boolean(searchQuery.trim()) ||
    selectedRoomType !== 'All' ||
    Boolean(maxPrice) ||
    availableOnly;

  const filteredHotels = hotels.filter((hotel) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      hotel.name.toLowerCase().includes(query) ||
      hotel.city.toLowerCase().includes(query) ||
      hotel.description.toLowerCase().includes(query);
    const matchesRoomType =
      selectedRoomType === 'All' || hotel.roomType === selectedRoomType;
    const matchesMaxPrice =
      !maxPrice || Number(hotel.pricePerNight) <= Number(maxPrice);
    const matchesAvailability = !availableOnly || hotel.availableRooms > 0;
    return matchesSearch && matchesRoomType && matchesMaxPrice && matchesAvailability;
  });

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
              Filter by destination, suite category, or nightly rate with real-time room inventory updates.
            </p>
          </div>
          {!loading && !error && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Showing {filteredHotels.length} of {hotels.length} properties
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Filter Bar */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-4 md:items-center">
          <div className="relative">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="City, property or keyword..."
              className={`${controlClass} pl-10`}
            />
          </div>

          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            aria-label="Filter by room type"
            className={controlClass}
          >
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'All' ? 'All Room Categories' : type}
              </option>
            ))}
          </select>

          <select
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Filter by maximum price"
            className={controlClass}
          >
            <option value="">Any Nightly Budget</option>
            <option value="7000">Up to ₹7,000 / night</option>
            <option value="10000">Up to ₹10,000 / night</option>
            <option value="15000">Up to ₹15,000 / night</option>
          </select>

          <div className="flex items-center justify-between gap-2">
            <label className="flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-stone-100">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-600"
              />
              Available only
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading && <Loading message="Fetching available properties..." />}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="font-semibold text-rose-800">{error}</p>
            <Button onClick={fetchHotels} variant="danger" className="mt-4">
              Retry Connection
            </Button>
          </div>
        )}

        {!loading && !error && filteredHotels.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-stone-300 bg-white p-14 text-center">
            <p className="font-serif text-xl font-bold text-slate-800">No properties match your criteria</p>
            <p className="mt-1.5 text-sm text-slate-500">
              Try clearing your filters or searching another destination.
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={resetFilters} className="mt-5">
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && filteredHotels.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel._id || hotel.id}
                hotel={hotel}
                onBook={handleBookClick}
              />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        hotel={bookingHotel}
        onClose={() => setBookingHotel(null)}
        onBooked={handleHotelUpdated}
      />
    </div>
  );
}

export default Hotels;
