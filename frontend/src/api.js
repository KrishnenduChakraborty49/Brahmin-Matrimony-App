import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Automatically inject JWT token into authorization header if available (skip for auth endpoints)
api.interceptors.request.use(
  (config) => {
    if (config.url && !config.url.startsWith('/auth/')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
