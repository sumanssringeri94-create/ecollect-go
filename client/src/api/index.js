import axios from 'axios';

// Base URL — uses Vite proxy in dev, direct URL in prod
const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecg_token');
      localStorage.removeItem('ecg_user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
};

// ─── Users ────────────────────────────────────
export const userAPI = {
  getProfile:      ()     => API.get('/users/profile'),
  updateProfile:   (data) => API.put('/users/profile', data),
  getLeaderboard:  ()     => API.get('/users/leaderboard'),
  // Admin
  getAllUsers:      ()     => API.get('/users/admin/all'),
  toggleUser:      (id)   => API.put(`/users/admin/${id}/toggle`),
};

// ─── Waste ────────────────────────────────────
export const wasteAPI = {
  getCategories: ()     => API.get('/waste/categories'),
  addItem:       (data) => API.post('/waste', data),
  getMyItems:    ()     => API.get('/waste/my'),
  deleteItem:    (id)   => API.delete(`/waste/${id}`),
  // Admin
  getAllItems:    ()     => API.get('/waste/admin/all'),
};

// ─── Pickups ──────────────────────────────────
export const pickupAPI = {
  schedule:    (data) => API.post('/pickups', data),
  getMyPickups: ()    => API.get('/pickups/my'),
  cancel:      (id)   => API.delete(`/pickups/${id}`),
  // Admin
  getAllPickups: (status) => API.get('/pickups/admin/all', { params: { status } }),
  getAnalytics: ()        => API.get('/pickups/admin/analytics'),
  approve:     (id, data) => API.put(`/pickups/admin/${id}/approve`, data),
  reject:      (id, data) => API.put(`/pickups/admin/${id}/reject`, data),
  complete:    (id)       => API.put(`/pickups/admin/${id}/complete`),
};

// ─── Centers ──────────────────────────────────
export const centerAPI = {
  getCenters: (city) => API.get('/centers', { params: city ? { city } : {} }),
};

export default API;
