import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión actual al cargar
    const checkSession = async () => {
      const storedUser = localStorage.getItem('colshop_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    const response = await fetch('/api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // IMPORTANTE: Enviar cookies de sesión
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t('auth.loginError'));
    
    localStorage.setItem('colshop_user', JSON.stringify(data.user));
    setCurrentUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (email, password) => {
    const response = await fetch('/api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || t('auth.signupError'));
    
    return data;
  };

  const logout = async () => {
    // Llamar al endpoint de logout para destruir la sesión en el servidor
    await fetch('/api/logout.php', {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('colshop_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};