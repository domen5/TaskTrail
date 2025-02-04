import React, { createContext, useState, useEffect } from 'react';
import { verifyTokenApiCall } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await verifyTokenApiCall();
      setIsAuthenticated(isAuthenticated);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
