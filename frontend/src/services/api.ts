import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.aboelo.de/api';
const CSRF_COOKIE_NAME = 'aboelo_csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

let csrfTokenPromise: Promise<string | null> | null = null;

const ensureCsrfToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingToken = getCookieValue(CSRF_COOKIE_NAME);
  if (existingToken) {
    return existingToken;
  }

  if (!csrfTokenPromise) {
    csrfTokenPromise = axios
      .get(`${API_URL}/auth/csrf`, { withCredentials: true })
      .then(() => getCookieValue(CSRF_COOKIE_NAME))
      .catch((error) => {
        console.error('Fehler beim Abrufen des CSRF-Tokens:', error);
        return null;
      })
      .finally(() => {
        csrfTokenPromise = null;
      });
  }

  return csrfTokenPromise;
};

api.interceptors.request.use(async (config) => {
  config.withCredentials = true;

  if (typeof window === 'undefined') {
    return config;
  }

  if (config.url && config.url.includes('/auth/csrf')) {
    return config;
  }

  const csrfToken = await ensureCsrfToken();
  if (csrfToken) {
    if (config.headers) {
      (config.headers as any)[CSRF_HEADER_NAME] = csrfToken;
    } else {
      config.headers = { [CSRF_HEADER_NAME]: csrfToken } as any;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const hadUserData = !!localStorage.getItem('userData');
      console.log('🔒 Sitzung ungültig - Benutzer wird abgemeldet');
      localStorage.removeItem('userData');
      if (hadUserData && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export { ensureCsrfToken, getCookieValue, CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
export default api;
