import axios from 'axios';

// API-Basis-URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios-Instanz mit Basis-URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor für Token-Authentifizierung
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
