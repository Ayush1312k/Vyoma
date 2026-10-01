import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Calendar, ArrowUpRight, Award, CheckCircle, ExternalLink, Code2, X, Star, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import GithubIcon from '../components/GithubIcon';

export const INITIAL_COMPLETED_PROJECTS = [
  {
    id: "hof-1",
    title: "Vyoma Real-Time IDE Engine",
    roles: ["Lead Architecture", "Frontend Systems", "Infrastructure"],
    stack: ["React", "Node.js", "WebSockets", "Monaco Editor", "WebRTC"],
    completed: true,
    creator: "kumarayush1312@gmail.com",
    creatorName: "Ayush Kumar",
    completedAt: "2026-09-20T10:00:00.000Z",
    github: "https://github.com/Ayush1312k/DevAssembly",
    live: "https://vyoma-ide.dev",
    isDemo: false,
    contributors: [
      {
        name: "Ayush Kumar",
        role: "Lead Architect",
        avatar: "/ayush_profile.jpg",
        isDemo: false
      },
      {
        name: "Sarah Chen",
        role: "Frontend Lead",
        avatar: "/demo-avatars/pro_avatar5.jpg",
        isDemo: true
      },
      {
        name: "Marcus Vance",
        role: "Infrastructure Lead",
        avatar: "/demo-avatars/pro_avatar4.jpg",
        isDemo: true
      }
    ]
  },
  {
    id: "hof-2",
    title: "HyperGraph Distributed KV Store",
    roles: ["Core Systems", "eBPF Performance", "Testing"],
    stack: ["Rust", "Raft Consensus", "gRPC", "Prometheus"],
    completed: true,
    creator: "marcus.vance@demo.vyoma.dev",
    creatorName: "Marcus Vance",
    completedAt: "2026-09-12T14:30:00.000Z",
    github: "https://github.com/demo-marcusvance/hypergraph",
    live: "https://hypergraph.demo.dev",
    isDemo: true,
    contributors: [
      {
        name: "Marcus Vance",
        role: "Core Database Lead",
        avatar: "/demo-avatars/pro_avatar4.jpg",
        isDemo: true
      },
      {
        name: "Elena Rostova",
        role: "Performance & eBPF",
        avatar: "/demo-avatars/pro_avatar2.jpg",
        isDemo: true
      },
      {
        name: "Ayush Kumar",
        role: "Client SDK & Testing",
        avatar: "/ayush_profile.jpg",
        isDemo: false
      }
    ]
  },
  {
    id: "hof-3",
    title: "NeuroFlow: Autonomous Code Reviewer",
    roles: ["AI Research", "Integration", "Web UI"],
    stack: ["Python", "PyTorch", "FastAPI", "GitHub Actions"],
    completed: true,
    creator: "alexander.wright@demo.vyoma.dev",
    creatorName: "Alexander Wright",
    completedAt: "2026-08-28T09:15:00.000Z",
    github: "https://github.com/demo-alexwright/neuroflow",
    live: "https://neuroflow.ai.demo",
    isDemo: true,
    contributors: [
      {
        name: "Alexander Wright",
        role: "AI Systems Lead",
        avatar: "/demo-avatars/pro_avatar3.jpg",
        isDemo: true
      },
      {
        name: "David Rossi",
        role: "Integration Architect",
        avatar: "/demo-avatars/pro_avatar1.jpg",
        isDemo: true
      },
      {
        name: "Sarah Chen",
        role: "Web Dashboard UI",
        avatar: "/demo-avatars/pro_avatar5.jpg",
        isDemo: true
      }
    ]
  }
];

const TiltCard = ({ children, onClick }) => {
  return (
    <div className="w-full cursor-pointer" onClick={onClick}>
      <div className="w-full h-full relative">
        {children}
      </div>
    </div>
  );
};

const CompletedProjects = () => {
  const [projects, setProjects] = useState(INITIAL_COMPLETED_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/api/completed-projects`);
      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      }
    } catch {
      // keep fallback
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
            Showcasing the most impactful projects built, deployed, and finalized with full team credits.
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h2 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors uppercase tracking-tight truncate">
                            {project.title}
                          </h2>
                          {project.isDemo && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                              demo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <Calendar size={12} /> {project.completedAt ? new Date(project.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently Completed'}
                        </p>
                        {project.creatorName && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                            <span>by {project.creatorName}</span>
                            {project.isDemo && (
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">demo</span>
                            )}
                          </p>
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

                    {/* Contributors section with Avatar and Demo Badge */}
                    <div className="mt-auto pt-6 border-t border-white/10 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <Users size={14} /> Contributors & Credits
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                          {project.contributors?.length || 0} members
                        </span>
                      </div>
                      
                      {project.contributors && project.contributors.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {project.contributors.slice(0, 4).map((c, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-2 bg-white/[0.04] rounded-xl border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
                              {c.avatar ? (
                                <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-md shrink-0" />
                              ) : (
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[(idx + i) % gradients.length]} flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0`}>
                                  {getInitials(c.name)}
                                </div>
                              )}
                              <div>
                                <div className="text-xs font-semibold text-gray-200 flex items-center gap-1">
                                  <span>{c.name}</span>
                                  {c.isDemo && (
                                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-tighter">
                                      demo
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-400">{c.role}</div>
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
                      <span className="text-xs font-bold text-gray-500 group-hover:text-white flex items-center gap-1 transition-colors">
                        View Credits & Architecture <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail & Credits Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#0f1117]/65 backdrop-blur-2xl" 
              onClick={() => setSelectedProject(null)} 
            />
            <div className="absolute w-[450px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-35 bg-cyan-500/25" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full relative z-10 shadow-[0_40px_80px_rgba(0,0,0,0.7)] max-h-[90vh] overflow-y-auto border border-white/20"
            >
              {/* Close button */}
              <button onClick={() => setSelectedProject(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-20 text-gray-400 hover:text-white">
                <X size={18} />
              </button>

              {/* Header gradient */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 rounded-t-3xl"></div>
              
              {/* Project Title */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle size={10} className="inline mr-1" /> Completed Project
                  </span>
                  {selectedProject.isDemo && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest">
                      demo project
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold tracking-tight uppercase mb-2 text-white">{selectedProject.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> 
                    {selectedProject.completedAt ? new Date(selectedProject.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}
                  </span>
                  {selectedProject.creatorName && (
                    <span className="flex items-center gap-1">
                      by <strong className="text-gray-200">{selectedProject.creatorName}</strong>
                      {selectedProject.isDemo && <span className="text-[9px] px-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase">demo</span>}
                    </span>
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
                  <Layers size={14} /> Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedProject.stack || []).map(tech => (
                    <span key={tech} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contributors Credits List */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award size={14} className="text-amber-400" /> Team Credits & Contributors ({selectedProject.contributors?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedProject.contributors && selectedProject.contributors.length > 0 ? (
                    selectedProject.contributors.map((c, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl hover:bg-white/[0.06] transition-colors">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md shrink-0" />
                        ) : (
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0`}>
                            {getInitials(c.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <span>{c.name}</span>
                            {c.isDemo && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                                demo
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">{c.role}</div>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 shrink-0 font-medium">
                          ✓ Verified Credit
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">No contributor data recorded.</div>
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
