import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount: restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('ecg_token');
    const stored = localStorage.getItem('ecg_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('ecg_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, userData) => {
    localStorage.setItem('ecg_token', token);
    localStorage.setItem('ecg_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    saveSession(data.token, data.user);
    toast.success(`Welcome, ${data.user.name}! 🌱`);
    return data;
  };

  const login = async (formData) => {
    const { data } = await authAPI.login(formData);
    saveSession(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('ecg_token');
    localStorage.removeItem('ecg_user');
    setUser(null);
    toast.success('Logged out successfully.');
  }, []);

  // Refresh user data from server
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('ecg_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      // ignore — interceptor handles 401
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, isAdmin, register, login, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
