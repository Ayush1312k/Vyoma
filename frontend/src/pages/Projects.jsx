import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Users, Clock, ArrowRight, RefreshCw, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
const Projects = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      // silently handle fetch errors
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Active Rooms</h1>
          <p className="text-gray-400">
            {isAuthenticated 
              ? 'Join a live project or create your own.' 
              : 'Explore live collaboration rooms. Sign in to join or create your own.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProjects} 
            className="glass-btn px-4 py-3 text-white flex items-center gap-2"
            title="Refresh projects list"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAuthenticated ? (
            <Link to="/create">
              <button className="glass-btn px-6 py-3 text-white flex items-center gap-2">
                <Plus size={20} /> New Project
              </button>
            </Link>
          ) : (
            <Link to="/auth">
              <button className="glass-btn px-6 py-3 text-white flex items-center gap-2">
                Sign In to Create
              </button>
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw size={32} className="text-gray-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading rooms...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Users size={48} className="mx-auto mb-4 text-cyan-400/80" />
            <p className="text-white text-xl font-bold mb-2">No active rooms yet</p>
            <p className="text-slate-200 text-sm font-medium mb-6">Create a workspace to start collaborating with other developers in real-time.</p>
            {isAuthenticated ? (
              <Link to="/create" className="glass-btn px-6 py-3 text-white inline-flex items-center gap-2 font-bold"><Plus size={18} /> Create the first room</Link>
            ) : (
              <Link to="/auth" className="glass-btn px-6 py-3 text-white inline-flex items-center gap-2 font-bold">Sign in to create the first room →</Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj, i) => (
            <Link to={isAuthenticated ? `/room/${proj.id}` : '/auth'} key={proj.id} className="block">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-8 rounded-2xl glass-panel group flex flex-col justify-between min-h-[250px] cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-semibold group-hover:text-cyan-400 text-gray-100 transition-colors">{proj.title}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded-md shrink-0">
                      <Clock size={12} /> {proj.time || proj.duration}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(proj.stack || []).map(tech => (
                      <span key={tech} className="text-xs px-3 py-1 rounded-full border border-gray-800 text-gray-400 bg-[#111]">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {proj.roles && proj.roles.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Needed Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {proj.roles.map(role => (
                          <span key={role} className="text-xs font-medium text-white bg-gray-800 px-2 py-1 rounded">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-900">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>{proj.users || 1} User(s) Active</span>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-gray-300 transition-colors">
                    {isAuthenticated ? (
                      <>Join Workspace <ArrowRight size={16} /></>
                    ) : (
                      <><Eye size={16} /> Sign in to Join</>
                    )}
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
