import React, { createContext, useState, useEffect } from 'react';
import { verifyTokenApiCall, logoutApiCall, loginApiCall } from '../api/auth';

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

  const login = async (username, password) => {
    try {
      await loginApiCall(username, password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
