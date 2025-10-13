import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser, getCurrentUser, fetchUserFromServer } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocally: (userData: Partial<User>) => void;
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
  refreshUser: async () => {
    throw new Error('AuthContext not initialized');
  },
  updateUserLocally: () => {
    throw new Error('AuthContext not initialized');
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error('Fehler beim Lesen des Benutzers aus dem lokalen Speicher:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Beim Start prüfen, ob ein Benutzer angemeldet ist
  useEffect(() => {
    const syncUser = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;

        if (!token) {
          setUser(null);
          return;
        }

        const freshUserData = await fetchUserFromServer();
        setUser(freshUserData);
      } catch (error) {
        console.error('Fehler beim Synchronisieren des Benutzers:', error);
      } finally {
        setLoading(false);
      }
    };

    syncUser();
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

  // Refresh user data function - fetch fresh data from server
  const refreshUser = async () => {
    try {
      const freshUserData = await fetchUserFromServer();
      setUser(freshUserData);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzers:', error);
    }
  };

  const updateUserLocally = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }
      const updatedUser = { ...prev, ...userData } as User;
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return updatedUser;
    });
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
        refreshUser,
        updateUserLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
