import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import HotelCard from '../components/HotelCard';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import useHotelRealtimeSync from '../hooks/useHotelRealtimeSync';
import { getHotels } from '../services/api';

const PILLARS = [
  {
    title: 'Real-Time Room Inventory',
    description:
      'Every booking or cancellation updates room counts across connected browsers within milliseconds via Socket.IO.',
    icon: (
      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Atomic Booking Protection',
    description:
      'Database-level atomic conditional updates prevent double-booking and guarantee accurate availability.',
    icon: (
      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: 'Transparent Stay Pricing',
    description:
      'Instant night-by-night rate calculation with flexible cancellations that immediately restore rooms.',
    icon: (
      <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
];

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingHotel, setBookingHotel] = useState(null);
  const [heroSearch, setHeroSearch] = useState('');

  useHotelRealtimeSync({ setHotels: setFeaturedHotels, maxHotels: 3 });

  useEffect(() => {
    let active = true;

    async function loadFeatured() {
      try {
        const data = await getHotels();
        if (active && Array.isArray(data)) {
          setFeaturedHotels(data.slice(0, 3));
        }
      } catch {
        if (active) {
          setFeaturedHotels([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFeatured();
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
    setFeaturedHotels((prev) =>
      prev.map((item) => (item._id === updatedHotel._id ? updatedHotel : item)),
    );
  }

  function handleQuickSearch(event) {
    event.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/hotels?search=${encodeURIComponent(q)}` : '/hotels');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Luxury Obsidian Hero */}
      <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-3xl -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-amber-300 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Live Hospitality Collection
          </div>

          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            Extraordinary Stays,{' '}
            <span className="bg-linear-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              Reserved Live
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Handpicked luxury palaces, serene valley retreats, and executive city hotels with real-time room inventory and instant confirmation.
          </p>

          {/* Quick Destination Search Bar */}
          <form
            onSubmit={handleQuickSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-2.5 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md sm:flex-row"
          >
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search city or property (e.g. Mumbai, Jaipur, Palace)..."
                className="w-full rounded-xl bg-transparent py-3 pr-4 pl-11 text-sm text-white placeholder-slate-300 outline-none"
              />
            </div>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
            >
              Find Stays
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-400">
            <span>✓ Instant Booking Receipt</span>
            <span>✓ Live Socket.IO Room Counts</span>
            <span>✓ Zero Hidden Fees</span>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PILLARS.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-stone-900/5 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-amber-400/60"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-400/30 shadow-xs">
                {item.icon}
              </div>
              <h2 className="mt-4 font-serif text-lg font-bold text-slate-900">{item.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">
              Curated Portfolio
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              Featured Stays
            </h2>
          </div>
          <Link
            to="/hotels"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
          >
            Explore All Properties →
          </Link>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel._id || hotel.id}
                hotel={hotel}
                onBook={handleBookClick}
              />
            ))}
          </div>
        )}
      </section>

      <BookingModal
        hotel={bookingHotel}
        onClose={() => setBookingHotel(null)}
        onBooked={handleHotelUpdated}
      />
    </div>
  );
}

export default Home;
