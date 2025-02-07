import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { verifyTokenApiCall, logoutApiCall, loginApiCall, refreshTokenApiCall } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = useRef(null);
  const isRefreshing = useRef(false);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const logout = useCallback(async () => {
    try {
      await logoutApiCall();
      setIsAuthenticated(false);
      clearRefreshTimer();
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if the logout API call fails, we should clean up the client state
      setIsAuthenticated(false);
      clearRefreshTimer();
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (isRefreshing.current) return;
    
    try {
      isRefreshing.current = true;
      const response = await refreshTokenApiCall();
      if (response?.expiresIn) {
        await setupRefreshTimer(response.expiresIn);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
    } finally {
      isRefreshing.current = false;
    }
  }, [logout]);

  const setupRefreshTimer = useCallback(async (expiresIn) => {
    clearRefreshTimer();
    const timeout = (expiresIn * 0.8);
    console.log('Setting up refresh timer for', timeout / 1000, 'seconds');

    refreshTimerRef.current = setTimeout(async () => {
      await refreshToken();
    }, timeout);
  }, [refreshToken]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await verifyTokenApiCall();
        setIsAuthenticated(response.isAuthenticated);
        if (response.isAuthenticated && response.expiresIn) {
          await setupRefreshTimer(response.expiresIn);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    return () => {
      clearRefreshTimer();
    };
  }, [setupRefreshTimer]);

  const login = async (username, password) => {
    try {
      const response = await loginApiCall(username, password);
      setIsAuthenticated(true);
      if (response?.expiresIn) {
        await setupRefreshTimer(response.expiresIn);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};
