import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Briefcase, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Room from './pages/Room';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import Marketplace from './pages/Marketplace';
import Chat from './pages/Chat';
import Hire from './pages/Hire';
import CompletedProjects from './pages/CompletedProjects';
import ErrorBoundary from './components/ErrorBoundary';
import StartupLoader from './components/StartupLoader';

const OnboardingModal = () => {
  const { user, showOnboarding, completeOnboarding } = useAuth();
  const [accountType, setAccountType] = useState('developer');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [step, setStep] = useState(1);

  if (!showOnboarding) return null;

  const handleComplete = () => {
    completeOnboarding({ accountType, country, city });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-[#050505] border border-white/15 rounded-[2rem] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={14} className="text-amber-400" /> Welcome Setup
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Hey, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-gray-400 text-sm">
              Let's personalize your experience in just a moment.
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-white' : 'bg-white/10'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-white' : 'bg-white/10'}`}></div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Account Type Selection */}
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What brings you here?</label>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setAccountType('developer')}
                    className={`p-6 rounded-2xl border text-center transition-all ${
                      accountType === 'developer' 
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_30px_rgba(59,130,246,0.15)]' 
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Code2 size={32} className={`mx-auto mb-3 ${accountType === 'developer' ? 'text-blue-400' : 'text-gray-500'}`} />
                    <div className="text-base font-semibold">Build & Code</div>
                    <div className="text-[11px] text-gray-500 mt-1">Join as a developer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('employer')}
                    className={`p-6 rounded-2xl border text-center transition-all ${
                      accountType === 'employer' 
                        ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_30px_rgba(245,158,11,0.15)]' 
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Briefcase size={32} className={`mx-auto mb-3 ${accountType === 'employer' ? 'text-amber-400' : 'text-gray-500'}`} />
                    <div className="text-base font-semibold">Hire Talent</div>
                    <div className="text-[11px] text-gray-500 mt-1">Find developers</div>
                  </button>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="glass-btn w-full flex items-center justify-center gap-2 px-4 py-3.5 text-white font-medium"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Location */}
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  <MapPin size={12} className="inline mr-1" /> Where are you based? <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country" 
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-colors text-sm"
                  />
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City" 
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-colors text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="glass-btn flex-1 py-3.5 text-gray-400 font-medium text-sm"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleComplete}
                    className="glass-btn flex-[2] flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm bg-white/5"
                  >
                    <Sparkles size={16} className="text-amber-400" /> Let's Go!
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip option */}
          <button 
            onClick={() => completeOnboarding({ accountType: 'developer' })}
            className="w-full text-center mt-6 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function AppContent() {
  const { completeOnboarding } = useAuth();

  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--global-mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--global-mouse-y', `${e.clientY}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <StartupLoader />
      <Toaster position="bottom-right" />
      <div className="min-h-screen bg-transparent text-white flex flex-col relative overflow-hidden">
        <div className="global-torch"></div>
        <div className="bg-blobs">
          <div className="blob-1"></div>
          <div className="blob-2"></div>
          <div className="blob-3"></div>
        </div>
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/hire" element={<Hire />} />
            <Route path="/hall-of-fame" element={<CompletedProjects />} />
          </Routes>
        </main>
      </div>
      {/* Onboarding Modal — overlays everything after first sign-in */}
      <OnboardingModal />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;
