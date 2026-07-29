import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Code2, Terminal, Mic, Briefcase, Users, Award, Zap, Globe, Lock, ArrowRight } from 'lucide-react';

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
              <Zap size={14} /> The Future of Development
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter uppercase mb-8">
              Code.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Collaborate.</span><br />
              Conquer.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl font-light leading-relaxed mb-10">
              Vyoma is the ultimate unified platform for developers. Seamlessly transition from writing code in real-time workspaces to getting hired by top recruiters, all in one ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth" className="glass-btn px-8 py-4 text-white text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                Join the Network <ArrowRight size={16} />
              </Link>
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
                  <p className="ml-4 text-green-300">workspaces: true,</p>
                  <p className="ml-4 text-green-300">voiceChat: true,</p>
                  <p className="ml-4 text-green-300">liveTerminal: true,</p>
                  <p className="ml-4 text-green-300">hiringNetwork: true</p>
                  <p>{'}'});</p>
                  <p className="mt-4 text-gray-500">// Terminal Output</p>
                  <p className="text-green-400">$ System online. Ready to build.</p>
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
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">We've eliminated the friction of switching context. Vyoma brings your editor, terminal, team, and career into a single window.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Code2} 
              title="Real-Time Workspaces" 
              description="Collaborate on code instantly. Our collaborative editor supports syntax highlighting and live cursors, letting you pair program with anyone across the globe without delay."
              delay={0}
            />
            <FeatureCard 
              icon={Terminal} 
              title="Live Terminal Execution" 
              description="No need to run local environments. Write your code and execute it directly in the cloud-connected terminal. Supports Bash, Node.js, and Python out of the box."
              delay={0.1}
            />
            <FeatureCard 
              icon={Mic} 
              title="Built-in Voice Chat" 
              description="Communication is key. Connect your microphone instantly within the workspace using WebRTC. Discuss logic and architecture without opening third-party call apps."
              delay={0.2}
            />
            <FeatureCard 
              icon={Users} 
              title="Global Talent Network" 
              description="Employers can browse the platform to find top-tier developers. Filter by domain, country, or city and send direct hiring offers that trigger instant in-app notifications."
              delay={0.3}
            />
            <FeatureCard 
              icon={Briefcase} 
              title="Project Marketplace" 
              description="Monetize your skills. List your completed open-source or private projects on the marketplace. Sell access or transfer ownership securely using our bidding system."
              delay={0.4}
            />
            <FeatureCard 
              icon={Award} 
              title="Hall of Fame & Stats" 
              description="Every commit and completed project builds your Reputation Score. Climb the leaderboards, establish trust, and showcase your best work on your public Dev Card."
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
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">Engineered for Scale & Security</h2>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-white/5 rounded-xl"><Lock className="text-purple-400" size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Enterprise-Grade Security</h4>
                <p className="text-gray-400 leading-relaxed">Protected by JWT session handling, rate limiting, and input sanitization. We ensure your code and personal data remain isolated and secure.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-white/5 rounded-xl"><Globe className="text-blue-400" size={24} /></div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Frictionless Network</h4>
                <p className="text-gray-400 leading-relaxed">Sign in with GitHub or Google via OAuth. Instantly jump into a workspace or browse the marketplace without tedious configuration steps.</p>
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
                   <Code2 size={48} className="text-white" />
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
          <p className="text-xl text-gray-400 mb-12">Join developers and employers shaping the future.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="bg-white text-black px-10 py-4 rounded-full text-sm uppercase tracking-widest font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
              Create Free Account <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#050505] py-12 px-6 md:px-24 relative z-10 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-mark-cyan.png" alt="Vyoma Logo" className="w-8 h-8 object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <span className="text-xl font-bold tracking-widest text-white uppercase">VYOMA</span>
          </div>
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Vyoma. Real-Time Collaborative Coding Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/projects" className="hover:text-cyan-400 transition-colors">Projects</Link>
            <Link to="/marketplace" className="hover:text-cyan-400 transition-colors">Marketplace</Link>
            <Link to="/hall-of-fame" className="hover:text-cyan-400 transition-colors">Hall of Fame</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
