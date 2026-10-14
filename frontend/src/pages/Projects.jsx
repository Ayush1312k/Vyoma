import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, Clock, ArrowRight, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export const INITIAL_ROOMS = [
  {
    id: "proj-realtime-canvas",
    title: "Collaborative Whiteboard & Canvas",
    roles: ["Frontend Canvas Specialist", "WebSocket Architect"],
    stack: ["React", "TypeScript", "Canvas API", "Socket.io"],
    users: 3,
    maxUsers: 4,
    duration: "A few hours",
    creator: "sarah.chen@demo.vyoma.dev",
    creatorName: "Sarah Chen",
    isDemo: true
  },
  {
    id: "proj-neural-indexer",
    title: "Vector Search & Embeddings Engine",
    roles: ["Backend ML Engineer", "Distributed Systems"],
    stack: ["Python", "FastAPI", "PyTorch", "Docker"],
    users: 2,
    maxUsers: 4,
    duration: "A few days",
    creator: "alexander.wright@demo.vyoma.dev",
    creatorName: "Alexander Wright",
    isDemo: true
  },
  {
    id: "proj-cloud-mesh",
    title: "Decentralized Service Mesh & Proxy",
    roles: ["Go Core Developer", "DevOps Engineer"],
    stack: ["Go", "gRPC", "eBPF", "Kubernetes"],
    users: 2,
    maxUsers: 4,
    duration: "1 week",
    creator: "marcus.vance@demo.vyoma.dev",
    creatorName: "Marcus Vance",
    isDemo: true
  }
];

const Projects = () => {
  const [projects, setProjects] = useState(INITIAL_ROOMS);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      }
    } catch {
      // keep initial fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={13} /> Live Workspaces
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 text-white">Active Live Rooms</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Collaborate on live codebases in real-time. Rooms are limited to 4 developers for optimal pair-programming.
          </p>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchProjects} 
            className="glass-btn px-4 py-3 text-white flex items-center justify-center gap-2 shrink-0"
            title="Refresh projects list"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link to="/create" className="flex-1 sm:flex-initial">
            <button className="glass-btn px-5 sm:px-6 py-3 text-white flex items-center justify-center gap-2 font-semibold w-full sm:w-auto text-sm">
              <Plus size={18} /> New Workspace
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw size={32} className="text-cyan-400 animate-spin" />
            <p className="text-gray-400 text-sm">Synchronizing active rooms...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex items-center justify-center py-16 sm:py-20">
          <div className="text-center p-6">
            <Users size={48} className="mx-auto mb-4 text-cyan-400" />
            <p className="text-white text-xl sm:text-2xl font-extrabold mb-2">No active rooms right now</p>
            <p className="text-gray-400 text-sm mb-6">Initialize a new workspace to start coding.</p>
            <Link to="/create" className="glass-btn px-6 py-3 text-white inline-flex items-center gap-2 font-bold">
              <Plus size={18} /> Create Workspace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {projects.map((proj, i) => (
            <Link to={`/room/${proj.id}`} key={proj.id} className="block group">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl glass-panel flex flex-col justify-between min-h-[240px] sm:min-h-[260px] transition-all relative overflow-hidden"
              >
                
                <div>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg sm:text-2xl font-semibold group-hover:text-cyan-400 text-white transition-colors truncate">
                          {proj.title}
                        </h3>
                        {proj.isDemo && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest shrink-0">
                            demo
                          </span>
                        )}
                      </div>
                      {proj.creatorName && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                          Created by <span className="text-gray-300 font-medium truncate">{proj.creatorName}</span>
                          {proj.isDemo && <span className="text-[9px] text-amber-400 uppercase shrink-0">[demo]</span>}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-400 bg-white/5 border border-white/10 px-2 sm:px-2.5 py-1 rounded-full shrink-0">
                      <Clock size={12} /> {proj.duration || 'A few hours'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5 mt-3">
                    {(proj.stack || []).map(tech => (
                      <span key={tech} className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full border border-white/10 text-gray-300 bg-white/[0.03]">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {proj.roles && proj.roles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-widest mb-1.5 font-bold">Collaborator Roles:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.roles.map(role => (
                          <span key={role} className="text-[11px] sm:text-xs font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 pt-4 sm:pt-5 border-t border-white/10">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-400">
                    <Users size={14} className="text-cyan-400 shrink-0" />
                    <span>{proj.users || 1} / {proj.maxUsers || 4} Devs</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Join Workspace <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
