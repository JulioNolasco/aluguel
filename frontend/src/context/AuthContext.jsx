import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('playloc_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.auth.getMe();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('playloc_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    showToast(`Bem-vindo de volta, ${data.user.name}!`, 'success');
    return data.user;
  };

  const register = async (userData) => {
    const data = await api.auth.register(userData);
    localStorage.setItem('playloc_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    showToast('Conta criada com sucesso!', 'success');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('playloc_token');
    setToken(null);
    setUser(null);
    showToast('Sessão encerrada.', 'warning');
  };

  const refreshUser = async () => {
    try {
      const userData = await api.auth.getMe();
      setUser(userData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
