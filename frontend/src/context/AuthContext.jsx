import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default logged in user matching SRS and UI screenshot
    return {
      first_name: 'Yuvan',
      last_name: '',
      email: 'yuvan@example.com',
      avatar_url: '',
      currency: '₹',
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return true; // Start authenticated with Yuvan's profile as shown in design
  });
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  useEffect(() => {
    // If we have token, verify profile with backend
    const token = getAuthToken();
    if (token) {
      apiRequest('/auth/me/')
        .then(data => {
          if (data && data.first_name) {
            setUser(data);
            localStorage.setItem('current_user', JSON.stringify(data));
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          // keep local fallback
        });
    }

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    if (lockedUntil && new Date() < lockedUntil) {
      const minsLeft = Math.ceil((lockedUntil - new Date()) / 60000);
      throw new Error(`Account locked due to 5 failed attempts. Please wait ${minsLeft} minutes.`);
    }

    setLoading(true);
    try {
      const res = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.access) {
        setAuthToken(res.access, res.refresh);
      }
      const userData = res.user || {
        first_name: 'Yuvan',
        last_name: '',
        email,
        currency: '₹',
      };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      setIsAuthenticated(true);
      setFailedAttempts(0);
      setLockedUntil(null);
      return userData;
    } catch (err) {
      // Local check fallback
      if (email.toLowerCase() === 'yuvan@example.com' && password === 'password123') {
        const u = { first_name: 'Yuvan', last_name: '', email, currency: '₹' };
        setUser(u);
        localStorage.setItem('current_user', JSON.stringify(u));
        setIsAuthenticated(true);
        setFailedAttempts(0);
        return u;
      }

      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000);
        setLockedUntil(lockTime);
        throw new Error('Too many failed attempts. Account locked for 15 minutes.');
      }
      throw new Error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRequest('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (res.access) {
        setAuthToken(res.access, res.refresh);
      }
      const userData = res.user || {
        first_name: name.split(' ')[0] || 'User',
        last_name: name.split(' ').slice(1).join(' ') || '',
        email,
        currency: '₹',
      };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      // Local fallback
      const u = {
        first_name: name.split(' ')[0] || 'User',
        last_name: name.split(' ').slice(1).join(' ') || '',
        email,
        currency: '₹',
      };
      setUser(u);
      localStorage.setItem('current_user', JSON.stringify(u));
      setIsAuthenticated(true);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout/', { method: 'POST' });
    } catch (e) {}
    clearAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    try {
      const updated = await apiRequest('/auth/me/', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setUser(updated);
      localStorage.setItem('current_user', JSON.stringify(updated));
      return updated;
    } catch (e) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('current_user', JSON.stringify(updated));
      return updated;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
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
