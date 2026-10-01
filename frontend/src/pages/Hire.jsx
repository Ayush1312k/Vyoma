import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, Briefcase, Code2, Globe, Star, ArrowUpRight, X, Users, Eye, Mail, Building, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

export const INITIAL_PROFILES = [
  {
    id: 'f4c547aa-2381-40e8-8d7c-3f997dd78730',
    name: 'Ayush Kumar',
    role: 'Founder & Full Stack Lead',
    accountType: 'developer',
    country: 'India',
    city: 'Vadodara',
    avatar: '/ayush_profile.jpg',
    initials: 'AK',
    domains: ['Full Stack Engineer', 'System Architecture', 'Real-Time Web'],
    techStack: ['React', 'Node.js', 'WebSockets', 'WebRTC', 'Vite', 'PostgreSQL'],
    projects: [
      { name: 'Vyoma Collaborative IDE', role: 'Lead Architect', tech: 'React, Node.js, WebSockets, WebRTC' },
      { name: 'Sanjay AI', role: 'AI Systems Architect', tech: 'Python, LLMs, LangChain, FastAPI' },
      { name: 'AuctionEase', role: 'Full Stack Engineer', tech: 'React, Node.js, Redis, WebSockets' },
      { name: 'FilterX', role: 'Lead Developer', tech: 'TypeScript, Next.js, TailwindCSS, WebGL' },
      { name: 'DeepFake and Fake News Detection System', role: 'ML & Research Engineer', tech: 'PyTorch, CNNs, Transformers, CV, NLP' }
    ],
    status: 'Available',
    email: 'kumarayush1312@gmail.com',
    socials: {
      github: 'https://github.com/Ayush1312k',
      linkedin: 'https://www.linkedin.com/in/ayush-kumar-183304221',
      portfolio: 'https://github.com/Ayush1312k'
    },
    isDemo: false
  },
  {
    id: 'demo-user-sarah',
    name: 'Sarah Chen',
    role: 'Lead Frontend Architect',
    accountType: 'developer',
    country: 'Singapore',
    city: 'Singapore',
    avatar: '/demo-avatars/pro_avatar5.jpg',
    initials: 'SC',
    domains: ['Frontend Engineer', 'UI Architecture', 'Canvas & WebGL'],
    techStack: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'WebGL', 'Framer Motion'],
    projects: [
      { name: 'Collaborative Whiteboard', role: 'Lead UI Developer', tech: 'React, TypeScript, Canvas API' },
      { name: 'Fluid Design System', role: 'Design Systems Architect', tech: 'TailwindCSS, Radix UI' }
    ],
    status: 'Available',
    email: 'sarah.chen@demo.vyoma.dev',
    socials: {
      github: 'https://github.com/demo-sarahchen',
      linkedin: 'https://linkedin.com/in/demo-sarahchen'
    },
    isDemo: true
  },
  {
    id: 'demo-user-marcus',
    name: 'Marcus Vance',
    role: 'Senior Systems & Cloud Engineer',
    accountType: 'developer',
    country: 'Germany',
    city: 'Berlin',
    avatar: '/demo-avatars/pro_avatar4.jpg',
    initials: 'MV',
    domains: ['Systems Engineer', 'Cloud Infrastructure', 'Distributed Databases'],
    techStack: ['Rust', 'Go', 'Kubernetes', 'Docker', 'Raft', 'gRPC'],
    projects: [
      { name: 'HyperGraph Distributed KV Store', role: 'Core Systems Lead', tech: 'Rust, Raft, gRPC' },
      { name: 'Mesh Controller', role: 'DevOps Lead', tech: 'Kubernetes, Go, Prometheus' }
    ],
    status: 'Available',
    email: 'marcus.vance@demo.vyoma.dev',
    socials: {
      github: 'https://github.com/demo-marcusvance',
      linkedin: 'https://linkedin.com/in/demo-marcusvance'
    },
    isDemo: true
  },
  {
    id: 'demo-user-david',
    name: 'David Rossi',
    role: 'Full Stack & Web3 Developer',
    accountType: 'developer',
    country: 'Italy',
    city: 'Milan',
    avatar: '/demo-avatars/pro_avatar3.jpg',
    initials: 'DR',
    domains: ['Full Stack Developer', 'Smart Contracts', 'API Architecture'],
    techStack: ['Node.js', 'Solidity', 'TypeScript', 'PostgreSQL', 'GraphQL', 'Next.js'],
    projects: [
      { name: 'Decentralized Escrow Protocol', role: 'Smart Contract Lead', tech: 'Solidity, TypeScript, Node.js' },
      { name: 'Real-Time Bid Auction', role: 'Full Stack Dev', tech: 'Express, React, Redis' }
    ],
    status: 'Busy',
    email: 'david.rossi@demo.vyoma.dev',
    socials: {
      github: 'https://github.com/demo-davidrossi',
      linkedin: 'https://linkedin.com/in/demo-davidrossi'
    },
    isDemo: true
  },
  {
    id: 'demo-user-alex',
    name: 'Alexander Wright',
    role: 'AI & ML Systems Engineer',
    accountType: 'developer',
    country: 'United Kingdom',
    city: 'London',
    avatar: '/demo-avatars/pro_avatar3.jpg',
    initials: 'AW',
    domains: ['Machine Learning', 'Autonomous Agents', 'FastAPI'],
    techStack: ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Docker', 'Vector Embeddings'],
    projects: [
      { name: 'NeuroFlow Code Reviewer', role: 'AI Systems Lead', tech: 'Python, PyTorch, LangChain, FastAPI' },
      { name: 'Semantic Search Embeddings Engine', role: 'ML Engineer', tech: 'HNSWlib, PyTorch, Docker' }
    ],
    status: 'Available',
    email: 'alexander.wright@demo.vyoma.dev',
    socials: {
      github: 'https://github.com/demo-alexwright',
      linkedin: 'https://linkedin.com/in/demo-alexwright'
    },
    isDemo: true
  },
  {
    id: 'demo-user-elena',
    name: 'Elena Rostova',
    role: 'Staff Security & eBPF Architect',
    accountType: 'developer',
    country: 'Estonia',
    city: 'Tallinn',
    avatar: '/demo-avatars/pro_avatar2.jpg',
    initials: 'ER',
    domains: ['Cloud Security', 'Linux Kernel', 'DevSecOps'],
    techStack: ['Rust', 'Linux Kernel', 'eBPF', 'Terraform', 'AWS', 'Zero-Trust'],
    projects: [
      { name: 'Zero-Trust Cloud Mesh', role: 'Security Architect', tech: 'Rust, Linux Kernel, eBPF' },
      { name: 'Real-Time Packet Monitor', role: 'Kernel Dev', tech: 'C, eBPF, Prometheus' }
    ],
    status: 'Available',
    email: 'elena.rostova@demo.vyoma.dev',
    socials: {
      github: 'https://github.com/demo-elenarostova',
      linkedin: 'https://linkedin.com/in/demo-elenarostova'
    },
    isDemo: true
  },
  // Employers Demo Profiles (Requirement 8)
  {
    id: 'demo-employer-vikram',
    name: 'Vikram Malhotra',
    role: 'Head of Engineering Talent',
    company: 'Apex Quantum Labs',
    accountType: 'employer',
    country: 'India',
    city: 'Bengaluru',
    avatar: '/demo-avatars/pro_avatar1.jpg',
    initials: 'VM',
    domains: ['Tech Recruiting', 'Engineering Leadership', 'Distributed Systems Talent'],
    techStack: ['Distributed Systems', 'Cloud Scale', 'Rust', 'Full Stack Talent'],
    openRoles: 'Senior Full Stack Engineers, Rust Systems Leads, Frontend Specialists',
    projects: [
      { name: 'Apex Distributed Computing Expansion', role: 'Hiring Lead', tech: 'Talent Acquisition, Scale' }
    ],
    status: 'Actively Hiring',
    email: 'vikram.malhotra@apexlabs-demo.com',
    socials: {
      linkedin: 'https://linkedin.com/in/demo-vikrammalhotra'
    },
    isDemo: true
  },
  {
    id: 'demo-employer-rachel',
    name: 'Rachel Sterling',
    role: 'VP of Talent Acquisition',
    company: 'Synthetix AI Ventures',
    accountType: 'employer',
    country: 'United States',
    city: 'San Francisco',
    avatar: '/demo-avatars/pro_avatar2.jpg',
    initials: 'RS',
    domains: ['AI Talent Recruitment', 'Executive Search', 'Deep Tech Hiring'],
    techStack: ['AI Research', 'Real-Time WebRTC', 'Autonomous Agents'],
    openRoles: 'Machine Learning Engineers, Senior Systems Architects, UI Specialists',
    projects: [
      { name: 'Synthetix AI Scale Initiative', role: 'VP Talent', tech: 'AI Acceleration & Hiring' }
    ],
    status: 'Actively Hiring',
    email: 'rachel.sterling@synthetix-demo.com',
    socials: {
      linkedin: 'https://linkedin.com/in/demo-rachelsterling'
    },
    isDemo: true
  }
];

