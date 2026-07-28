import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService, getUser, getToken, clearAuth } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanCount, setScanCount] = useState(14); // Base scan counter

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await getUser();
      const storedToken = await getToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementScanCount = () => {
    setScanCount((prev) => prev + 1);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, clinic, specialty) => {
    setLoading(true);
    try {
      const data = await authService.signup(name, email, password, clinic, specialty);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearAuth();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        scanCount,
        incrementScanCount,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
