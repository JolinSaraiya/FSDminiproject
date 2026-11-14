import { createContext, useContext, useEffect, useReducer } from 'react';
import { getHotels } from '../services/api';
import useSocket from '../hooks/useSocket';

const HotelContext = createContext(null);

const INITIAL_FILTERS = {
  search: '',
  roomType: 'All',
  maxPrice: '',
  amenity: 'All',
  sort: 'recommended',
  availableOnly: false,
};

const initialState = {
  hotels: [],
  filters: INITIAL_FILTERS,
  loading: true,
  error: '',
  recentlyBookedHotelId: null,
};

function hotelReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, hotels: action.payload, error: '' };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.field]: action.payload.value },
      };
    case 'RESET_FILTERS':
      return { ...state, filters: INITIAL_FILTERS };
    case 'HOTEL_CREATED': {
      const exists = state.hotels.some((h) => h._id === action.payload._id);
      if (exists) return state;
      return { ...state, hotels: [action.payload, ...state.hotels] };
    }
    case 'HOTEL_UPDATED': {
      const updated = action.payload;
      return {
        ...state,
        hotels: state.hotels.map((h) => (h._id === updated._id ? { ...h, ...updated } : h)),
      };
    }
    case 'HOTEL_DELETED':
      return {
        ...state,
        hotels: state.hotels.filter((h) => h._id !== action.payload),
      };
    case 'HIGHLIGHT_BOOKED_HOTEL':
      return { ...state, recentlyBookedHotelId: action.payload };
    default:
      return state;
  }
}

export function HotelProvider({ children }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);
  const { socket } = useSocket();

  const loadHotels = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await getHotels();
      dispatch({ type: 'FETCH_SUCCESS', payload: Array.isArray(data) ? data : [] });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message || 'Failed to load hotels' });
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  // Real-time synchronization through Socket.IO inside the centralized reducer
  useEffect(() => {
    if (!socket) return;

    function handleHotelCreated(payload) {
      if (payload?.hotel) {
        dispatch({ type: 'HOTEL_CREATED', payload: payload.hotel });
      }
    }

    function handleHotelUpdated(payload) {
      if (payload?.hotel) {
        dispatch({ type: 'HOTEL_UPDATED', payload: payload.hotel });
      }
    }

    function handleHotelDeleted(payload) {
      if (payload?.hotelId) {
        dispatch({ type: 'HOTEL_DELETED', payload: payload.hotelId });
      }
    }

    function handleBookingCreated(payload) {
      if (payload?.hotel) {
        dispatch({ type: 'HOTEL_UPDATED', payload: payload.hotel });
        dispatch({ type: 'HIGHLIGHT_BOOKED_HOTEL', payload: payload.hotel._id });
        setTimeout(() => {
          dispatch({ type: 'HIGHLIGHT_BOOKED_HOTEL', payload: null });
        }, 5000);
      }
    }

    function handleBookingCancelled(payload) {
      if (payload?.hotel) {
        dispatch({ type: 'HOTEL_UPDATED', payload: payload.hotel });
      }
    }

    socket.on('hotel:created', handleHotelCreated);
    socket.on('hotel:updated', handleHotelUpdated);
    socket.on('hotel:deleted', handleHotelDeleted);
    socket.on('booking:created', handleBookingCreated);
    socket.on('booking:cancelled', handleBookingCancelled);

    return () => {
      socket.off('hotel:created', handleHotelCreated);
      socket.off('hotel:updated', handleHotelUpdated);
      socket.off('hotel:deleted', handleHotelDeleted);
      socket.off('booking:created', handleBookingCreated);
      socket.off('booking:cancelled', handleBookingCancelled);
    };
  }, [socket]);

  function setFilter(field, value) {
    dispatch({ type: 'SET_FILTER', payload: { field, value } });
  }

  function resetFilters() {
    dispatch({ type: 'RESET_FILTERS' });
  }

  // Filtered and sorted hotels derived memo-state
  const filteredHotels = state.hotels.filter((hotel) => {
    const q = state.filters.search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      hotel.name.toLowerCase().includes(q) ||
      hotel.city.toLowerCase().includes(q) ||
      hotel.description.toLowerCase().includes(q);

    const matchesRoomType =
      state.filters.roomType === 'All' || hotel.roomType === state.filters.roomType;

    const matchesMaxPrice =
      !state.filters.maxPrice ||
      Number(hotel.pricePerNight) <= Number(state.filters.maxPrice);

    const matchesAvailability =
      !state.filters.availableOnly || hotel.availableRooms > 0;

    const matchesAmenity =
      state.filters.amenity === 'All' ||
      (Array.isArray(hotel.amenities) &&
        hotel.amenities.some(
          (a) => a.toLowerCase() === state.filters.amenity.toLowerCase(),
        ));

    return (
      matchesSearch &&
      matchesRoomType &&
      matchesMaxPrice &&
      matchesAvailability &&
      matchesAmenity
    );
  }).sort((a, b) => {
    switch (state.filters.sort) {
      case 'price_asc':
        return Number(a.pricePerNight) - Number(b.pricePerNight);
      case 'price_desc':
        return Number(b.pricePerNight) - Number(a.pricePerNight);
      case 'rooms_desc':
        return Number(b.availableRooms) - Number(a.availableRooms);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      default:
        return 0; // Natural creation order
    }
  });

  return (
    <HotelContext.Provider
      value={{
        hotels: state.hotels,
        filteredHotels,
        filters: state.filters,
        loading: state.loading,
        error: state.error,
        recentlyBookedHotelId: state.recentlyBookedHotelId,
        setFilter,
        resetFilters,
        reloadHotels: loadHotels,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
}

export function useHotelState() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotelState must be used within a HotelProvider');
  }
  return context;
}

export default HotelContext;

