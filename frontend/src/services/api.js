import axios from 'axios';

// In production (Render), the frontend is served BY the backend,
// so relative '/api' calls work perfectly.
// In development, Vite's proxy forwards '/api' to localhost:5000.
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to automatically add Bearer token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authorization failures (e.g. expired tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request! Logging out candidate...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
