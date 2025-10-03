import api from './api';
import { LoginCredentials, RegisterData, User } from '../types';

// Benutzer anmelden
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/users/login', credentials);
  if (response.data && response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
  }
  return response.data.user;
};

// Benutzer registrieren
export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await api.post('/users/register', userData);
  if (response.data && response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data.user));
  }
  return response.data.user;
};

// Benutzer ausloggen
export const logoutUser = (): void => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

// Aktuellen Benutzer abrufen (aus localStorage)
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Fresh user data from server abrufen
export const fetchUserFromServer = async (): Promise<User> => {
  const response = await api.get('/users/me');
  // Update localStorage with fresh data
  const userData = response.data.user || response.data;
  localStorage.setItem('userData', JSON.stringify(userData));
  return userData;
};

// Benutzerprofil aktualisieren
export const updateProfile = async (userData: any): Promise<User> => {
  const response = await api.put('/users/profile', userData);
  if (response.data) {
    // Aktualisierte Benutzerdaten im localStorage speichern
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  }
  return response.data;
};

// Prüfen, ob der Benutzer angemeldet ist
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('userToken') !== null;
};

// Reset user progress data (for testing/cleaning)
export const resetUserProgress = async (): Promise<any> => {
  const response = await api.post('/users/reset-progress');
  // Update localStorage with fresh reset data
  if (response.data.user) {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const resetUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('userData', JSON.stringify(resetUser));
    }
  }
  return response.data;
};
