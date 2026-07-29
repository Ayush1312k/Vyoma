import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Calendar, ArrowUpRight, Award, CheckCircle, ExternalLink, Code2, X, Star, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import GithubIcon from '../components/GithubIcon';

const TiltCard = ({ children, onClick }) => {
  return (
    <div
      className="w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="w-full h-full relative">
        {children}
      </div>
    </div>
  );
};

const CompletedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/completed-projects`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      // silently handle fetch errors
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const gradients = [
    'from-green-400 to-emerald-600',
    'from-blue-400 to-cyan-600',
    'from-purple-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-rose-400 to-red-600',
    'from-teal-400 to-green-600',
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-6">
            <CheckCircle size={14} /> Completed Ecosystem
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Hall of Fame<span className="text-green-500">.</span>
          </h1>
          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto font-medium opacity-95">
            Showcasing the most impactful projects built, deployed, and finalized by the Vyoma community.
          </p>
          
          {/* Stats bar */}
          {projects.length > 0 && (
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{projects.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Projects</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + (p.contributors?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Contributors</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + (p.stack?.length || 0), 0)}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Technologies</div>
              </div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <Code2 size={56} className="mx-auto mb-6 text-green-400" />
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">No projects completed yet</h3>
            <p className="text-white text-lg md:text-xl font-medium mt-3 mb-8 max-w-xl mx-auto leading-relaxed opacity-95">Be the first to build something amazing and showcase it to the Vyoma community!</p>
            <Link to="/projects" className="glass-btn px-8 py-3.5 text-white font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
              <Layers size={18} /> View Active Rooms
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <TiltCard onClick={() => setSelectedProject(project)}>
                  <div className="glass-panel rounded-[2.5rem] p-8 h-full border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden min-h-[420px]">
                    {/* Header gradient line */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradients[idx % gradients.length]}`}></div>
                    
                    {/* Ambient glow */}
                    <div className={`absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-[0.05] rounded-full blur-[80px]`}></div>
                    
                    {/* Project header */}
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors uppercase tracking-tight truncate">{project.title}</h2>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Calendar size={12} /> {project.completedAt ? new Date(project.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently Completed'}
                        </p>
                        {project.creatorName && (
                          <p className="text-xs text-gray-600 mt-1">by {project.creatorName}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 ml-4">
                        {project.github && (
                          <a href={project.github} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white hover:scale-105" title="GitHub Repo" onClick={(e) => e.stopPropagation()}>
                            <GithubIcon size={18} />
                          </a>
                        )}
                        {project.live && (
                          <a href={project.live} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-green-500/10 rounded-xl hover:bg-green-500/20 border border-green-500/20 transition-all text-green-400 hover:scale-105" title="Live Demo" onClick={(e) => e.stopPropagation()}>
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                      {(project.stack || []).map(tech => (
                        <span key={tech} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Contributors section */}
                    <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                          <Users size={14} /> Contributors
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          {project.contributors?.length || 0} members
                        </span>
                      </div>
                      
                      {project.contributors && project.contributors.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {project.contributors.slice(0, 4).map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[(idx + i) % gradients.length]} flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}>
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-gray-200">{c.name}</div>
                                <div className="text-[10px] text-gray-500">{c.role}</div>
                              </div>
                            </div>
                          ))}
                          {project.contributors.length > 4 && (
                            <div className="flex items-center justify-center px-3 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs text-gray-400">
                              +{project.contributors.length - 4} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600 italic">No contributor data recorded</div>
                      )}
                    </div>

                    {/* View details hint */}
                    <div className="mt-6 flex justify-end relative z-10">
                      <span className="text-xs font-bold text-gray-600 group-hover:text-white flex items-center gap-1 transition-colors">
                        View Details <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/85 backdrop-blur-xl" 
              onClick={() => setSelectedProject(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#0a0a0a] border border-white/15 rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-[0_40px_80px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-20">
                <X size={18} />
              </button>

              {/* Header gradient */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-t-3xl"></div>
              
              {/* Project Title */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle size={10} className="inline mr-1" /> Completed
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight uppercase mb-2">{selectedProject.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> 
                    {selectedProject.completedAt ? new Date(selectedProject.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                  </span>
                  {selectedProject.creatorName && (
                    <span>by <span className="text-gray-300">{selectedProject.creatorName}</span></span>
                  )}
                </div>
              </div>

              {/* Links */}
              {(selectedProject.github || selectedProject.live) && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {selectedProject.github && (
                    <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-gray-300 hover:text-white text-sm font-medium">
                      <GithubIcon size={18} /> GitHub Repository <ExternalLink size={14} className="text-gray-500" />
                    </a>
                  )}
                  {selectedProject.live && (
                    <a href={selectedProject.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-green-500/10 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all text-green-400 text-sm font-medium">
                      <Globe size={18} /> Live Demo <ExternalLink size={14} className="text-green-600" />
                    </a>
                  )}
                </div>
              )}

              {/* Tech Stack */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Layers size={14} /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.stack || []).map(tech => (
                    <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roles needed (from workspace) */}
              {selectedProject.roles && selectedProject.roles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Project Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.roles.map(role => (
                      <span key={role} className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributors */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award size={14} className="text-amber-400" /> Contributors ({selectedProject.contributors?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedProject.contributors && selectedProject.contributors.length > 0 ? (
                    selectedProject.contributors.map((c, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.06] transition-colors">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0`}>
                          {getInitials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white">{c.name}</div>
                          <div className="text-xs text-gray-400">{c.role}</div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 ${
                          c.status === 'working' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {c.status === 'working' ? '● Active' : '✓ Contributed'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-600 text-sm">No contributor data was recorded for this project.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompletedProjects;
