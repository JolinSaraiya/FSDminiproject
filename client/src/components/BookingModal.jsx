import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createBooking } from '../services/api';
import Button from './Button';
import Modal from './Modal';

function formatDateInput(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function BookingModal({ hotel, onClose, onBooked }) {
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

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

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
    'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <Modal
      isOpen={Boolean(hotel)}
      onClose={onClose}
      title={confirmedBooking ? 'Reservation Confirmed' : `Reserve ${hotel.name}`}
      subtitle={`${hotel.roomType} • ${hotel.city}`}
    >
      {confirmedBooking ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-950">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
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
              <span className="text-lg font-extrabold text-emerald-950">
                ₹{Number(confirmedBooking.totalPrice).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Keep Exploring
            </Button>
            <Link
              to="/my-bookings"
              onClick={onClose}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View My Stays →
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Live Rate
              </p>
              <p className="mt-0.5 text-base font-extrabold text-slate-900">
                ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">/ night</span>
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {hotel.availableRooms} room(s) available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="booking-checkin"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Check-in Date
              </label>
              <input
                id="booking-checkin"
                type="date"
                min={formatDateInput(0)}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-checkout"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Check-out Date
              </label>
              <input
                id="booking-checkout"
                type="date"
                min={checkInDate || formatDateInput(0)}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-rooms"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Rooms
              </label>
              <input
                id="booking-rooms"
                type="number"
                min={1}
                max={hotel.availableRooms}
                value={roomsBooked}
                onChange={(e) => setRoomsBooked(Number(e.target.value))}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="booking-guests"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Guests
              </label>
              <input
                id="booking-guests"
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-sm">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')} × {roomsBooked} room(s) ×{' '}
                {nights > 0 ? nights : 0} night(s)
              </span>
              <span>Taxes included</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-amber-200/60 pt-2">
              <span className="font-semibold text-slate-900">Estimated Total</span>
              <span className="text-xl font-extrabold text-slate-950">
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting} className="px-6">
              {submitting ? 'Confirming...' : 'Confirm Reservation'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default BookingModal;
