import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, GitCommit, Users, Star, ArrowUpRight, Activity, Search, UserPlus, X, Save, Mail, MapPin, MessageSquare, Globe, Briefcase, ChevronRight, ChevronLeft, Camera } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TiltCard = ({ children, onClick }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Responsive 3D rotation angles (-14deg to +14deg)
    const rotX = -((y - centerY) / centerY) * 14;
    const rotY = ((x - centerX) / centerX) * 14;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="cursor-pointer w-full h-full select-none"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
        {/* Dynamic Holographic Glare Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2.5rem] transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 55%)`,
            mixBlendMode: 'overlay'
          }}
        />
      </motion.div>
    </div>
  );
};

function isValidUrl(str) {
  if (!str || str.trim() === '') return true;
  try {
    const url = new URL(str.startsWith('http') ? str : `https://${str}`);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

const Profile = () => {
  const { user, updateUser, toggleViewMode } = useAuth();
  const navigate = useNavigate();

  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isEditing, setIsEditing] = useState(() => {
    return new URLSearchParams(window.location.search).get('edit') === 'true' || 
           new URLSearchParams(window.location.search).get('settings') === 'true';
  });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || null);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true' || params.get('settings') === 'true') {
      setIsEditing(true);
    }
  }, [window.location.search]);

  const [stats, setStats] = useState([
    { label: "Reputation Score", value: "950", icon: <Award size={20} className="text-white" />, trend: "+12%" },
    { label: "Projects Completed", value: "8", icon: <Star size={20} className="text-gray-400" />, trend: "+3" },
    { label: "Rooms Joined", value: "24", icon: <Users size={20} className="text-gray-400" />, trend: "+5" },
    { label: "Total Commits", value: "142", icon: <GitCommit size={20} className="text-gray-400" />, trend: "+28" }
  ]);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "Ayush Kumar",
    role: user?.role || "Founder & Lead Developer",
    initials: "AK",
    status: "Available",
    email: user?.email || "kumarayush1312@gmail.com",
    country: user?.country || "India",
    city: user?.city || "Vadodara",
    accountType: user?.accountType || "developer",
    socials: {
      github: user?.socials?.github || "https://github.com/Ayush1312k",
      linkedin: user?.socials?.linkedin || "https://www.linkedin.com/in/ayush-kumar-183304221",
      instagram: "",
      portfolio: user?.socials?.portfolio || "https://github.com/Ayush1312k"
    },
    projects: [
      {
        name: "Vyoma Collaborative IDE",
        role: "Lead Architect",
        tech: "React, Node.js, WebSockets, WebRTC"
      },
      {
        name: "Sanjay AI",
        role: "AI Systems Architect",
        tech: "Python, LLMs, LangChain, FastAPI"
      },
      {
        name: "AuctionEase",
        role: "Full Stack Engineer",
        tech: "React, Node.js, Redis, WebSockets"
      },
      {
        name: "FilterX",
        role: "Lead Developer",
        tech: "TypeScript, Next.js, TailwindCSS, WebGL"
      },
      {
        name: "DeepFake and Fake News Detection System",
        role: "ML & Research Engineer",
        tech: "PyTorch, CNNs, Transformers, Computer Vision, NLP"
      }
    ],
    liveProjects: [
      {
        name: "Collaborative Whiteboard & Canvas",
        role: "Lead Architect",
        roomId: "proj-realtime-canvas",
        techStack: ["React", "TypeScript", "Canvas API", "Socket.io"]
      }
    ],
    completedProjects: [
      {
        name: "Vyoma Real-Time IDE Engine",
        role: "Lead Architect",
        techStack: ["React", "Node.js", "WebSockets", "Monaco Editor"],
        status: "Production Deployed"
      },
      {
        name: "DeepFake and Fake News Detection System",
        role: "ML Researcher",
        techStack: ["PyTorch", "Transformers", "CNNs"],
        status: "Completed & Verified"
      },
      {
        name: "AuctionEase",
        role: "Full Stack Developer",
        techStack: ["React", "Redis", "WebSockets"],
        status: "Production Ready"
      }
    ]
  });

  useEffect(() => {
    fetch(`${API_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.error && Object.keys(data).length > 0) {
        setProfileData(prev => ({
          ...prev,
          ...data,
          socials: { ...prev.socials, ...(data.socials || {}) },
          projects: data.projects?.length ? data.projects : prev.projects
        }));
      }
    })
    .catch(() => {});

    fetch(`${API_URL}/api/users/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.error && data.reputationScore) {
        setStats([
          { label: "Reputation Score", value: data.reputationScore.toString(), icon: <Award size={20} className="text-white" />, trend: "+12%" },
          { label: "Projects Completed", value: (data.projectsCompleted || 8).toString(), icon: <Star size={20} className="text-gray-400" />, trend: "+3" },
          { label: "Rooms Joined", value: (data.roomsJoined || 24).toString(), icon: <Users size={20} className="text-gray-400" />, trend: "+5" },
          { label: "Total Commits", value: (data.totalCommits || 142).toString(), icon: <GitCommit size={20} className="text-gray-400" />, trend: "+28" }
        ]);
      }
    })
    .catch(() => {});

    fetch(`${API_URL}/api/users/discover`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.error && data.users) {
        setAllUsers(data.users.filter(u => u.email !== user?.email));
      }
    })
    .catch(() => {});
  }, [user]);

  const [editForm, setEditForm] = useState({ ...profileData });

  useEffect(() => {
    setEditForm(profileData);
  }, [profileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
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
      
      setProfileData(prev => ({ ...prev, ...editForm }));
      updateUser(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      setProfileData(prev => ({ ...prev, ...editForm }));
      updateUser(editForm);
      setIsEditing(false);
      toast.success('Profile saved locally!');
    }
  };

  const nextCard = () => {
    setDirection(1);
    setCurrentCardIndex((prev) => (prev + 1) % 4);
  };

  const prevCard = () => {
    setDirection(-1);
    setCurrentCardIndex((prev) => (prev - 1 + 4) % 4);
  };

  const cardVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir > 0 ? -15 : 15,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
      rotateY: dir < 0 ? -15 : 15,
      scale: 0.95,
      transition: { duration: 0.4, ease: "easeIn" }
    })
  };

  const filteredNetwork = allUsers.filter(u => 
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl font-sans">
      <div className="flex flex-col gap-12">
        
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">
              Personal Dev Profile
            </h1>
            <p className="text-gray-400 text-sm">
              Logged in as <strong className="text-white">Ayush Kumar</strong> • Permanent Primary Profile
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="glass-btn px-5 py-2.5 rounded-full text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              Edit Details
            </button>
            <button
              onClick={toggleViewMode}
              className="px-5 py-2.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold uppercase tracking-wider hover:bg-amber-500/20 transition-colors"
            >
              Toggle {user?.accountType === 'employer' ? 'Dev' : 'Employer'} View
            </button>
          </div>
        </div>

        {/* 3D Carousel Section */}
        <div className="relative w-full py-8 flex items-center justify-center min-h-[580px]">
          <div className="relative w-[340px] sm:w-[380px] h-[520px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentCardIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <TiltCard onClick={() => setDetailsOpen(true)}>
                  
                  {/* Card 0: Identity */}
                  {currentCardIndex === 0 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
                      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
                      
                      {(profilePhoto || user?.profile_photo || '/ayush_profile.jpg') ? (
                        <img 
                          src={profilePhoto || user?.profile_photo || '/ayush_profile.jpg'} 
                          alt={profileData.name} 
                          className="w-32 h-32 rounded-full object-cover object-top border-2 border-white/30 shadow-2xl mb-6 relative z-10" 
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl mb-6 relative z-10 border border-white/20">
                          {profileData.initials}
                        </div>
                      )}

                      <h2 className="text-3xl font-bold tracking-tight mb-2 uppercase text-white relative z-10">
                        {profileData.name}
                      </h2>
                      <p className="text-gray-300 flex items-center gap-1.5 text-sm mb-4 relative z-10">
                        <Briefcase size={15} className="text-cyan-400" /> {profileData.role}
                      </p>

                      <span className="flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 relative z-10 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        {profileData.status}
                      </span>

                      <div className="flex items-center gap-1.5 text-gray-400 text-xs relative z-10">
                        <MapPin size={13} className="text-cyan-400" /> {profileData.city}, {profileData.country}
                      </div>
                    </div>
                  )}

                  {/* Card 1: Contact */}
                  {currentCardIndex === 1 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] justify-between">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-600"></div>
                      <h2 className="text-2xl font-bold text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">
                        Contact Details
                      </h2>
                      <div className="flex flex-col gap-6 relative z-10 py-4">
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><Mail size={20} className="text-purple-400" /></div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Email</div>
                            <span className="text-sm font-medium text-white">{profileData.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><MapPin size={20} className="text-blue-400" /></div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Location</div>
                            <span className="text-sm font-medium text-white">{profileData.city}, {profileData.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-300">
                          <div className="p-3 bg-white/5 rounded-2xl"><Briefcase size={20} className="text-amber-400" /></div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Specialization</div>
                            <span className="text-sm font-medium text-white">{profileData.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-xs text-gray-500">
                        Verified Primary Account
                      </div>
                    </div>
                  )}

                  {/* Card 2: Featured Projects */}
                  {currentCardIndex === 2 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-y-auto">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600"></div>
                      <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">
                        Core Projects
                      </h2>
                      <div className="flex flex-col gap-3 relative z-10">
                        {profileData.projects.map((proj, i) => (
                          <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="text-sm font-bold text-white mb-1">{proj.name}</div>
                            <div className="text-xs text-cyan-400 mb-1">{proj.role}</div>
                            <div className="text-[10px] text-gray-400">{proj.tech}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Card 3: Social & Links */}
                  {currentCardIndex === 3 && (
                    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] justify-between">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                      <h2 className="text-2xl font-bold text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">
                        Social & Code
                      </h2>
                      <div className="flex justify-center flex-wrap gap-4 py-4 relative z-10">
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
                        {profileData.socials.portfolio && (
                          <a href={profileData.socials.portfolio} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-400 hover:text-black transition-colors border border-white/10" title="Portfolio">
                            <Globe size={24} />
                          </a>
                        )}
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center relative z-10">
                        <div className="text-xs text-gray-400 mb-1">GitHub Profile</div>
                        <div className="text-sm font-bold text-cyan-400">@Ayush1312k</div>
                      </div>
                    </div>
                  )}

                </TiltCard>
              </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${currentCardIndex === i ? 'bg-white w-6' : 'bg-white/30'}`}></div>
              ))}
            </div>
          </div>

          {/* Prev Button */}
          <button 
            onClick={prevCard}
            className="absolute left-4 md:left-12 lg:left-24 w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer z-20"
            title="Previous Card"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button 
            onClick={nextCard}
            className="absolute right-4 md:right-12 lg:right-24 w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer z-20"
            title="Next Card"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="p-6 rounded-3xl glass-panel border border-white/10 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-white/5 rounded-xl group-hover:scale-105 transition-transform">{stat.icon}</div>
                <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Active Live Rooms & Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live Projects Card */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
              Active in Workspace
            </h2>
            <div className="space-y-4">
              {profileData.liveProjects.map((proj, i) => (
                <div key={i} className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {proj.name}
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full border border-green-500/20">Active</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Role: {proj.role}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Tech: {proj.techStack?.join(', ')}</div>
                  </div>
                  <button onClick={() => navigate(`/room/${proj.roomId}`)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-xl transition-colors">
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project History */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
              <Activity size={20} className="text-cyan-400" />
              Completed Hall of Fame Credits
            </h2>
            <div className="space-y-4">
              {profileData.completedProjects.map((proj, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-white">{proj.name}</div>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">{proj.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Role: {proj.role}</div>
                  <div className="text-[10px] text-gray-500 mt-1">Tech: {proj.techStack?.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Find Collaborators Network */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
                <Search size={20} className="text-cyan-400" /> Browse Network Profiles
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Explore demo developers and employers in the network.
              </p>
            </div>
            <div className="relative w-full md:max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, role or username..."
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredNetwork.slice(0, 6).map((u, i) => (
              <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {u.profile_photo ? (
                    <img src={u.profile_photo} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {(u.name || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                      <span>{u.name}</span>
                      {u.isDemo !== false && <span className="text-[8px] px-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase">demo</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{u.role || u.accountType}</div>
                  </div>
                </div>
                <button onClick={() => navigate('/chat')} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors shrink-0" title="Chat">
                  <MessageSquare size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#0f1117]/65 backdrop-blur-2xl" 
              onClick={() => setIsEditing(false)} 
            />
            <div className="absolute w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-30 bg-cyan-500/25" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="glass-panel border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Edit Profile</h2>
                <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-white rounded-full">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Headline / Role</label>
                  <input 
                    type="text" 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">City</label>
                    <input 
                      type="text" 
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Country</label>
                    <input 
                      type="text" 
                      value={editForm.country}
                      onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={editForm.socials.linkedin}
                    onChange={(e) => setEditForm({...editForm, socials: {...editForm.socials, linkedin: e.target.value}})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">GitHub URL</label>
                  <input 
                    type="text" 
                    value={editForm.socials.github}
                    onChange={(e) => setEditForm({...editForm, socials: {...editForm.socials, github: e.target.value}})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs text-gray-400 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="glass-btn px-6 py-2.5 rounded-xl text-white text-xs font-semibold">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
