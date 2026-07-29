import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, Briefcase, Code2, Globe, Star, ArrowUpRight, X, Users, Eye, Mail, Phone, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';



const TiltCard = ({ children }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  return (
    <motion.div style={{ perspective: 1000 }} className="w-full">
      <motion.div animate={{ rotateX, rotateY }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </motion.div>
    </motion.div>
  );
};

const ProfileCarouselModal = ({ profile, user, onClose }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const next = () => { setDir(1); setCardIndex(p => (p + 1) % 4); };
  const prev = () => { setDir(-1); setCardIndex(p => (p - 1 + 4) % 4); };
  const variants = {
    enter: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0, rotateY: d > 0 ? -10 : 10 }),
    center: { zIndex: 1, x: 0, opacity: 1, rotateY: 0 },
    exit: (d) => ({ zIndex: 0, x: d < 0 ? 100 : -100, opacity: 0, rotateY: d < 0 ? -10 : 10 })
  };

  const handleHireClick = async (e, type) => {
    e.stopPropagation();
    if (user?.accountType !== 'employer') {
      toast.error("You need to change your account to 'Hire' to recruit developers!", { icon: '⚠️' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/hire`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('da_token')}` 
        },
        body: JSON.stringify({ targetUserId: profile.id, type })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Hire request sent to ${profile.name}!`, { icon: '✉️' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cards = [
    // Card 0: Avatar + Name
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 to-blue-600"></div>
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold shadow-xl mb-8 relative z-10">{profile.initials}</div>
      <h1 className="text-3xl font-bold tracking-tight mb-3 uppercase text-white relative z-10">{profile.name}</h1>
      <p className="text-gray-400 flex items-center gap-2 text-sm mb-4 relative z-10"><Briefcase size={16} /> {profile.role}</p>
      <span className={`flex items-center gap-1 text-sm px-4 py-1.5 rounded-full border relative z-10 ${profile.status === 'Available' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'}`}>
        <span className={`w-2 h-2 rounded-full ${profile.status === 'Available' ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></span> {profile.status}
      </span>
      <div className="flex items-center gap-1.5 mt-4 text-gray-500 text-sm relative z-10"><MapPin size={14} /> {profile.city}, {profile.country}</div>
    </div>,
    // Card 1: Contact Info
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-600"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
      <h2 className="text-2xl font-bold mb-10 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Contact Info</h2>
      <div className="flex flex-col gap-8 relative z-10 flex-grow justify-center">
        <div className="flex items-center gap-4 text-gray-300"><div className="p-3 bg-white/5 rounded-2xl"><Mail size={20} className="text-purple-400" /></div><span className="text-sm">{profile.email}</span></div>
        <div className="flex items-center gap-4 text-gray-300"><div className="p-3 bg-white/5 rounded-2xl"><MapPin size={20} className="text-blue-400" /></div><span className="text-sm">{profile.city}, {profile.country}</span></div>
        <div className="flex items-center gap-4 text-gray-300"><div className="p-3 bg-white/5 rounded-2xl"><Briefcase size={20} className="text-amber-400" /></div><span className="text-sm">{profile.role}</span></div>
      </div>
    </div>,
    // Card 2: Projects
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600"></div>
      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Projects</h2>
      <div className="flex flex-col gap-4 relative z-10">
        {profile.projects.map((proj, i) => (
          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-sm text-white font-bold mb-1">{proj.name}</div>
            <div className="text-xs text-gray-400">{proj.role} • {proj.tech}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 relative z-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Domains</h3>
        <div className="flex flex-wrap gap-2">
          {profile.domains.map(d => <span key={d} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px]">{d}</span>)}
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {profile.techStack.map(t => <span key={t} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px]">{t}</span>)}
        </div>
      </div>
    </div>,
    // Card 3: Social & Code
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Social & Code</h2>
      <div className="flex justify-center flex-wrap gap-4 mb-8 relative z-10">
        {profile.socials?.github && <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-white hover:text-black transition-colors border border-white/10" title="GitHub"><GithubIcon size={24} /></a>}
        {profile.socials?.linkedin && <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-blue-500 hover:text-white transition-colors border border-white/10" title="LinkedIn"><Briefcase size={24} /></a>}
        {profile.socials?.instagram && <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-pink-500 hover:text-white transition-colors border border-white/10" title="Instagram"><Camera size={24} /></a>}
        {profile.socials?.portfolio && <a href={profile.socials.portfolio} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-400 hover:text-black transition-colors border border-white/10" title="Portfolio"><Globe size={24} /></a>}
        {!profile.socials?.github && !profile.socials?.linkedin && !profile.socials?.instagram && !profile.socials?.portfolio && <div className="text-sm text-gray-500">No social links provided</div>}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
        <button onClick={(e) => handleHireClick(e, 'job')} className="glass-btn py-3 text-white font-bold text-sm relative hover:bg-white/10 transition-colors">
          Hire for Job
        </button>
        <button onClick={(e) => handleHireClick(e, 'freelance')} className="glass-btn py-3 text-gray-300 font-bold text-sm relative hover:bg-white/10 transition-colors">
          Freelance Offer
        </button>
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 flex items-center gap-4 md:gap-8">
        <button onClick={prev} className="w-12 h-12 md:w-14 md:h-14 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shrink-0"><ChevronLeft size={24} /></button>
        <div className="relative w-[320px] h-[520px]">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={cardIndex} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 300, damping: 25 }} className="absolute inset-0">
              <TiltCard>{cards[cardIndex]}</TiltCard>
            </motion.div>
          </AnimatePresence>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
            {[0,1,2,3].map(i => <div key={i} className={`w-2 h-2 rounded-full transition-all ${cardIndex === i ? 'bg-white w-6' : 'bg-white/30'}`}></div>)}
          </div>
        </div>
        <button onClick={next} className="w-12 h-12 md:w-14 md:h-14 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shrink-0"><ChevronRight size={24} /></button>
      </div>
      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"><X size={20} className="text-white" /></button>
    </div>
  );
};

const Hire = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/auth');
  }, [isAuthenticated, authLoading, navigate]);

  React.useEffect(() => {
    const controller = new AbortController();
    if (isAuthenticated) {
      fetch(`${API_URL}/api/users/discover`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        signal: controller.signal
      })
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          const formattedUsers = data.users.map(u => {
            const prof = u.profile || {};
            return {
              id: u.id,
              name: u.name,
              role: prof.role || (u.accountType === 'employer' ? 'Employer' : 'Developer'),
              country: u.country || prof.country || 'Unknown',
              city: u.city || prof.city || 'Unknown',
              domains: prof.role ? [prof.role] : [],
              techStack: prof.projects?.flatMap(p => p.tech?.split(',').map(s=>s.trim()) || []) || [],
              projects: prof.projects || [],
              initials: u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U',
              status: prof.status || 'Available',
              email: u.email,
              socials: prof.socials || {}
            };
          });
          setProfiles(formattedUsers);
        } else {
          setProfiles([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProfiles([]);
        setLoading(false);
      });
    }
    return () => controller.abort();
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated || loading) {
    return <div className="min-h-screen flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;
  }

  const filteredProfiles = profiles.filter(p => {
    if (selectedDomain && !p.domains.some(d => d.toLowerCase().includes(selectedDomain.toLowerCase())) && !p.role.toLowerCase().includes(selectedDomain.toLowerCase())) return false;
    if (selectedCountry && !p.country.toLowerCase().includes(selectedCountry.toLowerCase())) return false;
    if (cityInput && !p.city.toLowerCase().includes(cityInput.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Discover Talent<span className="text-amber-400">.</span></h1>
          <p className="text-gray-400 text-lg max-w-xl">Find skilled developers and professionals from around the world. Click on any profile to explore their full card.</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4"><Filter size={18} className="text-amber-400" /><span className="text-sm font-bold text-gray-300 uppercase tracking-widest">Filter Developers</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Domain / Skill</label>
              <input type="text" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} placeholder="Type domain e.g. Frontend Developer..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Country</label>
              <input type="text" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} placeholder="Type country e.g. India..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">City</label>
              <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="Type city name..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
          </div>
          {(selectedDomain || selectedCountry || cityInput) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {selectedDomain && <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs flex items-center gap-1"><Briefcase size={12} /> {selectedDomain}<button onClick={() => setSelectedDomain('')} className="ml-1 hover:text-white"><X size={12} /></button></span>}
              {selectedCountry && <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs flex items-center gap-1"><Globe size={12} /> {selectedCountry}<button onClick={() => setSelectedCountry('')} className="ml-1 hover:text-white"><X size={12} /></button></span>}
              {cityInput && <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs flex items-center gap-1"><MapPin size={12} /> {cityInput}<button onClick={() => setCityInput('')} className="ml-1 hover:text-white"><X size={12} /></button></span>}
              <button onClick={() => { setSelectedDomain(''); setSelectedCountry(''); setCityInput(''); }} className="text-xs text-gray-500 hover:text-white transition-colors">Clear All</button>
            </div>
          )}
        </motion.div>

        <div className="mb-6 text-sm text-gray-400">Found <span className="text-white font-bold">{filteredProfiles.length}</span> professional{filteredProfiles.length !== 1 ? 's' : ''}</div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile, i) => (
            <motion.div key={profile.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all group cursor-pointer" onClick={() => setSelectedProfile(profile)}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shrink-0">{profile.initials}</div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold truncate group-hover:text-blue-400 transition-colors">{profile.name}</h3>
                  <p className="text-xs text-gray-400">{profile.role}</p>
                  <div className="flex items-center gap-1.5 mt-1"><MapPin size={10} className="text-gray-500" /><span className="text-[10px] text-gray-500">{profile.city}, {profile.country}</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${profile.status === 'Available' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{profile.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.techStack.slice(0, 4).map(t => <span key={t} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-gray-300">{t}</span>)}
              </div>
              {profile.projects[0] && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Recent Project</div>
                  <div className="text-xs text-white font-medium">{profile.projects[0].name}</div>
                  <div className="text-[10px] text-gray-400">{profile.projects[0].role} • {profile.projects[0].tech}</div>
                </div>
              )}
              <div className="mt-4 text-center text-xs text-gray-500 group-hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                <Eye size={14} /> View Full Profile Cards
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto mb-4 text-gray-700" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {profiles.length === 0 ? 'No developers found yet' : 'No profiles match your filters'}
            </h3>
            <p className="text-sm text-gray-600">
              {profiles.length === 0 ? 'Be the first to join! Complete your profile to appear here.' : 'Try adjusting your domain, country, or city filters'}
            </p>
          </div>
        )}
      </div>

      {/* Full Profile Card Carousel Modal */}
      <AnimatePresence>
        {selectedProfile && <ProfileCarouselModal profile={selectedProfile} user={user} onClose={() => setSelectedProfile(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default Hire;
