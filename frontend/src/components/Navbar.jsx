import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Users, User, ChevronDown, Menu, X, MessageSquare, Briefcase, Award, Bell, Eye, ArrowLeftRight, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, toggleViewMode, setAccountType } = useAuth();
  const isEmployer = user?.accountType === 'employer';
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.notifications) setNotifications(data.notifications);
    })
    .catch(() => {});
  }, []);

  const handleReadNotifications = () => {
    if (notifications.some(n => !n.read)) {
      fetch(`${API_URL}/api/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
      }).catch(() => {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return 'AK';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex justify-center px-2.5 sm:px-4">
        <nav
          aria-label="Main navigation"
          className={`pointer-events-auto trioptus-nav-island ${scrolled ? 'scrolled mt-2 sm:mt-2.5 py-1.5 px-2.5 sm:px-4' : 'mt-3 sm:mt-4 py-2 px-3 sm:px-5'} flex items-center justify-between w-full max-w-[1360px] gap-2`}
        >
          {/* Left: Logo Frosted Glass Pill */}
          <Link to="/" className="glass-pill flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 group shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center relative">
              <img 
                src="/logo-mark-cyan.png" 
                alt="Vyoma Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors uppercase font-sans">
                VYOMA
              </span>
              <span className="logo-dot" title="Live Ecosystem" />
            </div>
          </Link>

          {/* Center: Frosted Glass Menu Pills (TriOptus 3D Frosted Effect) */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/projects"
              className={`glass-pill px-3.5 py-1.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
                location.pathname === '/projects' ? 'glass-pill-active' : ''
              }`}
            >
              <Code2 size={14} className="text-cyan-400" />
              <span>Live Rooms</span>
            </Link>

            <Link
              to="/hall-of-fame"
              className={`glass-pill px-3.5 py-1.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
                location.pathname === '/hall-of-fame' ? 'glass-pill-active' : ''
              }`}
            >
              <Award size={14} className="text-yellow-400" />
              <span>Hall of Fame</span>
            </Link>

            <Link
              to="/create"
              className={`glass-pill px-3.5 py-1.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
                location.pathname === '/create' ? 'glass-pill-active' : ''
              }`}
            >
              <Code2 size={14} className="text-purple-400" />
              <span>Workspace</span>
            </Link>

            <Link
              to="/hire"
              className={`glass-pill px-3.5 py-1.5 text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
                location.pathname === '/hire' ? 'glass-pill-active' : ''
              }`}
            >
              {isEmployer ? <Briefcase size={14} className="text-amber-400" /> : <Users size={14} className="text-amber-400" />}
              <span>{isEmployer ? 'Hire Talent' : 'Talent Network'}</span>
            </Link>

            <Link
              to="/chat"
              className={`glass-pill px-3 py-1.5 flex items-center justify-center ${
                location.pathname === '/chat' ? 'glass-pill-active' : ''
              }`}
              title="Messages"
            >
              <MessageSquare size={15} className="text-emerald-400" />
            </Link>
          </div>

          {/* Right: Actions, View Mode Switcher & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Switcher */}
            <button
              onClick={toggleViewMode}
              className="glass-pill px-3 py-1.5 gap-2 text-xs font-semibold hidden md:inline-flex items-center group"
              title="Toggle between Developer and Employer perspective"
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                isEmployer ? 'bg-amber-500/30 text-amber-300' : 'bg-cyan-500/30 text-cyan-300'
              }`}>
                <ArrowLeftRight size={10} className="group-hover:rotate-180 transition-transform duration-300" />
              </div>
              <span className="text-gray-300 text-[11px] font-normal">View:</span>
              <span className={`text-xs font-semibold ${isEmployer ? 'text-amber-300' : 'text-cyan-300'}`}>
                {isEmployer ? 'Employer' : 'Developer'}
              </span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); if (!notifOpen) handleReadNotifications(); }}
                className="glass-pill p-2 text-gray-300 hover:text-white rounded-full transition-colors relative flex items-center justify-center"
                title="Notifications"
              >
                <Bell size={16} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,1)]"></span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-xs sm:w-72 bg-[#0b101c]/95 backdrop-blur-2xl border border-white/20 border-t-white/60 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1.5px_2px_rgba(255,255,255,0.5)] overflow-hidden z-50 flex flex-col max-h-[400px]"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/[0.04] shrink-0">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest">Notifications</h3>
                    </div>
                    <div className="overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center p-4 text-xs text-gray-400">
                          Welcome to Vyoma! You are logged in as Ayush Kumar.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 rounded-2xl mb-1 ${!n.read ? 'bg-white/5' : ''}`}>
                            <p className="text-xs text-gray-300">{n.message}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Section (Ayush Kumar) */}
            <div className="relative">
              <button 
                onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); setMobileMenuOpen(false); }}
                aria-label="User menu"
                aria-expanded={menuOpen}
                className="glass-pill flex items-center gap-1.5 sm:gap-2 pr-2.5 sm:pr-3 pl-1.5 py-1 rounded-full text-gray-200"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-white/30 shadow-inner shrink-0">
                  {(user?.profile_photo || '/ayush_profile.jpg') ? (
                    <img src={user?.profile_photo || '/ayush_profile.jpg'} alt="Profile" className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-gray-200">
                  {user?.name?.split(' ')[0] || 'Ayush'}
                </span>
                <ChevronDown size={13} className={`text-gray-300 transition-transform ${menuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-[#0b101c]/95 backdrop-blur-2xl border border-white/20 border-t-white/60 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1.5px_2px_rgba(255,255,255,0.5)] overflow-hidden z-50 max-h-[calc(100vh-100px)] overflow-y-auto"
                  >
                    {/* User Profile Card Header */}
                    <div className="p-4 border-b border-white/10 bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0">
                          {(user?.profile_photo || '/ayush_profile.jpg') ? (
                            <img src={user?.profile_photo || '/ayush_profile.jpg'} alt="Profile" className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                              {getInitials(user?.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user?.name || 'Ayush Kumar'}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email || 'kumarayush1312@gmail.com'}</p>
                          <p className="text-[10px] text-cyan-400 font-medium truncate mt-0.5">Vadodara, India</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Active Mode</span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isEmployer 
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {isEmployer ? '💼 Employer' : '💻 Developer'}
                        </span>
                      </div>
                    </div>

                    {/* Menu Action Items */}
                    <div className="p-2 space-y-1">
                      {/* View Switcher Button in Menu */}
                      <button
                        onClick={() => {
                          toggleViewMode();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group mb-1.5"
                      >
                        <span className="flex items-center gap-2.5">
                          <ArrowLeftRight size={14} className="text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
                          <span>Switch to {isEmployer ? 'Developer' : 'Employer'} View</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-mono uppercase tracking-wider text-gray-300">
                          Switch
                        </span>
                      </button>

                      {/* 1. My Profile */}
                      <Link 
                        to="/profile" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User size={15} className="text-cyan-400" /> My Profile
                      </Link>

                      {/* 2. Settings */}
                      <Link 
                        to="/profile?settings=true" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings size={15} className="text-gray-400" /> Settings
                      </Link>

                      <div className="my-1.5 border-t border-white/10" />

                      {/* 3. Menu Bar Options */}
                      <Link 
                        to="/projects" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Code2 size={15} className="text-blue-400" /> Live Rooms
                      </Link>
                      <Link 
                        to="/hall-of-fame" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Award size={15} className="text-yellow-400" /> Hall of Fame
                      </Link>
                      <Link 
                        to="/create" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Code2 size={15} className="text-purple-400" /> Workspace
                      </Link>
                      <Link 
                        to="/hire" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {isEmployer ? (
                          <>
                            <Briefcase size={15} className="text-amber-400" /> Hire Talent
                          </>
                        ) : (
                          <>
                            <Users size={15} className="text-amber-400" /> Talent Network
                          </>
                        )}
                      </Link>
                      <Link 
                        to="/chat" 
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <MessageSquare size={15} className="text-emerald-400" /> Messages
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Extender Button */}
            <button 
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMenuOpen(false); setNotifOpen(false); }} 
              aria-label="Toggle menu" 
              aria-expanded={mobileMenuOpen} 
              className="glass-pill lg:hidden p-2 rounded-full text-white transition-colors flex items-center justify-center"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-start pt-20 px-4">
            {/* Backdrop to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative z-10 w-full max-w-sm mx-auto bg-[#0b101c]/95 backdrop-blur-2xl border border-white/20 border-t-white/60 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1.5px_2px_rgba(255,255,255,0.5)] max-h-[calc(100vh-100px)] overflow-y-auto p-4 flex flex-col gap-2"
            >
              {/* Mobile View Toggle */}
              <button
                onClick={() => {
                  toggleViewMode();
                  setMobileMenuOpen(false);
                }}
                className="glass-pill px-4 py-2.5 text-xs font-semibold text-white rounded-2xl text-center bg-amber-500/20 border-amber-500/40 flex items-center justify-center gap-2"
              >
                <ArrowLeftRight size={14} />
                Switch to {isEmployer ? 'Developer' : 'Employer'} View
              </button>

              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center ${
                  location.pathname === '/' ? 'glass-pill-active' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                to="/projects" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/projects' ? 'glass-pill-active' : ''
                }`}
              >
                <Code2 size={14} className="text-cyan-400" /> Live Rooms
              </Link>
              <Link 
                to="/hall-of-fame" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/hall-of-fame' ? 'glass-pill-active' : ''
                }`}
              >
                <Award size={14} className="text-yellow-400" /> Hall of Fame
              </Link>
              <Link 
                to="/create" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/create' ? 'glass-pill-active' : ''
                }`}
              >
                <Code2 size={14} className="text-purple-400" /> Workspace
              </Link>
              <Link 
                to="/hire" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/hire' ? 'glass-pill-active' : ''
                }`}
              >
                {isEmployer ? <Briefcase size={14} className="text-amber-400" /> : <Users size={14} className="text-amber-400" />}
                {isEmployer ? 'Hire Talent' : 'Talent Network'}
              </Link>
              <Link 
                to="/chat" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/chat' ? 'glass-pill-active' : ''
                }`}
              >
                <MessageSquare size={14} className="text-emerald-400" /> Messages
              </Link>
              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className={`glass-pill px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white text-center flex items-center justify-center gap-2 ${
                  location.pathname === '/profile' ? 'glass-pill-active' : ''
                }`}
              >
                <User size={14} className="text-cyan-400" /> My Profile
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
