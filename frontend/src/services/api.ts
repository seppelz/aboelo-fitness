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

// Interceptor für 401 Unauthorized Fehler (abgelaufene Tokens)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token ist abgelaufen oder ungültig
      console.log('🔒 Token abgelaufen oder ungültig - Benutzer wird abgemeldet');
      
      // Lokale Daten löschen
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      
      // Zur Login-Seite umleiten, wenn nicht schon dort
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
