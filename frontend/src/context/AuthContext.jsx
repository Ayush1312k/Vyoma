import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const DEFAULT_USER = {
  id: 'f4c547aa-2381-40e8-8d7c-3f997dd78730',
  name: 'Ayush Kumar',
  email: 'kumarayush1312@gmail.com',
  username: 'Ayush1312k',
  role: 'Founder & Lead Developer',
  city: 'Vadodara',
  country: 'India',
  accountType: 'developer',
  profile_photo: '/ayush_profile.jpg',
  onboardingComplete: true,
  isDemo: false,
  balance: 1000,
  socials: {
    github: 'https://github.com/Ayush1312k',
    linkedin: 'https://www.linkedin.com/in/ayush-kumar-183304221',
    portfolio: 'https://github.com/Ayush1312k'
  },
  projects: [
    {
      name: 'Vyoma Collaborative IDE',
      role: 'Lead Architect',
      tech: 'React, Node.js, WebSockets, WebRTC'
    },
    {
      name: 'Sanjay AI',
      role: 'AI Systems Architect',
      tech: 'Python, LLMs, LangChain, FastAPI'
    },
    {
      name: 'AuctionEase',
      role: 'Full Stack Engineer',
      tech: 'React, Node.js, Redis, WebSockets'
    },
    {
      name: 'FilterX',
      role: 'Lead Developer',
      tech: 'TypeScript, Next.js, TailwindCSS, WebGL'
    },
    {
      name: 'DeepFake and Fake News Detection System',
      role: 'ML & Research Engineer',
      tech: 'PyTorch, CNNs, Transformers, Computer Vision, NLP'
    }
  ]
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('da_user');
    const savedMode = localStorage.getItem('da_view_mode') || 'developer';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER,
          ...parsed,
          profile_photo: parsed.profile_photo || DEFAULT_USER.profile_photo,
          accountType: savedMode,
          socials: { ...DEFAULT_USER.socials, ...(parsed.socials || {}) }
        };
      } catch (e) {
        // use default
      }
    }
    return { ...DEFAULT_USER, accountType: savedMode };
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('da_token') || 'demo_token_vyoma_ayush';
  });
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    localStorage.setItem('da_user', JSON.stringify(user));
    localStorage.setItem('da_token', token);
    localStorage.setItem('da_view_mode', user.accountType || 'developer');
  }, [user, token]);

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('da_user', JSON.stringify(updated));
      return updated;
    });
  };

  const setAccountType = (newType) => {
    localStorage.setItem('da_view_mode', newType);
    setUser(prev => ({
      ...prev,
      accountType: newType
    }));
    toast.success(`Switched to ${newType === 'employer' ? 'Employer' : 'Developer'} view!`, {
      icon: newType === 'employer' ? '💼' : '💻'
    });
  };

  const toggleViewMode = () => {
    const nextMode = user.accountType === 'employer' ? 'developer' : 'employer';
    setAccountType(nextMode);
  };

  const login = async () => user;
  const register = async () => user;
  const completeOnboarding = () => setShowOnboarding(false);
  const logout = () => {
    // When authentication is removed, user stays in Ayush profile
    toast('Site is in public preview mode (signed in as Ayush Kumar)', { icon: 'ℹ️' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: true, // Always authenticated!
      showOnboarding: false,
      login,
      register,
      completeOnboarding,
      updateUser,
      setAccountType,
      toggleViewMode,
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
