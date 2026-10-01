import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Terminal, Mic, Briefcase, Users, Award, Zap, Globe, Lock, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    className="group glass-panel p-8 rounded-3xl flex flex-col justify-between border border-white/5 hover:border-cyan-500/30 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="p-4 bg-white/5 rounded-2xl w-max mb-6 group-hover:scale-110 transition-transform">
      <Icon size={32} className="text-cyan-400" />
    </div>
    <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight text-white">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const { user, toggleViewMode } = useAuth();
  const isEmployer = user?.accountType === 'employer';

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-white font-mono selection:bg-cyan-500 selection:text-black">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-24 py-32 z-10">
        <motion.div style={{ y }} className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[150px] mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] mix-blend-screen"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap size={14} /> Open Real-Time Ecosystem
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter uppercase mb-8">
              Code.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Collaborate.</span><br />
              Conquer.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl font-light leading-relaxed mb-10">
              Vyoma is the unified real-time collaboration platform for developers and employers. Jump directly into live multi-user workspaces or switch to Employer view to recruit talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/projects" className="glass-btn px-8 py-4 text-white text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                Explore Live Rooms <ArrowRight size={16} />
              </Link>
              <button 
                onClick={toggleViewMode}
                className="px-6 py-4 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs uppercase tracking-widest font-semibold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={16} /> {isEmployer ? 'Switch to Developer View' : 'See What an Employer Sees'}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="glass-panel p-2 rounded-[2rem] border border-white/20 shadow-[0_0_50px_rgba(6,182,212,0.2)] rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <div className="bg-[#050505] rounded-[1.75rem] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="ml-4 text-xs text-gray-500 font-mono flex-1 text-center pr-10">workspace.js - Vyoma</div>
                </div>
                <div className="p-6 font-mono text-sm text-gray-300">
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">vyoma</span> = <span className="text-cyan-400">new</span> Platform();</p>
                  <p className="mt-2"><span className="text-blue-400">vyoma</span>.<span className="text-yellow-200">init</span>({'{'}</p>
                  <p className="ml-4 text-green-300">collaborator: "Ayush Kumar",</p>
                  <p className="ml-4 text-green-300">liveRooms: true,</p>
                  <p className="ml-4 text-green-300">voiceChat: true,</p>
                  <p className="ml-4 text-green-300">employerView: true</p>
                  <p>{'}'});</p>
                  <p className="mt-4 text-gray-500">// Terminal Output</p>
                  <p className="text-green-400">$ All features unlocked. Ready to collaborate.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="w-full px-6 md:px-24 py-32 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6">Everything You Need</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">We've eliminated sign-in friction. Explore workspaces, test live terminals, inspect code, and discover talent from the start.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Code2} 
              title="Real-Time Workspaces" 
              description="Collaborate on code instantly. Live multi-cursor editing, file management, and instant synchronisation with up to 4 active developers per workspace."
              delay={0}
            />
            <FeatureCard 
              icon={Terminal} 
              title="Live Terminal Execution" 
              description="Execute code directly in the cloud-connected sandbox. Run JavaScript, Python, Bash, or inspect outputs on the fly."
              delay={0.1}
            />
            <FeatureCard 
              icon={Mic} 
              title="Built-in Voice Chat" 
              description="Connect audio channels directly in the workspace using peer-to-peer WebRTC without needing third-party meeting apps."
              delay={0.2}
            />
            <FeatureCard 
              icon={Users} 
              title="Talent Discovery" 
              description="Explore verified developer and employer portfolios. Filter by domain, skill, country, or city with interactive 3D Dev Cards."
              delay={0.3}
            />
            <FeatureCard 
              icon={Briefcase} 
              title="Employer Dual View" 
              description="Toggle directly to an Employer perspective at any moment to see recruiter dashboards, talent pipelines, and direct hiring invitations."
              delay={0.4}
            />
            <FeatureCard 
              icon={Award} 
              title="Hall of Fame & Credits" 
              description="Every completed project archives its full contributor roster and credits, immortalizing real work and team achievements."
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Security & Architecture */}
      <section className="w-full px-6 md:px-24 py-32 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Engineered for Scale & Speed</h2>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-white/5 rounded-xl"><Lock className="text-purple-400" size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Isolated Live Rooms</h4>
                <p className="text-gray-400 leading-relaxed">Protected by stateful WebSockets and room-scoped event dispatching. Workspaces maintain isolation and sub-millisecond sync.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-white/5 rounded-xl"><Globe className="text-blue-400" size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Immediate Access</h4>
                <p className="text-gray-400 leading-relaxed">No credentials or passwords required. Browse the live projects, join interactive sessions, and view demo engineering profiles right away.</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-[100px] rounded-full"></div>
            <div className="glass-panel p-8 rounded-3xl border border-white/10 relative z-10 flex items-center justify-center min-h-[300px]">
               <div className="text-center">
                 <div className="inline-block p-6 bg-black/50 rounded-full border border-white/10 mb-6">
                   <Code2 size={48} className="text-cyan-400" />
                 </div>
                 <h3 className="text-2xl font-bold uppercase tracking-widest text-white">Cloud Architecture</h3>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 md:px-24 py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/20 z-0"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-8">Stop Reading.<br/>Start Building.</h2>
          <p className="text-xl text-gray-400 mb-12">Dive into active collaboration rooms or initialize a workspace.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects" className="bg-white text-black px-10 py-4 rounded-full text-sm uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Explore Live Rooms <ArrowRight size={16} />
            </Link>
            <Link to="/create" className="glass-btn px-10 py-4 rounded-full text-sm uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 text-white">
              Launch New Workspace <Code2 size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
