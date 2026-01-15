import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('it');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedLang = localStorage.getItem('language') || 'it';
    setLanguage(savedLang);
    
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setLanguage(response.data.language || 'it');
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('language', userData.language || 'it');
    setUser(userData);
    setLanguage(userData.language || 'it');
    return userData;
  };

  const register = async (email, password, name, lang = 'it', phone = '') => {
    const response = await axios.post(`${API}/auth/register`, {
      email,
      password,
      name,
      phone,
      language: lang
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateLanguage = async (lang) => {
    if (user) {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/auth/language?language=${lang}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ ...user, language: lang });
    }
    localStorage.setItem('language', lang);
    setLanguage(lang);
  };

  const getToken = () => localStorage.getItem('token');

  const value = {
    user,
    loading,
    language,
    login,
    register,
    logout,
    updateLanguage,
    getToken,
    isAuthenticated: !!user,
    hasSubscription: user?.subscription_active || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
