import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Users, LogOut, User, ChevronDown, Menu, X, Home, MessageSquare, Briefcase, Award, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isDeveloper = user?.accountType !== 'employer';
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleReadNotifications = () => {
    if (notifications.some(n => !n.read)) {
      fetch(`${API_URL}/api/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
      }).catch(() => {});
      setNotifications(notifications.map(n => ({...n, read: true})));
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

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
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

        {/* Center: Desktop Links Islands (Each is its own island!) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/projects" className={`${islandClass} px-5 py-2.5 text-sm font-medium ${location.pathname === '/projects' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
            Projects
          </Link>
          <Link to="/hall-of-fame" className={`${islandClass} px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 ${location.pathname === '/hall-of-fame' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
            <Award size={16} /> Hall of Fame
          </Link>
          <Link to="/marketplace" className={`${islandClass} px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 ${location.pathname === '/marketplace' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
            <Briefcase size={16} /> Marketplace
          </Link>

          {isAuthenticated && (
            <>
              {isDeveloper && (
                <Link to="/create" className={`${islandClass} px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 ${location.pathname === '/create' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
                  <Code2 size={16} /> Workspace
                </Link>
              )}
              {isDeveloper && (
                <Link to="/hire" className={`${islandClass} px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 ${location.pathname === '/hire' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
                  <Users size={16} /> Talent
                </Link>
              )}
              {!isDeveloper && (
                <Link to="/hire" className={`${islandClass} px-5 py-2.5 text-sm font-medium flex items-center gap-1.5 ${location.pathname === '/hire' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`}>
                  <Briefcase size={16} /> Hire Talent
                </Link>
              )}
              <Link to="/chat" className={`${islandClass} px-4 py-2.5 ${location.pathname === '/chat' ? 'text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-gray-300 hover:text-white hover:border-white/40'}`} title="Messages">
                <MessageSquare size={18} />
              </Link>
            </>
          )}
        </div>

        {/* Right: Profile & Mobile Toggle Island */}
        <div className={`${islandClass} p-1.5 gap-1`}>
          {isAuthenticated && (
            <div className="relative pointer-events-auto mr-1">
              <button 
                onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); if (!notifOpen) handleReadNotifications(); }}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Bell size={18} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-72 bg-[#1a1c24] border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-50 pointer-events-auto flex flex-col max-h-[400px]"
                  >
                    <div className="p-4 border-b border-white/10 bg-[#1e212b] shrink-0">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Notifications</h3>
                    </div>
                    <div className="overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="text-center p-4 text-xs text-gray-500">No new notifications</div>
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
          )}

          {/* Mobile Extender Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" aria-expanded={mobileMenuOpen} className="lg:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors">
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Profile section */}
          {isAuthenticated ? (
            <div className="relative pointer-events-auto">
              <button 
                onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
                aria-label="User menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 pr-2 pl-1 py-1 rounded-full hover:bg-white/10 transition-colors"
              >
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                    {getInitials(user?.name)}
                  </div>
                )}
                <ChevronDown size={14} className={`text-gray-300 transition-transform ${menuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-0 top-full mt-4 w-64 bg-[#1a1c24] backdrop-blur-none border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-50 pointer-events-auto"
                  >
                    <div className="p-4 border-b border-white/10 bg-[#1e212b]">
                      <div className="flex items-center gap-3">
                        {user?.profile_photo ? (
                          <img src={user.profile_photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">✓ Signed In</span>
                        <span className="text-[10px] px-2 py-0.5 bg-white/10 text-gray-300 border border-white/10 rounded-full">
                          {user?.accountType === 'employer' ? '💼 Employer' : '💻 Developer'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-[#1a1c24]">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <MessageSquare size={16} /> Messages
                      </Link>
                      {isDeveloper && (
                        <Link to="/create" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                          <Code2 size={16} /> New Workspace
                        </Link>
                      )}
                      {!isDeveloper && (
                        <Link to="/hire" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                          <Briefcase size={16} /> Hire Talent
                        </Link>
                      )}
                      <Link to="/hall-of-fame" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Award size={16} /> Hall of Fame
                      </Link>
                      <Link to="/marketplace" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                        <Briefcase size={16} /> Marketplace
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth" className="px-5 py-2 text-white uppercase tracking-widest text-xs font-medium rounded-full hover:bg-white/10 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Dropdown Island (Solid Background!) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto w-full max-w-sm bg-[#1a1c24] border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 flex flex-col gap-2">
                <Link to="/" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Home</Link>
                <Link to="/projects" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Projects</Link>
                <Link to="/hall-of-fame" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Hall of Fame</Link>
                <Link to="/marketplace" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Marketplace</Link>

                {isAuthenticated && (
                  <>
                    {isDeveloper && (
                      <Link to="/create" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Workspace</Link>
                    )}
                    {isDeveloper && (
                      <Link to="/hire" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Talent</Link>
                    )}
                    {!isDeveloper && (
                      <Link to="/hire" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Hire Talent</Link>
                    )}
                    <Link to="/chat" className="px-4 py-3 text-sm font-medium text-white rounded-2xl text-center bg-white/5 hover:bg-white/10 transition-colors">Messages</Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
