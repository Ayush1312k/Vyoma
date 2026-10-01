import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Box, Code2, Users2, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const CreateProject = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [stack, setStack] = useState('');
  const [roles, setRoles] = useState('');
  const [teamSize, setTeamSize] = useState('4 Developers (Max)');
  const [duration, setDuration] = useState('A few hours (Hackathon)');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const getMaxUsers = () => {
    if (teamSize === '2 Developers') return 2;
    if (teamSize === '3 Developers') return 3;
    return 4; // limit of 4 people only
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
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
      toast.success('Workspace initialized! Booting live room...');
      setTimeout(() => {
        navigate(`/room/${data.project.id}`);
      }, 800);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-transparent py-12 px-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={13} /> Real-Time Collaboration
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Initialize Workspace.
          </h1>
          <p className="text-gray-400 text-base">
            Spin up a containerized live editor with WebRTC voice and multi-cursor sync.
          </p>
        </motion.div>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-8 md:p-10 border border-white/10 shadow-2xl">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-cyan-400' : 'bg-white/10'} transition-colors duration-500`}></div>
            ))}
          </div>

          <form onSubmit={handleLaunch} className="space-y-6">
            <div className="space-y-5">
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <Box size={14} className="text-cyan-400" /> Project Title
                </label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (e.target.value) setStep(Math.max(step, 2)); }}
                  placeholder="e.g. Distributed Key-Value Store" 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-lg text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <Code2 size={14} className="text-cyan-400" /> Core Technologies (comma separated)
                </label>
                <input 
                  type="text" 
                  value={stack}
                  onChange={(e) => { setStack(e.target.value); if (e.target.value) setStep(Math.max(step, 3)); }}
                  placeholder="e.g. React, Node.js, WebSockets, Docker" 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <Users2 size={14} className="text-cyan-400" /> Collaborator Roles
                </label>
                <input 
                  type="text" 
                  value={roles}
                  onChange={(e) => { setRoles(e.target.value); if (e.target.value) setStep(Math.max(step, 4)); }}
                  placeholder="e.g. Frontend Engineer, Backend Architect, Designer" 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <Users2 size={14} className="text-cyan-400" /> Room Capacity (Max 4)
                  </label>
                  <select 
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                  >
                    <option className="bg-[#111]">2 Developers</option>
                    <option className="bg-[#111]">3 Developers</option>
                    <option className="bg-[#111]">4 Developers (Max)</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <Clock size={14} className="text-cyan-400" /> Expected Duration
                  </label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
                  >
                    <option className="bg-[#111]">A few hours (Hackathon)</option>
                    <option className="bg-[#111]">A few days</option>
                    <option className="bg-[#111]">1 week</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={loading || !title}
                className="glass-btn flex items-center justify-center gap-2 px-8 py-3.5 text-white font-semibold text-sm disabled:opacity-50"
              >
                {loading ? 'Initializing Container...' : 'Launch Workspace'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
