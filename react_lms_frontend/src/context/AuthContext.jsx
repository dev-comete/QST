import React, { createContext, useState, useContext, useEffect } from 'react';
import { TokenStorage } from '../utils/storage';
import { AuthService } from '../api/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize state from local storage on first load
  useEffect(() => {
    const storedUser = TokenStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const loginContext = (access, refresh, userData) => {
    TokenStorage.setAuthData(access, refresh, userData);
    setUser(userData);
  };

  const logoutContext = async () => {
    // 1. On invalide le token côté backend
    await AuthService.logout();
    // 2. On vide le navigateur
    TokenStorage.clear();
    // 3. On déconnecte l'interface React
    setUser(null);
  };

  if (loading) return <div>Loading app...</div>;

  return (
    <AuthContext.Provider value={{ user, loginContext, logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
