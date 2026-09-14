import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { loginApi, refreshApi, DEMO_PASSWORD } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ivy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ivy_access_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const refreshTimerRef = useRef(null);

  // Store tokens in localStorage
  const persistSession = (accessToken, refreshToken, userData, expiresIn = 900) => {
    localStorage.setItem('ivy_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('ivy_refresh_token', refreshToken);
    }
    localStorage.setItem('ivy_user', JSON.stringify(userData));
    const expiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('ivy_expires_at', expiresAt.toString());

    setToken(accessToken);
    setUser(userData);
    setLastRefreshedAt(new Date());
  };

  const clearSession = () => {
    localStorage.removeItem('ivy_access_token');
    localStorage.removeItem('ivy_refresh_token');
    localStorage.removeItem('ivy_user');
    localStorage.removeItem('ivy_expires_at');
    setToken(null);
    setUser(null);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const login = async (email, password = DEMO_PASSWORD) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const data = await loginApi(email, password);
      persistSession(data.access_token, data.refresh_token, data.user, data.expires_in || 900);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Failed to authenticate');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  // Perform background token refresh
  const triggerRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem('ivy_refresh_token');
    if (!refreshToken) return;

    try {
      console.log('[Auth] Executing scheduled background token refresh...');
      const data = await refreshApi(refreshToken);
      const currentUser = JSON.parse(localStorage.getItem('ivy_user') || '{}');
      persistSession(data.access_token, data.refresh_token, currentUser, 900);
      console.log('[Auth] Token successfully refreshed!');
    } catch (err) {
      console.warn('[Auth] Background refresh failed:', err);
    }
  }, []);

  // Automatic silent refresh schedule
  useEffect(() => {
    if (!token) return;

    // Schedule next refresh 12 minutes (720s) after issue, or check expiry
    const expiresAt = parseInt(localStorage.getItem('ivy_expires_at') || '0', 10);
    const timeUntilExpiry = expiresAt - Date.now();
    // Refresh 3 minutes before expiration, or in 10 minutes
    const refreshDelay = Math.max(10000, timeUntilExpiry - 180000);

    console.log(`[Auth] Scheduling next token refresh in ${Math.round(refreshDelay / 1000)} seconds.`);
    refreshTimerRef.current = setTimeout(triggerRefresh, refreshDelay);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [token, lastRefreshedAt, triggerRefresh]);

  // Window focus check
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && token) {
        const expiresAt = parseInt(localStorage.getItem('ivy_expires_at') || '0', 10);
        // If expired or less than 3 minutes left, refresh immediately
        if (Date.now() >= expiresAt - 180000) {
          triggerRefresh();
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, [token, triggerRefresh]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        authError,
        lastRefreshedAt,
        login,
        logout,
        triggerRefresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
