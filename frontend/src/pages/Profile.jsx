import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, GitCommit, Users, Star, ArrowUpRight, Activity, Search, UserPlus, X, Save, Mail, Phone, MapPin, MessageSquare, Globe, Briefcase, ChevronRight, ChevronLeft, Camera, ShoppingCart } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TiltCard = ({ children, onClick }) => {

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className="cursor-pointer w-full"
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

function isValidUrl(str) {
  if (!str || str.trim() === '') return true; // empty is ok
  try {
    const url = new URL(str);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const Profile = () => {
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || null);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [stats, setStats] = useState([
    { label: "Reputation Score", value: "0", icon: <Award size={20} className="text-white" />, trend: "+0%" },
    { label: "Projects Completed", value: "0", icon: <Star size={20} className="text-gray-400" />, trend: "+0" },
    { label: "Rooms Joined", value: "0", icon: <Users size={20} className="text-gray-400" />, trend: "+0" },
    { label: "Total Commits", value: "0", icon: <GitCommit size={20} className="text-gray-400" />, trend: "+0" }
  ]);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "Loading...",
    role: user?.role || "Developer",
    initials: user?.name ? (user.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "U",
    status: "Available",
    email: user?.email || "",
    country: user?.country || "",
    city: user?.city || "",
    accountType: user?.accountType || "developer",
    socials: {
      github: "",
      linkedin: "",
      instagram: "",
      portfolio: ""
    },
    projects: [],
    liveProjects: [],
    completedProjects: [],
    purchasedProjects: [],
    soldProjects: []
  });

  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (user && isAuthenticated) {
      setProfileData(prev => ({
        ...prev,
        name: user.name,
        initials: (user.name || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        email: user.email,
        country: user.country || prev.country,
        city: user.city || prev.city,
        accountType: user.accountType || prev.accountType,
        role: prev.role === 'Developer' && user.accountType === 'employer' ? 'Employer / Recruiter' : prev.role
      }));
      if (user.profile_photo && !profilePhoto) {
        setProfilePhoto(user.profile_photo);
      }

      fetch(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        signal
      }).then(r => r.json()).then(data => {
        if (!data.error && Object.keys(data).length > 0) {
          setProfileData(prev => ({
            ...prev,
            ...data,
            socials: { ...prev.socials, ...(data.socials || {}) },
            projects: data.projects || prev.projects || [],
          }));
        }
      }).catch(() => {});

      fetch(`${API_URL}/api/users/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        signal
      }).then(r => r.json()).then(data => {
        if (!data.error) {
          setStats([
            { label: "Reputation Score", value: data.reputationScore.toString(), icon: <Award size={20} className="text-white" />, trend: "+5%" },
            { label: "Projects Completed", value: data.projectsCompleted.toString(), icon: <Star size={20} className="text-gray-400" />, trend: "+1" },
            { label: "Rooms Joined", value: data.roomsJoined.toString(), icon: <Users size={20} className="text-gray-400" />, trend: "+1" },
            { label: "Total Commits", value: data.totalCommits?.toString() || "0", icon: <GitCommit size={20} className="text-gray-400" />, trend: "+0" }
          ]);
        }
      }).catch(() => {});

      fetch(`${API_URL}/api/users/discover`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        signal
      }).then(r => r.json()).then(data => {
        if (!data.error && data.users) {
          setAllUsers(data.users.filter(u => u.id !== user.id));
        }
      }).catch(() => {});
    }

    return () => controller.abort();
  }, [user, isAuthenticated]);
  
  const [editForm, setEditForm] = useState({ ...profileData });

  React.useEffect(() => {
    setEditForm(profileData);
  }, [profileData]);

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;
  }
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // Validate social URLs before saving
    const socialFields = ['github', 'linkedin', 'instagram', 'portfolio'];
    for (const field of socialFields) {
      if (!isValidUrl(editForm.socials?.[field])) {
        toast.error(`Invalid URL for ${field}. Please enter a valid http/https URL.`);
        return;
      }
    }
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('da_token')}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (data.token && data.accountType) {
        localStorage.setItem('da_token', data.token);
        updateUser({ accountType: data.accountType });
      }
      
      setProfileData(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const nextCard = (e) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentCardIndex((prev) => (prev + 1) % 4);
  };

  const prevCard = (e) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentCardIndex((prev) => (prev - 1 + 4) % 4);
  };

  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir > 0 ? -10 : 10
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir < 0 ? -10 : 10
    })
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setProfilePhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };



  const searchQueryLower = userSearchQuery.trim().toLowerCase();
  const filteredNetwork = searchQueryLower
    ? allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchQueryLower)) || 
        (u.username && u.username.toLowerCase().includes(searchQueryLower))
      )
    : [];

  return (
    <div className="min-h-screen bg-transparent text-white pt-12 pb-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        
        {/* 3D Tilted Profile Cards Carousel */}
        <div className="mb-24 flex flex-col items-center justify-center relative w-full">
          <div className="relative w-full max-w-[340px] h-[520px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentCardIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute inset-0"
              >
                <TiltCard>
                  {currentCardIndex === 0 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
                      
                      <div 
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-800 to-black border-2 border-white/20 flex items-center justify-center text-5xl font-bold shadow-xl mb-8 relative z-10 overflow-hidden group cursor-pointer"
                        onClick={() => document.getElementById('photo-upload').click()}
                        title="Upload Photo"
                      >
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          profileData.initials
                        )}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs mt-1 text-white">Change</span>
                        </div>
                        <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </div>
                      <h1 className="text-3xl font-bold tracking-tight mb-3 uppercase text-white relative z-10">{profileData.name}</h1>
                      <p className="text-gray-400 flex items-center gap-2 text-sm mb-6 relative z-10">
                        <Briefcase size={16} /> {profileData.role}
                      </p>
                      <span className="text-green-400 flex items-center gap-1 text-sm bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 relative z-10">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> {profileData.status}
                      </span>
                      
                      <button onClick={(e) => { e.stopPropagation(); setEditForm(profileData); setIsEditing(true); }} className="glass-btn mt-8 px-6 py-2.5 text-white text-xs font-bold uppercase tracking-widest relative z-10">
                        Edit Profile
                      </button>
                    </div>
                  )}

                  {currentCardIndex === 1 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-600"></div>
                      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
                      
                      <h2 className="text-2xl font-bold mb-10 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Contact Info</h2>
                      <div className="flex flex-col gap-8 relative z-10 flex-grow justify-center">
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><Mail size={20} className="text-purple-400" /></div>
                          <span className="text-sm">{profileData.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><Phone size={20} className="text-pink-400" /></div>
                          <span className="text-sm text-gray-500">Not provided</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><MapPin size={20} className="text-blue-400" /></div>
                          <span className="text-sm">{profileData.city && profileData.country ? `${profileData.city}, ${profileData.country}` : profileData.country || profileData.city || <span className="text-gray-500">Not provided</span>}</span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><Briefcase size={20} className="text-amber-400" /></div>
                          <span className="text-sm">{profileData.accountType === 'employer' ? 'Employer / Recruiter' : 'Developer'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentCardIndex === 2 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>
                      
                      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Top Projects</h2>
                      <div className="flex flex-col gap-4 relative z-10 overflow-y-auto pr-2 pb-4">
                        {profileData.projects.length > 0 ? profileData.projects.map((proj, i) => (
                          proj.link ? (
                            <a key={i} href={proj.link} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all group block shrink-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm text-white font-bold mb-1 group-hover:text-amber-400 transition-colors">{proj.name}</div>
                                  <div className="text-xs text-gray-400">{proj.role}</div>
                                </div>
                                <ArrowUpRight size={16} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
                              </div>
                            </a>
                          ) : (
                            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl opacity-80 cursor-default shrink-0">
                              <div className="text-sm text-gray-200 font-bold mb-1">{proj.name}</div>
                              <div className="text-xs text-gray-400">{proj.role}</div>
                            </div>
                          )
                        )) : (
                          <div className="text-center text-gray-500 mt-10 text-sm">No projects added yet. Edit your profile to add some!</div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentCardIndex === 3 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Social & Code</h2>
                      <div className="flex justify-center flex-wrap gap-4 mb-8 relative z-10">
                        {profileData.socials.github && (
                          <a href={profileData.socials.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-white hover:text-black transition-colors border border-white/10" title="GitHub">
                            <GithubIcon size={24} />
                          </a>
                        )}
                        {profileData.socials.linkedin && (
                          <a href={profileData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-blue-500 hover:text-white transition-colors border border-white/10" title="LinkedIn">
                            <Briefcase size={24} />
                          </a>
                        )}
                        {profileData.socials.instagram && (
                          <a href={profileData.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-pink-500 hover:text-white transition-colors border border-white/10" title="Instagram">
                            <Camera size={24} />
                          </a>
                        )}
                        {profileData.socials.portfolio && (
                          <a href={profileData.socials.portfolio} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-400 hover:text-black transition-colors border border-white/10" title="Portfolio">
                            <Globe size={24} />
                          </a>
                        )}
                      </div>
                      <div className="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col items-center gap-3 relative z-10 mt-auto mb-8">
                        <GithubIcon size={32} className="text-gray-400" />
                        <div className="text-center">
                          <div className="text-sm font-bold text-white mb-1">
                            {profileData.socials.github ? '@' + profileData.socials.github.split('/').pop() : 'No GitHub Connected'}
                          </div>
                          <div className="text-xs text-gray-500">View Repositories</div>
                        </div>
                      </div>
                    </div>
                  )}
                </TiltCard>
              </motion.div>
            </AnimatePresence>
            
            {/* Card Indicators */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${currentCardIndex === i ? 'bg-white w-6' : 'bg-white/30'}`}></div>
              ))}
            </div>
          </div>

          {/* Prev Card Button */}
          <button 
            onClick={prevCard}
            className="absolute -bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-1/3 md:left-8 lg:left-16 w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] z-30 group cursor-pointer"
            title="Previous Card"
          >
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Next Card Button */}
          <button 
            onClick={nextCard}
            className="absolute -bottom-20 md:bottom-auto md:top-1/2 md:-translate-y-1/2 right-1/3 md:right-8 lg:right-16 w-14 h-14 md:w-16 md:h-16 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] z-30 group cursor-pointer"
            title="Next Card"
          >
            <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl glass-panel group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">{stat.icon}</div>
                <span className="text-xs font-medium text-white/60 bg-white/5 px-2 py-1 rounded-full flex items-center gap-1 group-hover:bg-white/20 transition-colors">
                  <ArrowUpRight size={12} /> {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Find People Network */}
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-white/20"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 shrink-0">
                  <Search size={20} /> Find People
                </h2>
                <div className="relative w-full md:max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or @username..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Search the network to discover other developers, connect, and collaborate.
              </p>
              <div className="space-y-4">
                {userSearchQuery.trim() && filteredNetwork.map((profile, i) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={i} 
                    className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium border border-gray-700">
                        {profile.name ? profile.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {profile.name} <span className="text-gray-500 text-xs ml-1">@{profile.username || 'user'}</span>
                        </h4>
                        <p className="text-xs text-gray-500">{profile.accountType === 'employer' ? 'Employer' : 'Developer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate('/chat')} className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 bg-blue-500/10 border border-blue-500/20 rounded-lg transition-colors shrink-0" title="Message">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => toast.success(`Connection request sent to ${profile.name}`)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg transition-colors shrink-0" title="Connect">
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {userSearchQuery.trim() && filteredNetwork.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No users found matching "{userSearchQuery}".
                  </div>
                )}
                {!userSearchQuery.trim() && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Type a name or username to start searching.
                  </div>
                )}
              </div>
            </div>

            {/* Live Projects Card */}
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Live Projects
              </h2>
              <div className="space-y-4">
                {profileData.liveProjects && profileData.liveProjects.length > 0 ? (
                  profileData.liveProjects.map((proj, i) => (
                    <div key={i} className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {proj.name}
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full border border-green-500/20">Live</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Role: {proj.role} • Room #{proj.roomId}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Tech: {proj.techStack?.join(', ')}</div>
                      </div>  
                      <ArrowUpRight size={16} className="text-green-400" />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">Not currently working in any live rooms.</div>
                )}
              </div>
            </div>

            {/* Vyoma Project History */}
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 to-white/20"></div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity size={20} /> Project History
              </h2>
              <div className="space-y-4">
                {profileData.completedProjects && profileData.completedProjects.length > 0 ? (
                  profileData.completedProjects.map((proj, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">{proj.name}</div>
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{proj.status || 'Completed'}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Role: {proj.role}</div>
                      <div className="text-[10px] text-gray-500 mt-1">Tech: {proj.techStack?.join(', ')}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No completed projects yet. Join a workspace to build something!</div>
                )}
              </div>
            </div>
            
            {/* Purchased Projects */}
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-400" /> Purchased Assets
              </h2>
              <div className="space-y-4">
                {profileData.purchasedProjects && profileData.purchasedProjects.length > 0 ? (
                  profileData.purchasedProjects.map((proj, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">{proj.name}</div>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">${proj.price}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">From: {proj.seller}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(proj.date).toLocaleDateString()} • {proj.type === 'auction' ? 'Auction Won' : 'Fixed Price'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">You haven't purchased any projects yet.</div>
                )}
              </div>
            </div>

            {/* Sold Projects */}
            <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Award size={20} className="text-purple-400" /> Sold Assets
              </h2>
              <div className="space-y-4">
                {profileData.soldProjects && profileData.soldProjects.length > 0 ? (
                  profileData.soldProjects.map((proj, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">{proj.name}</div>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">+${proj.price}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">To: {proj.buyer}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{new Date(proj.date).toLocaleDateString()} • {proj.type === 'auction' ? 'Auction Ended' : 'Fixed Price'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">You haven't sold any projects yet.</div>
                )}
              </div>
            </div>

          </div>


        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#050505] border border-white/20 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl glass-panel flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="p-2 bg-[#111] hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="overflow-y-auto pr-2 -mr-2 pb-4">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Professional Role</label>
                  <input 
                    type="text" 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Initials</label>
                    <input 
                      type="text" 
                      value={editForm.initials}
                      maxLength={2}
                      onChange={(e) => setEditForm({...editForm, initials: e.target.value.toUpperCase()})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <select 
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Account Type</label>
                  <select 
                    value={editForm.accountType}
                    onChange={(e) => setEditForm({...editForm, accountType: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  >
                    <option value="developer">Developer (Build & Code)</option>
                    <option value="employer">Recruiter (Hire Talent)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Country</label>
                    <input 
                      type="text" 
                      value={editForm.country || ''}
                      onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                      placeholder="e.g. India"
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
                    <input 
                      type="text" 
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Social Links</h3>
                  <div className="space-y-3">
                    <input type="text" value={editForm.socials.github} onChange={e => setEditForm({...editForm, socials: {...editForm.socials, github: e.target.value}})} placeholder="GitHub Profile URL" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
                    <input type="text" value={editForm.socials.linkedin} onChange={e => setEditForm({...editForm, socials: {...editForm.socials, linkedin: e.target.value}})} placeholder="LinkedIn Profile URL" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
                    <input type="text" value={editForm.socials.instagram} onChange={e => setEditForm({...editForm, socials: {...editForm.socials, instagram: e.target.value}})} placeholder="Instagram URL" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
                    <input type="text" value={editForm.socials.portfolio} onChange={e => setEditForm({...editForm, socials: {...editForm.socials, portfolio: e.target.value}})} placeholder="Personal Portfolio URL" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Top Projects</h3>
                  <div className="space-y-4">
                    {editForm.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <input type="text" value={proj.name} onChange={e => { const newP = [...editForm.projects]; newP[idx].name = e.target.value; setEditForm({...editForm, projects: newP})}} placeholder="Project Name" className="w-full bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30" />
                        <div className="flex gap-2">
                          <input type="text" value={proj.role} onChange={e => { const newP = [...editForm.projects]; newP[idx].role = e.target.value; setEditForm({...editForm, projects: newP})}} placeholder="Your Role" className="w-1/2 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30" />
                          <input type="text" value={proj.link} onChange={e => { const newP = [...editForm.projects]; newP[idx].link = e.target.value; setEditForm({...editForm, projects: newP})}} placeholder="Project URL (Optional)" className="w-1/2 bg-transparent border-b border-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="glass-btn w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-medium">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
