import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Loading from '../components/Loading';
import useAuth from '../hooks/useAuth';
import { cancelBooking, getMyBookings } from '../services/api';

function formatDisplayDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const data = await getMyBookings();
        if (active) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load bookings.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookings();
    return () => {
      active = false;
    };
  }, []);

  async function handleCancel(bookingId) {
    setError('');
    try {
      setCancellingId(bookingId);
      const data = await cancelBooking(bookingId);
      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? data.booking : item)),
      );
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId('');
    }
  }

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const totalConfirmedSpend = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b border-slate-800 bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Guest Itinerary
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-bold md:text-4xl">My Stays</h1>
            <p className="mt-2 text-sm text-slate-300">
              Welcome back, <span className="font-semibold text-white">{user?.name}</span>. View and manage your reservations.
            </p>
          </div>
          <Link
            to="/hotels"
            className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            + Book Another Stay
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {!loading && bookings.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Bookings</p>
              <p className="mt-1.5 text-2xl font-extrabold text-slate-900">{bookings.length}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Confirmed</p>
              <p className="mt-1.5 text-2xl font-extrabold text-emerald-600">{confirmedCount}</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase">Confirmed Value</p>
              <p className="mt-1.5 text-2xl font-extrabold text-slate-900">
                ₹{totalConfirmedSpend.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <Loading message="Loading your reservations..." />
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-14 text-center shadow-xs">
            <p className="font-serif text-xl font-bold text-slate-800">No reservations yet</p>
            <p className="mt-1.5 text-sm text-slate-500">
              Browse our curated collection and lock in your next hotel stay.
            </p>
            <Link
              to="/hotels"
              className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Explore Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'confirmed';
              return (
                <div
                  key={booking._id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="font-serif text-xl font-bold text-slate-900">
                          {booking.hotel?.name || 'Property Unavailable'}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-slate-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500">
                        {booking.hotel?.city || '—'} • {booking.hotel?.roomType || 'Suite'} •{' '}
                        {booking.roomsBooked} room(s) • {booking.guests} guest(s)
                      </p>

                      <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-medium text-slate-700">
                        <span>
                          Check-in:{' '}
                          <strong className="text-slate-900">
                            {formatDisplayDate(booking.checkInDate)}
                          </strong>
                        </span>
                        <span className="text-slate-400">→</span>
                        <span>
                          Check-out:{' '}
                          <strong className="text-slate-900">
                            {formatDisplayDate(booking.checkOutDate)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-2.5 sm:items-end">
                      <p className="text-2xl font-extrabold text-slate-900">
                        ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">
                        ID: {booking._id.slice(-8).toUpperCase()}
                      </p>
                      {isConfirmed && (
                        <Button
                          variant="danger"
                          disabled={cancellingId === booking._id}
                          onClick={() => handleCancel(booking._id)}
                        >
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
