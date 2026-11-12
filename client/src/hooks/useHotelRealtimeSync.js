import { useEffect } from 'react';
import useSocket from './useSocket';

function upsertHotel(list, incoming) {
  if (!incoming?._id) return list;
  const exists = list.some((item) => item._id === incoming._id);
  return exists
    ? list.map((item) => (item._id === incoming._id ? incoming : item))
    : [incoming, ...list];
}

function useHotelRealtimeSync({ setHotels, setBookings, setActivities, maxHotels } = {}) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return undefined;

    function handleHotelCreated(payload) {
      if (!setHotels || !payload?.hotel) return;
      setHotels((prev) => {
        const next = upsertHotel(prev, payload.hotel);
        return typeof maxHotels === 'number' ? next.slice(0, maxHotels) : next;
      });
    }

    function handleHotelUpdated(payload) {
      if (!setHotels || !payload?.hotel) return;
      setHotels((prev) =>
        prev.map((item) => (item._id === payload.hotel._id ? payload.hotel : item)),
      );
    }

    function handleHotelDeleted(payload) {
      const deletedId = payload?.hotel?._id;
      if (!deletedId) return;

      if (setHotels) {
        setHotels((prev) => prev.filter((item) => item._id !== deletedId));
      }
      if (setBookings) {
        setBookings((prev) => prev.filter((b) => b.hotel?._id !== deletedId));
      }
    }

    function handleBookingChanged(payload) {
      if (setHotels && payload?.hotel) {
        setHotels((prev) =>
          prev.map((item) => (item._id === payload.hotel._id ? payload.hotel : item)),
        );
      }
      if (setBookings && payload?.booking) {
        setBookings((prev) => {
          const exists = prev.some((b) => b._id === payload.booking._id);
          return exists
            ? prev.map((b) => (b._id === payload.booking._id ? payload.booking : b))
            : [payload.booking, ...prev];
        });
      }
    }

    function handleActivityLogged(activity) {
      if (!setActivities || !activity?._id) return;
      setActivities((prev) => {
        const exists = prev.some((item) => item._id === activity._id);
        return exists ? prev : [activity, ...prev].slice(0, 50);
      });
    }

    socket.on('hotel:created', handleHotelCreated);
    socket.on('hotel:updated', handleHotelUpdated);
    socket.on('hotel:deleted', handleHotelDeleted);
    socket.on('booking:created', handleBookingChanged);
    socket.on('booking:cancelled', handleBookingChanged);
    socket.on('activity:logged', handleActivityLogged);

    return () => {
      socket.off('hotel:created', handleHotelCreated);
      socket.off('hotel:updated', handleHotelUpdated);
      socket.off('hotel:deleted', handleHotelDeleted);
      socket.off('booking:created', handleBookingChanged);
      socket.off('booking:cancelled', handleBookingChanged);
      socket.off('activity:logged', handleActivityLogged);
    };
  }, [socket, setHotels, setBookings, setActivities, maxHotels]);
}

export default useHotelRealtimeSync;
