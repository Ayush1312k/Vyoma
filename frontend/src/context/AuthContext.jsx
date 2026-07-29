import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
const AuthContext = createContext(null);
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    const savedToken = localStorage.getItem('da_token');
    const savedUser = localStorage.getItem('da_user');
    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem('da_token');
        localStorage.removeItem('da_user');
        setLoading(false);
        return;
      }
      try {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Check if onboarding is incomplete (no accountType set)
        if (!parsed.onboardingComplete) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error('Failed to parse stored session:', e);
        localStorage.removeItem('da_token');
        localStorage.removeItem('da_user');
      }
    }
    setLoading(false);
  }, []);
  const persistSession = (token, user) => {
    localStorage.setItem('da_token', token);
    localStorage.setItem('da_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('da_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
  const clearSession = () => {
    localStorage.removeItem('da_token');
    localStorage.removeItem('da_user');
    setToken(null);
    setUser(null);
    setShowOnboarding(false);
  };
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    // Check if user completed onboarding before
    const savedOnboarding = localStorage.getItem(`da_onboarding_${data.user.email}`);
    const enrichedUser = { ...data.user, onboardingComplete: !!savedOnboarding };
    persistSession(data.token, enrichedUser);
    if (!savedOnboarding) {
      setShowOnboarding(true);
    }
    return enrichedUser;
  };
  const register = async (name, email, password, username) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, username })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    const enrichedUser = { ...data.user, onboardingComplete: false };
    persistSession(data.token, enrichedUser);
    setShowOnboarding(true);
    return enrichedUser;
  };
  const completeOnboarding = (details) => {
    const updatedUser = { ...user, ...details, onboardingComplete: true };
    localStorage.setItem('da_user', JSON.stringify(updatedUser));
    localStorage.setItem(`da_onboarding_${user.email}`, 'true');
    setUser(updatedUser);
    setShowOnboarding(false);
  };
  const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/auth/callback';
    if (!clientId) {
      toast.error('Google Client ID is missing in .env');
      return;
    }
    const stateNonce = 'google_' + crypto.randomUUID();
    sessionStorage.setItem('oauth_state', stateNonce);
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=profile email&state=${stateNonce}`;
    window.location.href = url;
  };

  const loginWithGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + '/auth/callback';
    if (!clientId) {
      toast.error('GitHub Client ID is missing in .env');
      return;
    }
    const stateNonce = 'github_' + crypto.randomUUID();
    sessionStorage.setItem('oauth_state', stateNonce);
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${stateNonce}`;
    window.location.href = url;
  };
  
  const handleOAuthCallback = async (provider, code, state) => {
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    if (!savedState || savedState !== state) {
      throw new Error('OAuth state mismatch. Possible CSRF attack.');
    }
    const res = await fetch(`${API_URL}/api/auth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: window.location.origin + '/auth/callback' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${provider} auth failed`);
    const savedOnboarding = localStorage.getItem(`da_onboarding_${data.user.email}`);
    const enrichedUser = { ...data.user, accountType: data.user.accountType || 'developer', onboardingComplete: !!savedOnboarding };
    persistSession(data.token, enrichedUser);
    if (!savedOnboarding) {
      setShowOnboarding(true);
    }
    return enrichedUser;
  };
  const logout = () => {
    clearSession();
  };
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      showOnboarding,
      login,
      register,
      loginWithGoogle,
      loginWithGithub,
      handleOAuthCallback,
      completeOnboarding,
      updateUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
