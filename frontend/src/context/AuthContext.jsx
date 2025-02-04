import React, { createContext, useState, useEffect } from 'react';
import { verifyTokenApiCall, logoutApiCall } from '../api/auth';

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

  const logout = async () => {
    try {
      await logoutApiCall();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