const TiltCard = ({ children }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.16
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
      className="w-full h-full select-none cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2.5rem] transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 55%)`,
          }}
        />
      </motion.div>
    </div>
  );
};

const ProfileCarouselModal = ({ profile, onClose }) => {
  const [cardIndex, setCardIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const next = () => { setDir(1); setCardIndex(p => (p + 1) % 4); };
  const prev = () => { setDir(-1); setCardIndex(p => (p - 1 + 4) % 4); };
  const variants = {
    enter: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0, rotateY: d > 0 ? -10 : 10 }),
    center: { zIndex: 1, x: 0, opacity: 1, rotateY: 0 },
    exit: (d) => ({ zIndex: 0, x: d < 0 ? 100 : -100, opacity: 0, rotateY: d < 0 ? -10 : 10 })
  };

  const handleActionClick = (e, type) => {
    e.stopPropagation();
    toast.success(`Connection request sent to ${profile.name}!`, { icon: '✉️' });
  };

  const isEmp = profile.accountType === 'employer';

  const cards = [
    // Card 0: Avatar + Name
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isEmp ? 'from-amber-400 to-orange-500' : 'from-cyan-400 to-blue-600'}`}></div>
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]"></div>
      
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-2 border-white/30 shadow-2xl mb-6 relative z-10" />
      ) : (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold shadow-xl mb-6 relative z-10">
          {profile.initials}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 relative z-10">
        <h1 className="text-3xl font-bold tracking-tight uppercase text-white">{profile.name}</h1>
        {profile.isDemo && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
            demo
          </span>
        )}
      </div>

      <p className="text-gray-300 flex items-center gap-2 text-sm mb-2 relative z-10">
        {isEmp ? <Building size={16} className="text-amber-400" /> : <Briefcase size={16} className="text-cyan-400" />}
        {profile.company ? `${profile.role} at ${profile.company}` : profile.role}
      </p>

      <span className={`flex items-center gap-1.5 text-xs px-3.5 py-1 rounded-full border relative z-10 mb-4 ${
        profile.status === 'Available' || profile.status === 'Actively Hiring'
          ? 'text-green-400 bg-green-500/10 border-green-500/20'
          : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      }`}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> {profile.status}
      </span>

      <div className="flex items-center gap-1.5 text-gray-400 text-xs relative z-10">
        <MapPin size={13} /> {profile.city}, {profile.country}
      </div>
    </div>,

    // Card 1: Contact Info
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-600"></div>
      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Contact & Organization</h2>
      <div className="flex flex-col gap-6 relative z-10 flex-grow justify-center">
        <div className="flex items-center gap-4 text-gray-300"><div className="p-3 bg-white/5 rounded-2xl"><Mail size={20} className="text-purple-400" /></div><span className="text-sm">{profile.email}</span></div>
        <div className="flex items-center gap-4 text-gray-300"><div className="p-3 bg-white/5 rounded-2xl"><MapPin size={20} className="text-blue-400" /></div><span className="text-sm">{profile.city}, {profile.country}</span></div>
        <div className="flex items-center gap-4 text-gray-300">
          <div className="p-3 bg-white/5 rounded-2xl">{isEmp ? <Building size={20} className="text-amber-400" /> : <Briefcase size={20} className="text-cyan-400" />}</div>
          <span className="text-sm">{profile.company || profile.role}</span>
        </div>
      </div>
    </div>,

    // Card 2: Projects / Open Roles
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-600"></div>
      <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest border-b border-white/10 pb-3 relative z-10">
        {isEmp ? 'Open Roles & Focus' : 'Recent Work'}
      </h2>
      
      {isEmp ? (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4 relative z-10">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">Actively Recruiting</div>
          <p className="text-sm text-gray-200">{profile.openRoles || 'Full Stack & Cloud Engineers'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 relative z-10 mb-4">
          {(profile.projects || []).map((proj, i) => (
            <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-sm text-white font-bold mb-1">{proj.name}</div>
              <div className="text-xs text-gray-400">{proj.role} • {proj.tech}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 relative z-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Domains & Focus</h3>
        <div className="flex flex-wrap gap-1.5">
          {(profile.domains || []).map(d => (
            <span key={d} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px]">{d}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tech Stack</h3>
        <div className="flex flex-wrap gap-1.5">
          {(profile.techStack || []).map(t => (
            <span key={t} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px]">{t}</span>
          ))}
        </div>
      </div>
    </div>,

    // Card 3: Social & Action
    <div className="glass-panel rounded-[2.5rem] w-full h-full p-8 flex flex-col relative overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
      <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest border-b border-white/10 pb-4 relative z-10">Connect & Network</h2>
      
      <div className="flex justify-center flex-wrap gap-4 mb-8 relative z-10">
        {profile.socials?.github && (
          <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-white hover:text-black transition-colors border border-white/10" title="GitHub">
            <GithubIcon size={24} />
          </a>
        )}
        {profile.socials?.linkedin && (
          <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-blue-500 hover:text-white transition-colors border border-white/10" title="LinkedIn">
            <Briefcase size={24} />
          </a>
        )}
        {profile.socials?.portfolio && (
          <a href={profile.socials.portfolio} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 rounded-2xl hover:bg-emerald-400 hover:text-black transition-colors border border-white/10" title="Portfolio">
            <Globe size={24} />
          </a>
        )}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
        <button onClick={(e) => handleActionClick(e, 'message')} className="glass-btn py-3 text-white font-bold text-xs relative hover:bg-white/10 transition-colors">
          Send Message
        </button>
        <button onClick={(e) => handleActionClick(e, 'connect')} className="glass-btn py-3 text-cyan-300 font-bold text-xs relative hover:bg-white/10 transition-colors">
          {isEmp ? 'Apply to Roles' : 'Hire Developer'}
        </button>
      </div>
    </div>
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Translucent blurred backdrop with ambient colorful glowing orbs */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-[#0f1117]/65 backdrop-blur-2xl" 
        onClick={onClose} 
      />
      {/* Dynamic ambient color glows behind the modal */}
      <div className={`absolute w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all ${
        isEmp ? 'bg-amber-500/30' : 'bg-cyan-500/30'
      }`} />
      <div className="absolute w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none opacity-30 bg-purple-500/25 -bottom-10 right-1/4" />

      <div className="relative z-10 flex items-center gap-4 md:gap-8">
        <button onClick={prev} className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shrink-0"><ChevronLeft size={24} /></button>
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
        <button onClick={next} className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shrink-0"><ChevronRight size={24} /></button>
      </div>
      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20 text-gray-400 hover:text-white backdrop-blur-lg border border-white/10"><X size={20} /></button>
    </div>
  );
};

const Hire = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'developer', 'employer'
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/users/discover`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.users && data.users.length > 0) {
        // Merge with initial rich profiles
        const merged = [...INITIAL_PROFILES];
        data.users.forEach(u => {
          if (!merged.some(m => m.id === u.id || m.email === u.email)) {
            merged.push({
              id: u.id,
              name: u.name,
              role: u.profile?.role || (u.accountType === 'employer' ? 'Employer' : 'Developer'),
              accountType: u.accountType || 'developer',
              country: u.country || 'Global',
              city: u.city || 'Remote',
              avatar: u.profile_photo || null,
              initials: (u.name || 'U').split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase(),
              domains: u.profile?.role ? [u.profile.role] : [],
              techStack: u.profile?.projects?.flatMap(p => p.tech?.split(',').map(s=>s.trim()) || []) || [],
              projects: u.profile?.projects || [],
              status: u.profile?.status || 'Available',
              email: u.email,
              socials: u.profile?.socials || {},
              isDemo: u.isDemo !== false
            });
          }
        });
        setProfiles(merged);
      }
    })
    .catch(() => {});
  }, []);

  const filteredProfiles = profiles.filter(p => {
    if (activeTab !== 'all' && p.accountType !== activeTab) return false;
    if (selectedDomain && !p.domains.some(d => d.toLowerCase().includes(selectedDomain.toLowerCase())) && !p.role.toLowerCase().includes(selectedDomain.toLowerCase())) return false;
    if (selectedCountry && !p.country.toLowerCase().includes(selectedCountry.toLowerCase())) return false;
    if (cityInput && !p.city.toLowerCase().includes(cityInput.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Users size={14} /> Open Talent Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Discover Talent & Recruiters<span className="text-amber-400">.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Browse verified developers, founders, and hiring directors. Click on any profile to explore interactive Dev Cards.
          </p>
        </motion.div>

        {/* Tab Switcher: All, Developers, Employers */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            All Members ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'developer'
                ? 'bg-cyan-500 text-black shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Code2 size={14} /> Developers ({profiles.filter(p => p.accountType === 'developer').length})
          </button>
          <button
            onClick={() => setActiveTab('employer')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'employer'
                ? 'bg-amber-400 text-black shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Briefcase size={14} /> Employers / Recruiters ({profiles.filter(p => p.accountType === 'employer').length})
          </button>
        </div>

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4"><Filter size={18} className="text-amber-400" /><span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Filter Profiles</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Role / Domain / Skill</label>
              <input type="text" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} placeholder="e.g. Frontend, Systems, ML, Recruiter..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Country</label>
              <input type="text" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} placeholder="e.g. India, Germany, USA..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">City</label>
              <input type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="e.g. Vadodara, Berlin, Singapore..." className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors" />
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

        <div className="mb-6 text-sm text-gray-400">
          Showing <span className="text-white font-bold">{filteredProfiles.length}</span> profiles
        </div>

        {/* Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-white/25 transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
              onClick={() => setSelectedProfile(profile)}
            >
              {/* Header line */}
              <div className={`absolute top-0 left-0 w-full h-1 ${profile.accountType === 'employer' ? 'bg-amber-400' : 'bg-cyan-400'}`}></div>

              <div>
                <div className="flex items-start gap-4 mb-4">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover border border-white/20 shadow-md shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold shrink-0">
                      {profile.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-semibold truncate group-hover:text-cyan-400 transition-colors text-white">
                        {profile.name}
                      </h3>
                      {profile.isDemo && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest shrink-0">
                          demo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 font-medium truncate mt-0.5">
                      {profile.company ? `${profile.role} • ${profile.company}` : profile.role}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-xs">
                      <MapPin size={11} /> <span>{profile.city}, {profile.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                    profile.status === 'Available' || profile.status === 'Actively Hiring'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {profile.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                    {profile.accountType === 'employer' ? '💼 Employer' : '💻 Developer'}
                  </span>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(profile.techStack || []).slice(0, 4).map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Recent Project or Open Roles */}
                {profile.accountType === 'employer' ? (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-4">
                    <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold mb-1">Open Positions</div>
                    <div className="text-xs text-gray-300 truncate">{profile.openRoles}</div>
                  </div>
                ) : profile.projects && profile.projects[0] ? (
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl mb-4">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Recent Project</div>
                    <div className="text-xs text-white font-medium truncate">{profile.projects[0].name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{profile.projects[0].role}</div>
                  </div>
                ) : null}
              </div>

              <div className="pt-2 border-t border-white/5 text-center text-xs text-gray-400 group-hover:text-cyan-400 transition-colors flex items-center justify-center gap-1 font-medium">
                <Eye size={13} /> View 3D Profile Card
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/15 shadow-xl">
            <Users size={48} className="mx-auto mb-4 text-amber-400" />
            <h3 className="text-2xl font-extrabold text-white mb-2">No profiles match your filters</h3>
            <p className="text-gray-400 text-sm">Try resetting domain, country, or city filters</p>
          </div>
        )}
      </div>

      {/* Full Profile Card Carousel Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileCarouselModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hire;
