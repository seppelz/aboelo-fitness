import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser, getCurrentUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  register: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: () => {
    throw new Error('AuthContext not initialized');
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Beim Start prüfen, ob ein Benutzer angemeldet ist
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const userData = getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des aktuellen Benutzers:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login-Funktion
  const login = async (credentials: LoginCredentials) => {
    try {
      const userData = await apiLogin(credentials);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login-Fehler:', error);
      throw error;
    }
  };

  // Registrierungsfunktion
  const register = async (userData: RegisterData) => {
    try {
      const newUser = await apiRegister(userData);
      setUser(newUser);
      return newUser;
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      throw error;
    }
  };

  // Logout-Funktion
  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
