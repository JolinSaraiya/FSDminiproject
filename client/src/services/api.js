const TOKEN_KEY = 'stayHubToken';
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export function registerUser(userData) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser() {
  return apiRequest('/auth/me');
}

export function updateProfile(profileData) {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export function changePassword(passwordData) {
  return apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
}

export function getHotels(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  ).toString();
  return apiRequest(`/hotels${query ? `?${query}` : ''}`);
}

export function getHotelById(id) {
  return apiRequest(`/hotels/${id}`);
}

export function createHotel(hotelData) {
  return apiRequest('/hotels', {
    method: 'POST',
    body: JSON.stringify(hotelData),
  });
}

export function updateHotel(id, hotelData) {
  return apiRequest(`/hotels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(hotelData),
  });
}

export function deleteHotel(id) {
  return apiRequest(`/hotels/${id}`, {
    method: 'DELETE',
  });
}

export function createBooking(bookingData) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export function getMyBookings() {
  return apiRequest('/bookings/my');
}

export function getAllBookings() {
  return apiRequest('/bookings');
}

export function cancelBooking(id) {
  return apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  });
}

export function getActivities(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/activities${query ? `?${query}` : ''}`);
}

export function getActivityStats() {
  return apiRequest('/activities/stats');
}

export function simulateActivity() {
  return apiRequest('/activities/simulate', {
    method: 'POST',
  });
}
