import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import useHotelRealtimeSync from '../hooks/useHotelRealtimeSync';
import { HOTEL_IMAGE_PRESETS, resolveHotelImage } from '../utils/hotelImages';
import {
  cancelBooking,
  createHotel,
  deleteHotel,
  getActivities,
  getAllBookings,
  getHotels,
  updateHotel,
} from '../services/api';

const EMPTY_FORM = {
  name: '',
  city: '',
  address: '',
  roomType: 'Deluxe Room',
  pricePerNight: '',
  totalRooms: '',
  availableRooms: '',
  amenities: '',
  description: '',
  gradient: 'from-indigo-600 to-violet-600',
  imageUrl: '/images/hotel-palace.jpg',
};

const GRADIENTS = [
  { label: 'Royal Indigo', value: 'from-indigo-600 to-violet-600' },
  { label: 'Emerald Valley', value: 'from-emerald-600 to-teal-600' },
  { label: 'Azure Skyline', value: 'from-sky-600 to-blue-700' },
  { label: 'Heritage Amber', value: 'from-amber-600 to-orange-600' },
];

const ACTIVITY_BADGE_MAP = {
  USER_LOGIN: 'bg-sky-100 text-sky-800',
  USER_REGISTERED: 'bg-violet-100 text-violet-800',
  HOTEL_CREATED: 'bg-emerald-100 text-emerald-800',
  HOTEL_UPDATED: 'bg-amber-100 text-amber-800',
  HOTEL_DELETED: 'bg-rose-100 text-rose-800',
  BOOKING_CREATED: 'bg-indigo-100 text-indigo-800',
  BOOKING_CANCELLED: 'bg-stone-200 text-slate-700',
};

function formatShortDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function AdminDashboard() {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('hotels');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useHotelRealtimeSync({ setHotels, setBookings, setActivities });

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        const [hotelsData, bookingsData, activityData] = await Promise.all([
          getHotels(),
          getAllBookings(),
          getActivities({ limit: 50 }),
        ]);
        if (active) {
          setHotels(Array.isArray(hotelsData) ? hotelsData : []);
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
          setActivities(Array.isArray(activityData?.activities) ? activityData.activities : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load admin dashboard data.');
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

  function openCreateModal() {
    setEditingHotelId(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  }

  function openEditModal(hotel) {
    setEditingHotelId(hotel._id);
    setFormData({
      name: hotel.name || '',
      city: hotel.city || '',
      address: hotel.address || '',
      roomType: hotel.roomType || 'Deluxe Room',
      pricePerNight: String(hotel.pricePerNight ?? ''),
      totalRooms: String(hotel.totalRooms ?? ''),
      availableRooms: String(hotel.availableRooms ?? ''),
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : '',
      description: hotel.description || '',
      gradient: hotel.gradient || 'from-indigo-600 to-violet-600',
      imageUrl: hotel.imageUrl || resolveHotelImage(hotel),
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSaveHotel(event) {
    event.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      pricePerNight: Number(formData.pricePerNight),
      totalRooms: Number(formData.totalRooms),
      availableRooms:
        formData.availableRooms === ''
          ? Number(formData.totalRooms)
          : Number(formData.availableRooms),
    };

    try {
      setSaving(true);
      if (editingHotelId) {
        const res = await updateHotel(editingHotelId, payload);
        setHotels((prev) => prev.map((h) => (h._id === editingHotelId ? res.hotel : h)));
      } else {
        const res = await createHotel(payload);
        setHotels((prev) => {
          const exists = prev.some((h) => h._id === res.hotel._id);
          return exists ? prev : [res.hotel, ...prev];
        });
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save hotel.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHotel(id) {
    setError('');
    try {
      await deleteHotel(id);
      setHotels((prev) => prev.filter((h) => h._id !== id));
      setBookings((prev) => prev.filter((b) => b.hotel?._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete hotel.');
    }
  }

  async function handleCancelBooking(bookingId) {
    setError('');
    try {
      const res = await cancelBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b._id === bookingId ? res.booking : b)));
      if (res.hotel) {
        setHotels((prev) => prev.map((h) => (h._id === res.hotel._id ? res.hotel : h)));
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    }
  }

  const totalAvailableRooms = hotels.reduce((sum, h) => sum + (h.availableRooms || 0), 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const filteredActivities =
    activityFilter === 'ALL'
      ? activities
      : activities.filter((item) => item.type === activityFilter);

  const inputClass =
    'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Executive Header */}
      <section className="border-b border-slate-800 bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">
              Operations Console
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Manage properties, reservations, and monitor live persisted Docker MongoDB events.
            </p>
          </div>
          <Button variant="accent" onClick={openCreateModal} className="px-5 py-3">
            + Add New Property
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Properties</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{hotels.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Available Rooms
            </p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">{totalAvailableRooms}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Confirmed Stays
            </p>
            <p className="mt-2 text-3xl font-extrabold text-amber-600">{confirmedBookings}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
              Persisted Events
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{activities.length}</p>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {[
            { id: 'hotels', label: `Properties (${hotels.length})` },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'activities', label: `Live DB Activity Log (${activities.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'border border-stone-200 bg-white text-slate-700 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading message="Loading console data..." />
        ) : activeTab === 'hotels' ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-4">Property</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Nightly Rate</th>
                  <th className="px-5 py-4">Inventory</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {hotels.map((hotel) => (
                  <tr key={hotel._id} className="hover:bg-stone-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveHotelImage(hotel)}
                          alt={hotel.name}
                          className="h-10 w-14 shrink-0 rounded-xl object-cover ring-1 ring-stone-200"
                        />
                        <span className="font-semibold text-slate-900">{hotel.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{hotel.city}</td>
                    <td className="px-5 py-4 text-slate-600">{hotel.roomType}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ₹{Number(hotel.pricePerNight).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {hotel.availableRooms} / {hotel.totalRooms} open
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" onClick={() => openEditModal(hotel)}>
                          Edit
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteHotel(hotel._id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-4">Guest</th>
                  <th className="px-5 py-4">Property</th>
                  <th className="px-5 py-4">Dates</th>
                  <th className="px-5 py-4">Rooms</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-stone-50/80">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{booking.user?.name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{booking.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {booking.hotel?.name || 'Removed'} ({booking.hotel?.city || '—'})
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatShortDate(booking.checkInDate)} →{' '}
                      {formatShortDate(booking.checkOutDate)}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{booking.roomsBooked}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-slate-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {booking.status === 'confirmed' && (
                        <Button variant="danger" onClick={() => handleCancelBooking(booking._id)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                {[
                  'ALL',
                  'USER_LOGIN',
                  'USER_REGISTERED',
                  'BOOKING_CREATED',
                  'BOOKING_CANCELLED',
                  'HOTEL_CREATED',
                  'HOTEL_UPDATED',
                  'HOTEL_DELETED',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivityFilter(type)}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      activityFilter === type
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium text-slate-500">
                Persisted in Docker <code className="rounded bg-stone-100 px-1.5 py-0.5">stayhub.activities</code>
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Event Type</th>
                    <th className="px-5 py-3.5">Details</th>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                        No persisted activity events match this filter yet.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((item) => (
                      <tr key={item._id} className="hover:bg-stone-50/80">
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              ACTIVITY_BADGE_MAP[item.type] || 'bg-stone-100 text-slate-700'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">{item.message}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {item.user?.email || item.metadata?.email || 'System'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Hotel Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHotelId ? 'Edit Property Details' : 'Add New Property'}
        subtitle="Changes sync instantly across all connected sessions"
      >
        <form onSubmit={handleSaveHotel} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="hotel-name" className="mb-1 block text-xs font-semibold text-slate-700">
                Property Name
              </label>
              <input
                id="hotel-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hotel-city" className="mb-1 block text-xs font-semibold text-slate-700">
                City
              </label>
              <input
                id="hotel-city"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hotel-address" className="mb-1 block text-xs font-semibold text-slate-700">
              Street Address
            </label>
            <input
              id="hotel-address"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="hotel-roomtype" className="mb-1 block text-xs font-semibold text-slate-700">
                Room Category
              </label>
              <input
                id="hotel-roomtype"
                name="roomType"
                value={formData.roomType}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hotel-price" className="mb-1 block text-xs font-semibold text-slate-700">
                Rate / Night (₹)
              </label>
              <input
                id="hotel-price"
                type="number"
                min={1}
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hotel-gradient" className="mb-1 block text-xs font-semibold text-slate-700">
                Card Theme
              </label>
              <select
                id="hotel-gradient"
                name="gradient"
                value={formData.gradient}
                onChange={handleFormChange}
                className={inputClass}
              >
                {GRADIENTS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="hotel-total" className="mb-1 block text-xs font-semibold text-slate-700">
                Total Rooms
              </label>
              <input
                id="hotel-total"
                type="number"
                min={1}
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleFormChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="hotel-avail" className="mb-1 block text-xs font-semibold text-slate-700">
                Available Rooms
              </label>
              <input
                id="hotel-avail"
                type="number"
                min={0}
                name="availableRooms"
                value={formData.availableRooms}
                onChange={handleFormChange}
                placeholder="Defaults to total rooms"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="hotel-amenities" className="mb-1 block text-xs font-semibold text-slate-700">
              Amenities (comma-separated)
            </label>
            <input
              id="hotel-amenities"
              name="amenities"
              value={formData.amenities}
              onChange={handleFormChange}
              placeholder="Free Wi-Fi, Pool, Breakfast"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="hotel-image" className="block text-xs font-semibold text-slate-700">
              Property Image URL (or pick a preset below)
            </label>
            <input
              id="hotel-image"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleFormChange}
              placeholder="https://... or /images/hotel-palace.jpg"
              className={inputClass}
            />
            <div className="grid grid-cols-4 gap-2">
              {HOTEL_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.value }))}
                  className={`cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    formData.imageUrl === preset.value
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={preset.value}
                    alt={preset.label}
                    className="h-10 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="hotel-desc" className="mb-1 block text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="hotel-desc"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              required
              className={inputClass}
            />
          </div>

          {formError && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2 text-sm text-rose-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? 'Saving...' : editingHotelId ? 'Save Changes' : 'Create Property'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminDashboard;
