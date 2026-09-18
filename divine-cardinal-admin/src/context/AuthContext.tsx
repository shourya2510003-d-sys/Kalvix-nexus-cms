'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  walletBalance?: string;
  goldenCoins?: number;
  requiresPasswordSetup?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('kalvix_token') || sessionStorage.getItem('kalvix_token');
    const savedUser = localStorage.getItem('kalvix_user') || sessionStorage.getItem('kalvix_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Fetch latest user data (for updated walletBalance / goldenCoins)
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'http://127.0.0.1:4001/api';
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const updatedUser = { ...parsedUser, ...data };
          setUser(updatedUser);
          if (localStorage.getItem('kalvix_token')) {
            localStorage.setItem('kalvix_user', JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem('kalvix_user', JSON.stringify(updatedUser));
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User, rememberMe: boolean = true) => {
    setToken(newToken);
    setUser(newUser);
    if (rememberMe) {
      localStorage.setItem('kalvix_token', newToken);
      localStorage.setItem('kalvix_user', JSON.stringify(newUser));
      sessionStorage.removeItem('kalvix_token');
      sessionStorage.removeItem('kalvix_user');
    } else {
      sessionStorage.setItem('kalvix_token', newToken);
      sessionStorage.setItem('kalvix_user', JSON.stringify(newUser));
      localStorage.removeItem('kalvix_token');
      localStorage.removeItem('kalvix_user');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('kalvix_token');
    localStorage.removeItem('kalvix_user');
    sessionStorage.removeItem('kalvix_token');
    sessionStorage.removeItem('kalvix_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
