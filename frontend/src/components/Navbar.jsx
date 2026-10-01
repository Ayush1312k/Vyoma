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

  const islandClass = `glass-pill pointer-events-auto flex items-center transition-all duration-300`;

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-4 left-0 right-0 z-50 flex justify-center items-center pointer-events-none px-4 gap-2 md:gap-3 mx-auto max-w-[1600px]">
        
        {/* Left: Logo Island */}
        <div className={islandClass}>
          <Link to="/" className="flex items-center gap-2.5 px-3 py-1.5 rounded-full group">
            <div className="w-8 h-8 flex items-center justify-center relative">
              <img 
                src="/logo-mark-cyan.png" 
                alt="Vyoma Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="hidden sm:block text-lg font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors uppercase font-sans">
              VYOMA
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (All features visible from start!) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Link
            to="/projects"
            className={`${islandClass} px-4 py-2 text-sm font-medium ${
              location.pathname === '/projects'
                ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-gray-300 hover:text-white hover:border-white/40'
            }`}
          >
            Live Rooms
          </Link>

          <Link
            to="/hall-of-fame"
            className={`${islandClass} px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
              location.pathname === '/hall-of-fame'
                ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-gray-300 hover:text-white hover:border-white/40'
            }`}
          >
            <Award size={15} /> Hall of Fame
          </Link>

          <Link
            to="/create"
            className={`${islandClass} px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
              location.pathname === '/create'
                ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-gray-300 hover:text-white hover:border-white/40'
            }`}
          >
            <Code2 size={15} /> Workspace
          </Link>

          <Link
            to="/hire"
            className={`${islandClass} px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
              location.pathname === '/hire'
                ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-gray-300 hover:text-white hover:border-white/40'
            }`}
          >
            {isEmployer ? <Briefcase size={15} /> : <Users size={15} />}
            {isEmployer ? 'Hire Talent' : 'Talent Network'}
          </Link>

          <Link
            to="/chat"
            className={`${islandClass} px-3.5 py-2 ${
              location.pathname === '/chat'
                ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-gray-300 hover:text-white hover:border-white/40'
            }`}
            title="Messages"
          >
            <MessageSquare size={17} />
          </Link>
        </div>

        {/* View Mode Switcher Island (Requirement 2: See what an employer sees) */}
        <div className="hidden md:flex items-center">
          <button
            onClick={toggleViewMode}
            className={`${islandClass} px-3.5 py-2 gap-2 text-xs font-semibold group`}
            title="Toggle between Developer and Employer perspective"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              isEmployer ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              <ArrowLeftRight size={11} className="group-hover:rotate-180 transition-transform duration-300" />
            </div>
            <span className="text-gray-400 font-normal">View:</span>
            <span className={`font-semibold tracking-wide ${
              isEmployer ? 'text-amber-300' : 'text-cyan-300'
            }`}>
              {isEmployer ? 'Employer' : 'Developer'}
            </span>
          </button>
        </div>

        {/* Right: Notifications & Profile Island */}
        <div className={`${islandClass} p-1.5 gap-1`}>
          {/* Notifications */}
          <div className="relative pointer-events-auto">
            <button 
              onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); if (!notifOpen) handleReadNotifications(); }}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-72 bg-[#12141d]/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-50 pointer-events-auto flex flex-col max-h-[400px]"
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

          {/* Mobile Extender Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            aria-label="Toggle menu" 
            aria-expanded={mobileMenuOpen} 
            className="lg:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Profile Section (Ayush Kumar) */}
          <div className="relative pointer-events-auto">
            <button 
              onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
              aria-label="User menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 pr-2.5 pl-1 py-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-inner shrink-0">
                {(user?.profile_photo || '/ayush_profile.jpg') ? (
                  <img src={user?.profile_photo || '/ayush_profile.jpg'} alt="Profile" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-gray-200">
                {user?.name?.split(' ')[0] || 'Ayush'}
              </span>
              <ChevronDown size={14} className={`text-gray-300 transition-transform ${menuOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="absolute right-0 top-full mt-3 w-80 bg-[#0e1017]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden z-50 pointer-events-auto"
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
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto w-full max-w-sm bg-[#12141d]/85 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              <div className="p-4 flex flex-col gap-2">
                {/* Mobile View Toggle */}
                <button
                  onClick={() => {
                    toggleViewMode();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-xs font-semibold text-white rounded-2xl text-center bg-amber-500/20 border border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight size={14} />
                  Switch to {isEmployer ? 'Developer' : 'Employer'} View
                </button>

                <Link to="/" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Home</Link>
                <Link to="/projects" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Live Rooms</Link>
                <Link to="/hall-of-fame" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Hall of Fame</Link>
                <Link to="/create" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Workspace</Link>
                <Link to="/hire" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">{isEmployer ? 'Hire Talent' : 'Talent Network'}</Link>
                <Link to="/chat" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Messages</Link>
                <Link to="/profile" className="px-4 py-2.5 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">My Profile</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
