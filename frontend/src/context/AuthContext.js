'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fitflow_token');
    const savedUser  = localStorage.getItem('fitflow_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('fitflow_token', token);
    localStorage.setItem('fitflow_user', JSON.stringify(user));
    setToken(token);
    setUser(user);

    // Redirect based on role
    if (user.role === 'admin')        router.push('/admin');
    else if (user.role === 'trainer') router.push('/trainer');
    else                              router.push('/member');

    return user;
  };

  // REGISTER
  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
        name,
        email,
        password,
    });

    const { token, user } = response.data;

    localStorage.setItem('fitflow_token', token);
    localStorage.setItem('fitflow_user', JSON.stringify(user));
    setToken(token);
    setUser(user);

    router.push('/member');

    return user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}