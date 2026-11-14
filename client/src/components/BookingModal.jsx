import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/api';
import { downloadBookingIcs } from '../utils/calendar';
import Button from './Button';
import Modal from './Modal';

function formatDateInput(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function getNextDay(dateString) {
  if (!dateString) return formatDateInput(1);
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return formatDateInput(1);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function BookingModal({ hotel, onClose, onBooked }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [checkInDate, setCheckInDate] = useState(() => formatDateInput(0));
  const [checkOutDate, setCheckOutDate] = useState(() => formatDateInput(1));
  const [roomsBooked, setRoomsBooked] = useState(1);
  const [guests, setGuests] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!hotel) return null;

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
      ? Math.round((end - start) / (1000 * 60 * 60 * 24))
      : 0;
  const estimatedTotal = nights > 0 ? nights * roomsBooked * hotel.pricePerNight : 0;

  function triggerHaptic() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  }

  function handleCheckInChange(newCheckIn) {
    setCheckInDate(newCheckIn);
    const minOut = getNextDay(newCheckIn);
    if (!checkOutDate || checkOutDate <= newCheckIn) {
      setCheckOutDate(minOut);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!user) {
      onClose();
      navigate('/login', { state: { from: location } });
      return;
    }

    if (nights < 1) {
      setError('Check-out date must be at least 1 day after check-in date.');
      return;
    }

    if (roomsBooked < 1 || roomsBooked > hotel.availableRooms) {
      setError(`Please select between 1 and ${hotel.availableRooms} room(s).`);
      return;
    }

    try {
      setSubmitting(true);
      triggerHaptic();
      const data = await createBooking({
        hotelId: hotel._id,
        checkInDate,
        checkOutDate,
        roomsBooked: Number(roomsBooked),
        guests: Number(guests),
      });
      setConfirmedBooking(data.booking);
      if (data.hotel) {
        onBooked?.(data.hotel);
      }
    } catch (err) {
      setError(err.message || 'Unable to complete booking.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-stone-200/90 bg-white/80 backdrop-blur-md px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20';

  return (
    <Modal
      isOpen={Boolean(hotel)}
      onClose={onClose}
      title={confirmedBooking ? 'Reservation Confirmed' : `Reserve ${hotel.name}`}
      subtitle={`${hotel.roomType} • ${hotel.city}`}
    >
      {confirmedBooking ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="rounded-3xl border border-emerald-300/60 bg-emerald-50/80 p-5 text-emerald-950 backdrop-blur-xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white shadow-xs">
                ✓
              </span>
              <p className="font-serif text-lg font-bold">Your stay is booked!</p>
            </div>
            <p className="mt-2 text-sm text-emerald-900">
              Confirmed <span className="font-semibold">{confirmedBooking.roomsBooked} room(s)</span>{' '}
              for <span className="font-semibold">{confirmedBooking.guests} guest(s)</span> at{' '}
              <span className="font-semibold">{hotel.name}</span>.
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-emerald-200/80 pt-3 text-sm">
              <span className="font-medium text-emerald-800">Total Confirmed</span>
              <span className="font-serif text-xl font-extrabold text-emerald-950">
                ₹{Number(confirmedBooking.totalPrice).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => downloadBookingIcs(confirmedBooking, hotel)}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-500/25 shadow-xs cursor-pointer"
              title="Add reservation event to Apple Calendar / Google Calendar / Outlook"
            >
              <span>📅</span>
              <span>Add to Calendar (.ics)</span>
            </button>
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Keep Exploring
            </Button>
            <Link
              to="/my-bookings"
              onClick={onClose}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 shadow-md"
            >
              View My Stays →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Live Rate Header Chip */}
          <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/75 p-3.5 text-sm backdrop-blur-md shadow-xs">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                Nightly Rate
              </p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">
                ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">/ night</span>
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-800">
              ● {hotel.availableRooms} room(s) left
            </span>
          </div>

          {/* Date Picker Grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="booking-checkin"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Check-in Date
              </label>
              <input
                id="booking-checkin"
                type="date"
                min={formatDateInput(0)}
                value={checkInDate}
                onChange={(e) => handleCheckInChange(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-checkout"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Check-out Date
              </label>
              <input
                id="booking-checkout"
                type="date"
                min={getNextDay(checkInDate)}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Touch-Friendly Steppers for Rooms & Guests (Unique Mobile Feature 3) */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Rooms Booked
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-white/80 p-1.5 shadow-2xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setRoomsBooked((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={roomsBooked <= 1}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-stone-100 text-base font-bold text-slate-700 transition hover:bg-stone-200 disabled:opacity-30"
                >
                  −
                </button>
                <span className="font-serif text-sm font-bold text-slate-900">
                  {roomsBooked} {roomsBooked === 1 ? 'Room' : 'Rooms'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setRoomsBooked((prev) => Math.min(hotel.availableRooms, prev + 1));
                  }}
                  disabled={roomsBooked >= hotel.availableRooms}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-500 text-base font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-30 shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Guests
              </label>
              <div className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-white/80 p-1.5 shadow-2xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setGuests((prev) => Math.max(1, prev - 1));
                  }}
                  disabled={guests <= 1}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-stone-100 text-base font-bold text-slate-700 transition hover:bg-stone-200 disabled:opacity-30"
                >
                  −
                </button>
                <span className="font-serif text-sm font-bold text-slate-900">
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setGuests((prev) => Math.min(20, prev + 1));
                  }}
                  disabled={guests >= 20}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-500 text-base font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-30 shadow-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Calculation Breakdown */}
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')} × {roomsBooked} room(s) ×{' '}
                {nights > 0 ? nights : 0} night(s)
              </span>
              <span className="font-medium text-emerald-800">Taxes Included</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-amber-200/60 pt-2">
              <span className="font-semibold text-slate-900">Estimated Total</span>
              <span className="font-serif text-2xl font-extrabold text-slate-950">
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
              {error}
            </p>
          )}

          {/* Mobile Sticky Action Bar (Unique Mobile Feature 4: Always In View) */}
          <div className="sticky -bottom-5 sm:-bottom-6 -mx-5 sm:-mx-6 flex items-center justify-between gap-3 border-t border-stone-200/60 bg-white/95 px-5 sm:px-6 py-3.5 backdrop-blur-xl shadow-lg">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</p>
              <p className="font-serif text-lg font-extrabold text-slate-950">
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl border border-stone-300/80 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              {user ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/25 transition hover:from-amber-300 hover:to-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Reserve Stay →'}
                </button>
              ) : (
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
                >
                  Sign in to Book →
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default BookingModal;
