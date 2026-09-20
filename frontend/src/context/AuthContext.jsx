import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'niramoy_token';
const USER_KEY = 'niramoy_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('medicare_token');
    const savedUser = localStorage.getItem(USER_KEY) || localStorage.getItem('medicare_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem('medicare_token');
        localStorage.removeItem('medicare_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = useCallback((userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem(TOKEN_KEY, tokenStr);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
  }, []);

  const register = useCallback(async (formData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Registration failed');
      err.code = data.code;
      err.errors = data.errors;
      throw err;
    }
    saveSession(data.data.user, data.data.token);
    return data.data;
  }, [saveSession]);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Login failed');
      err.code = data.code;
      throw err;
    }
    saveSession(data.data.user, data.data.token);
    return data.data;
  }, [saveSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const fetchMe = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUser(data.data);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        return data.data;
      }
    } catch {
      // Network error — keep cached user
    }
    return user;
  }, [token, user]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
    fetchMe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
