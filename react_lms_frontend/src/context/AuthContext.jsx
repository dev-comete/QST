import React, { createContext, useState, useContext, useEffect } from 'react';
import { TokenStorage } from '../utils/storage';

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

  const logoutContext = () => {
    TokenStorage.clear();
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
