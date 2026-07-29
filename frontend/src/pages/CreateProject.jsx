import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Code2, Users2, Clock, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
const CreateProject = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState('');
  const [roles, setRoles] = useState('');
  const [teamSize, setTeamSize] = useState('2-3 Members');
  const [duration, setDuration] = useState('A few hours (Hackathon)');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const getMaxUsers = () => {
    if (teamSize === '2-3 Members') return 3;
    if (teamSize === '4-5 Members') return 5;
    return 8;
  };
  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to create a workspace.');
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          stack: stack.split(',').map(s => s.trim()).filter(Boolean),
          roles: roles.split(',').map(r => r.trim()).filter(Boolean),
          maxUsers: getMaxUsers(),
          duration,
          password: null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');
      toast.success('Workspace initialized! Booting container...');
      setTimeout(() => {
        navigate(`/room/${data.project.id}`);
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
            Initialize Workspace.
          </h1>
          <p className="text-gray-400 text-lg">Define your project parameters and spin up a live room instantly.</p>
        </motion.div>
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-2xl">
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-white' : 'bg-white/10'} transition-colors duration-500`}></div>
            ))}
          </div>
          <form onSubmit={handleLaunch} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors">
                  <Box size={16} /> Project Title
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (e.target.value) setStep(Math.max(step, 2)); }}
                  placeholder="e.g. Distributed Key-Value Store" 
                  className="w-full bg-transparent border-b border-white/10 pb-3 text-2xl text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="group pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors">
                  <Code2 size={16} /> Core Technologies
                </label>
                <input 
                  type="text" 
                  required
                  value={stack}
                  onChange={(e) => { setStack(e.target.value); if (e.target.value) setStep(Math.max(step, 3)); }}
                  placeholder="e.g. React, Python, Flutter, Dart, Node.js, Figma" 
                  className="w-full bg-transparent border-b border-white/10 pb-3 text-xl text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="group pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors">
                  <Users2 size={16} /> Needed Roles
                </label>
                <input 
                  type="text" 
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="e.g. Frontend Dev, UI Designer, Backend Engineer" 
                  className="w-full bg-transparent border-b border-white/10 pb-3 text-lg text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors">
                    <Users2 size={16} /> Team Size
                  </label>
                  <select 
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                  >
                    <option className="bg-black">2-3 Members</option>
                    <option className="bg-black">4-5 Members</option>
                    <option className="bg-black">6+ Members</option>
                  </select>
                </div>
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3 group-focus-within:text-white transition-colors">
                    <Clock size={16} /> Expected Duration
                  </label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-3 text-lg text-white focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                  >
                    <option className="bg-black">A few hours (Hackathon)</option>
                    <option className="bg-black">A few days</option>
                    <option className="bg-black">Weeks</option>
                  </select>
                </div>
              </div>

            </div>
            <div className="pt-8 sm:pt-10 flex justify-center sm:justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="glass-btn flex items-center justify-center gap-2 px-8 py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Initializing...' : 'Launch Workspace'} <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default CreateProject;
