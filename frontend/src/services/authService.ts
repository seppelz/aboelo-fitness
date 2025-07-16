import api from './api';
import { LoginCredentials, RegisterData, User } from '../types';

// Benutzer anmelden
export const loginUser = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/users/login', credentials);
  if (response.data && response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

// Benutzer registrieren
export const registerUser = async (userData: RegisterData): Promise<User> => {
  const response = await api.post('/users/register', userData);
  if (response.data && response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

// Benutzer ausloggen
export const logoutUser = (): void => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

// Aktuellen Benutzer abrufen
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
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
