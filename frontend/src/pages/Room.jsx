import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MessageSquare, Code, Mic, Settings, Save, Send, ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, Loader2, Trash2, X, Globe, Copy, Plus, FileText, Users, Award } from 'lucide-react';
import GithubIcon from '../components/GithubIcon';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FileExplorer, { getLang } from '../components/room/FileExplorer';
import Terminal from '../components/room/Terminal';
import SettingsModal from '../components/room/SettingsModal';
import GitHubPanel from '../components/room/GitHubPanel';
import { API_URL, socket } from '../config';
const JoinGate = ({ onJoin, onView }) => {
  const [roleInput, setRoleInput] = useState('');
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-transparent relative overflow-hidden">
      {/* Background glow for Gate */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[80px] pointer-events-none"></div>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8">
        <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 shadow-2xl text-center glass-panel">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Users size={28} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Workspace #{window.location.pathname.split('/').pop()}</h2>
          <p className="text-sm text-gray-400 mb-6">Enter your role/domain and choose your access mode.</p>
          
          {/* Role/Domain Text Input */}
          <div className="mb-6 text-left">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Role / Domain</label>
            <input 
              type="text" 
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g. Frontend Developer, UI Designer, Backend Engineer..."
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <p className="text-[10px] text-gray-600 mt-1.5">This will appear in the project credits</p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                if (!roleInput.trim()) {
                  toast.error('Please enter your role/domain before joining');
                  return;
                }
                onJoin(roleInput.trim());
              }} 
              className="glass-btn w-full py-3 text-white font-medium flex items-center justify-center gap-2"
            >
              <Code size={18} /> Join & Edit
            </button>
            <button onClick={() => onView(roleInput.trim() || 'Viewer')} className="glass-btn w-full py-3 text-gray-300 font-medium flex items-center justify-center gap-2">
              <Eye size={18} /> View Only
            </button>
          </div>
          <Link to="/projects" className="inline-block mt-6 text-sm text-gray-500 hover:text-white transition-colors">← Back to Projects</Link>
        </div>
      </motion.div>
    </div>
  );
};
const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [accessState, setAccessState] = useState('loading'); 
  const [files, setFiles] = useState({});
  const [openTabs, setOpenTabs] = useState([]);
  const [activeFile, setActiveFile] = useState('');
  const [sidebarTab, setSidebarTab] = useState('files'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ theme: 'vs-dark', fontSize: 14, tabSize: 2, wordWrap: true });
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});
  const audioElementsRef = useRef({});
  const [activeVoiceUsers, setActiveVoiceUsers] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');

  const [isCreator, setIsCreator] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showCredits, setShowCredits] = useState(false);
  const [roomCredits, setRoomCredits] = useState(() => {
    const saved = localStorage.getItem(`da_credits_${id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeForm, setCompleteForm] = useState({ github: '', live: '' });

  const createPeerConnection = (socketId) => {
    if (peersRef.current[socketId]) return peersRef.current[socketId];
    
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('voice-ice-candidate', { to: socketId, candidate: event.candidate });
      }
    };
    
    pc.ontrack = (event) => {
      let audioEl = audioElementsRef.current[socketId];
      if (!audioEl) {
        audioEl = document.createElement('audio');
        audioEl.autoplay = true;
        audioElementsRef.current[socketId] = audioEl;
      }
      audioEl.srcObject = event.streams[0];
    };
    
    peersRef.current[socketId] = pc;
    return pc;
  };
  
  const removePeer = (socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].close();
      delete peersRef.current[socketId];
    }
    if (audioElementsRef.current[socketId]) {
      audioElementsRef.current[socketId].srcObject = null;
      delete audioElementsRef.current[socketId];
    }
    setActiveVoiceUsers(prev => {
      const newActive = { ...prev };
      delete newActive[socketId];
      return newActive;
    });
  };

  useEffect(() => {
    // Simply go to gate immediately as passwords are removed
    setAccessState('gate');
  }, [id, user]);

  useEffect(() => {
    const checkCreator = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`);
        const data = await res.json();
        const project = data.projects.find(p => p.id === id);
        if (project && user && project.creator === user.email) {
          setIsCreator(true);
        }
      } catch (err) {
        console.error('Failed to check creator status:', err);
      }
    };
    if (user) checkCreator();
  }, [id, user]);
  useEffect(() => {
    if (accessState !== 'joined' && accessState !== 'view') return;
    socket.connect();
    socket.emit('join_room', { roomId: id, userObj: user });
    socket.on('files_sync', (f) => {
      setFiles(f);
      const keys = Object.keys(f);
      if (keys.length > 0 && !activeFile) {
        const first = keys.find(k => k.endsWith('.js') || k.endsWith('.py') || k.endsWith('.dart') || k.endsWith('.html')) || keys[0];
        setOpenTabs([first]);
        setActiveFile(first);
      }
    });
    socket.on('file_content_update', ({ filename, content }) => {
      setFiles(prev => ({ ...prev, [filename]: { ...prev[filename], content } }));
    });
    socket.on('chat_history', (h) => setMessages(h || []));
    socket.on('receive_message', (msg) => { setMessages(prev => [...prev, msg]); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); });
    socket.on('room_users_update', (users) => setRoomUsers(users));
    socket.on('cursor_update', (data) => setCursors(prev => ({...prev, [data.socketId]: data})));
    socket.on('cursor_remove', ({ socketId }) => setCursors(prev => { const newC = {...prev}; delete newC[socketId]; return newC; }));
    
    socket.on('voice-user-joined', async ({ socketId, name }) => {
      setActiveVoiceUsers(prev => ({ ...prev, [socketId]: true }));
      const pc = createPeerConnection(socketId);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
      }
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('voice-offer', { to: socketId, offer, name: user?.name });
    });

    socket.on('voice-user-left', ({ socketId }) => {
      removePeer(socketId);
    });

    socket.on('voice-offer', async ({ from, offer, name }) => {
      setActiveVoiceUsers(prev => ({ ...prev, [from]: true }));
      const pc = createPeerConnection(from);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
      }
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('voice-answer', { to: from, answer });
    });

    socket.on('voice-answer', async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('voice-ice-candidate', ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    const controller = new AbortController();
    fetch(`${API_URL}/api/rooms/${id}/files`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
      signal: controller.signal
    }).then(r => r.json()).then(d => {
      if (d.files) {
        setFiles(d.files);
        const keys = Object.keys(d.files);
        if (keys.length > 0) { const first = keys.find(k => k.endsWith('.js') || k.endsWith('.py') || k.endsWith('.dart') || k.endsWith('.html')) || keys[0]; setOpenTabs([first]); setActiveFile(first); }
      }
    }).catch(() => {});
    return () => { 
      controller.abort();
      socket.off('files_sync'); socket.off('file_content_update'); socket.off('chat_history'); socket.off('receive_message'); socket.off('room_users_update'); socket.off('cursor_update'); socket.off('cursor_remove'); 
      socket.off('voice-user-joined'); socket.off('voice-user-left'); socket.off('voice-offer'); socket.off('voice-answer'); socket.off('voice-ice-candidate');
      if (isVoiceActive) {
        socket.emit('voice-user-left', { roomId: id });
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        Object.keys(peersRef.current).forEach(socketId => removePeer(socketId));
      }
      socket.disconnect();
    };
  }, [id, accessState]);

  const cursorColors = ['cursor-blue', 'cursor-green', 'cursor-amber', 'cursor-red', 'cursor-purple', 'cursor-pink'];
  const getCursorColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return cursorColors[Math.abs(hash) % cursorColors.length];
  };

  useEffect(() => {
    if (!editorRef.current || !window.monaco) return;
    const newDecorations = [];
    Object.values(cursors).forEach(c => {
      if (c.filename === activeFile && c.position) {
        newDecorations.push({
          range: new window.monaco.Range(c.position.lineNumber, c.position.column, c.position.lineNumber, c.position.column),
          options: { className: `live-cursor ${c.color} cursor-${c.socketId}`, hoverMessage: { value: c.userName } }
        });
      }
    });
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  }, [cursors, activeFile]);
  const openFile = (path) => {
    if (!openTabs.includes(path)) setOpenTabs(prev => [...prev, path]);
    setActiveFile(path);
  };
  const closeTab = (path, e) => {
    e?.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (activeFile === path) setActiveFile(newTabs[newTabs.length - 1] || '');
  };
  const createFile = (filename) => {
    const lang = getLang(filename);
    const content = lang === 'dart' ? 'void main() {\n  print("Hello Flutter!");\n}\n' : lang === 'python' ? '# New file\n' : lang === 'html' ? '<!DOCTYPE html>\n<html>\n<body>\n  \n</body>\n</html>\n' : `/* ${filename} */\n`;
    setFiles(prev => ({ ...prev, [filename]: { content, language: lang } }));
    socket.emit('file_created', { roomId: id, filename, content, language: lang });
    fetch(`${API_URL}/api/rooms/${id}/files`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }, body: JSON.stringify({ filename, content, language: lang }) });
    openFile(filename);
  };
  const deleteFile = (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;
    const newFiles = { ...files }; delete newFiles[filename]; setFiles(newFiles);
    closeTab(filename);
    socket.emit('file_deleted', { roomId: id, filename });
    fetch(`${API_URL}/api/rooms/${id}/files`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }, body: JSON.stringify({ filename }) });
  };
  const handleEditorChange = (value) => {
    if (!activeFile) return;
    setFiles(prev => ({ ...prev, [activeFile]: { ...prev[activeFile], content: value } }));
    socket.emit('file_content_change', { roomId: id, filename: activeFile, content: value });
    if (editorRef.current) {
      const pos = editorRef.current.getPosition();
      if (pos) {
        socket.emit('cursor_move', { 
          roomId: id, 
          filename: activeFile, 
          position: { lineNumber: pos.lineNumber, column: pos.column }, 
          userName: user?.name || 'Anonymous', 
          color: getCursorColor(user?.name || 'Anonymous')
        });
      }
    }
  };
  const handleSendMessage = (e) => {
    e.preventDefault(); if (!msgInput.trim()) return;
    socket.emit('send_message', { roomId: id, message: msgInput, sender: isAuthenticated ? user.name : 'Anonymous' });
    setMsgInput(''); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  const handleRun = async () => {
    if (!activeFile || !files[activeFile]) return;
    setIsRunning(true);
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newOut = [{ type: 'command', text: `$ run ${activeFile}  [${ts}]` }];
    try {
      const res = await fetch(`${API_URL}/api/execute`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }, body: JSON.stringify({ code: files[activeFile].content, language: files[activeFile].language, filename: activeFile }) });
      const data = await res.json();
      (data.output || []).forEach(t => newOut.push({ type: t.startsWith('[ERROR]') ? 'error' : t.startsWith('[WARN]') ? 'warn' : 'output', text: t }));
      newOut.push({ type: data.success ? 'success' : 'error', text: data.success ? `✓ Exited with code 0  [${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]` : '✗ Exited with error' });
      toast[data.success ? 'success' : 'error'](data.success ? 'Code executed' : 'Execution error');
    } catch (err) { newOut.push({ type: 'error', text: err.message }); }
    setRunOutput(newOut);
    setIsRunning(false);
  };
  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await fetch(`${API_URL}/api/rooms/${id}/deploy`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` } });
      const data = await res.json();
      setDeployUrl(data.deployment.url);
      toast.success('Project deployed!', { icon: '🚀' });
    } catch { toast.error('Deploy failed'); }
    setDeploying(false);
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this workspace? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Workspace deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCompleteProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('da_token')}`
        },
        body: JSON.stringify({
          ...completeForm,
          contributors: roomCredits
        })
      });
      if (!res.ok) throw new Error('Failed to complete project');
      toast.success('Project marked as completed! 🎉');
      navigate('/projects');
    } catch (err) {
      toast.error(err.message);
    }
  };
  const handleSave = async () => {
    try {
      for (const [filename, fileData] of Object.entries(files)) {
        await fetch(`${API_URL}/api/rooms/${id}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
          body: JSON.stringify({ filename, content: fileData.content, language: fileData.language })
        });
      }
      toast.success('Workspace saved successfully!', { icon: '💾' });
    } catch (err) {
      toast.error('Failed to save files manually.');
    }
  };

  const toggleVoice = async () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      socket.emit('voice-user-left', { roomId: id });
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      Object.keys(peersRef.current).forEach(socketId => removePeer(socketId));
      setActiveVoiceUsers({});
      toast('Voice chat disconnected', { icon: '🔇' });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsVoiceActive(true);
        setActiveVoiceUsers(prev => ({ ...prev, [socket.id]: true }));
        socket.emit('voice-user-joined', { roomId: id, name: user?.name });
        toast.success('Voice chat connected!', { icon: '🎙️' });
      } catch (err) {
        toast.error('Microphone access denied or unavailable.');
      }
    }
  };
  if (accessState === 'loading') return <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-black"><Loader2 size={32} className="text-gray-500 animate-spin" /></div>;
  if (accessState === 'gate') return <JoinGate onJoin={(role) => {
    setUserRole(role);
    // Add to credits
    const newCredit = { name: user?.name || 'Anonymous', role, status: 'working', joinedAt: new Date().toISOString() };
    const updatedCredits = [...roomCredits.filter(c => c.name !== newCredit.name), newCredit];
    setRoomCredits(updatedCredits);
    localStorage.setItem(`da_credits_${id}`, JSON.stringify(updatedCredits));
    setAccessState('joined');
  }} onView={(role) => {
    setUserRole(role);
    setAccessState('view');
  }} />;
  const currentFile = files[activeFile];
  const senderName = isAuthenticated ? user.name : 'Anonymous';
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-black text-white">
      {Object.entries(cursors).map(([socketId, c]) => {
        const safeName = (c.userName || 'Anonymous').replace(/[^a-zA-Z0-9 _-]/g, '');
        return <style key={socketId}>{`.cursor-${socketId}::after { content: "${safeName}"; }`}</style>;
      })}
      {/* Icon sidebar */}
      <div className="w-12 border-r border-gray-900 flex flex-col items-center py-4 gap-4 bg-black/40 backdrop-blur-md shrink-0">
        <button onClick={() => { setSidebarTab('files'); setSidebarOpen(sidebarTab === 'files' ? !sidebarOpen : true); }} className={`p-2 rounded-lg transition-colors ${sidebarTab === 'files' && sidebarOpen ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`} title="Explorer"><FileText size={20} /></button>
        <button onClick={() => { setSidebarTab('chat'); setSidebarOpen(sidebarTab === 'chat' ? !sidebarOpen : true); }} className={`p-2 rounded-lg transition-colors ${sidebarTab === 'chat' && sidebarOpen ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`} title="Chat"><MessageSquare size={20} /></button>
        <button onClick={() => { setSidebarTab('github'); setSidebarOpen(sidebarTab === 'github' ? !sidebarOpen : true); }} className={`p-2 rounded-lg transition-colors ${sidebarTab === 'github' && sidebarOpen ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`} title="GitHub"><GithubIcon size={20} /></button>
        <button onClick={toggleVoice} className={`p-2 rounded-lg transition-colors ${isVoiceActive ? 'bg-green-500 text-black' : 'text-gray-500 hover:text-white'}`} title="Voice"><Mic size={20} /></button>
        <div className="mt-auto">
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:text-white transition-colors" title="Settings"><Settings size={20} /></button>
        </div>
      </div>
      {/* Side panel (files/chat/github) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="absolute left-12 md:static z-40 h-[calc(100vh-80px)] border-r border-gray-900 bg-black/60 backdrop-blur-xl overflow-hidden shrink-0 flex flex-col shadow-2xl md:shadow-none">
            {sidebarTab === 'files' && <FileExplorer files={files} activeFile={activeFile} onSelect={openFile} onDelete={deleteFile} onCreate={createFile} />}
            {sidebarTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="h-10 border-b border-gray-900 flex items-center px-4 bg-black/20 shrink-0"><span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Team Chat</span></div>
                <div className="flex-1 p-3 overflow-auto flex flex-col gap-3">
                  {messages.length === 0 ? <div className="text-center text-xs text-gray-600 mt-8">No messages yet</div> : messages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.sender === senderName ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-gray-600 mb-0.5">{m.sender} • {m.time}</span>
                      <div className={`px-3 py-1.5 rounded-xl max-w-[90%] text-xs ${m.sender === senderName ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>{m.text}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-1.5 p-2 border-t border-gray-900 bg-black/40 backdrop-blur-md shrink-0">
                  <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Message..." className="flex-1 bg-[#111] border border-gray-800 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none" />
                  <button type="submit" className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center shrink-0"><Send size={12} /></button>
                </form>
              </div>
            )}
            {sidebarTab === 'github' && <GitHubPanel roomId={id} />}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-auto min-h-[48px] py-2 md:py-0 border-b border-gray-900 flex flex-wrap md:flex-nowrap items-center justify-between px-4 bg-black/40 backdrop-blur-md shrink-0 gap-3 md:gap-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft size={18} className="text-gray-400" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold flex items-center gap-2">
                Room #{id} 
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-[10px] text-green-400 font-bold border border-green-500/20 live-badge-glow">
                  Live
                </span>
                {isVoiceActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] text-amber-400 font-bold border border-amber-500/20 animate-pulse">
                    ● Voice
                  </span>
                )}
              </h1>
              <span className="text-[10px] text-gray-500 font-medium">Synced with cloud</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-4">
              {roomUsers.slice(0, 5).map(u => (
                <div key={u.socketId} className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white z-20 relative" style={{ backgroundColor: u.color }} title={u.name}>
                  {u.name.slice(0,2).toUpperCase()}
                  {activeVoiceUsers[u.socketId] && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-black z-30">
                      <Mic size={10} className="text-black" />
                    </div>
                  )}
                </div>
              ))}
              {roomUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-[10px] font-bold text-white z-10" title="Other users">+{roomUsers.length - 5}</div>
              )}
            </div>
            <button 
              onClick={() => setShowCredits(!showCredits)}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md text-xs font-medium hover:bg-purple-500/20 transition-all active:scale-95"
            >
              <Award size={14} /> Credits
            </button>
            <button 
              onClick={handleDeploy}
              disabled={deploying}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-600/40 text-green-400 rounded-md text-xs font-medium hover:bg-green-600/30 transition-all golden-glow-hover active:scale-95 disabled:opacity-50"
            >
              <Globe size={14} />
              {deploying ? 'Deploying...' : 'Deploy'}
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium hover:bg-white/10 transition-all active:scale-95">
              <Save size={14} /> Save
            </button>
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-md text-xs font-bold hover:bg-amber-50 transition-all golden-glow-hover active:scale-95 disabled:opacity-50"
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
              Run
            </button>
            {isCreator && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                <button 
                  onClick={() => setShowCompleteModal(true)}
                  className="p-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md hover:bg-green-500/20 transition-all"
                  title="Mark as Completed"
                >
                  <ShieldCheck size={16} />
                </button>
                <button 
                  onClick={handleDeleteRoom}
                  className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-all"
                  title="Delete Workspace"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </header>
        {/* Tabs */}
        <div className="h-9 border-b border-gray-900 flex items-center bg-[#0a0a0a] overflow-x-auto shrink-0">
          {openTabs.map(tab => (
            <div key={tab} onClick={() => setActiveFile(tab)} className={`flex items-center gap-2 px-3 h-full text-xs cursor-pointer border-r border-gray-900 shrink-0 ${activeFile === tab ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-[#111]'}`}>
              <span className="truncate max-w-[100px]">{tab.split('/').pop()}</span>
              <button onClick={(e) => closeTab(tab, e)} className="text-gray-600 hover:text-white ml-1"><X size={12} /></button>
            </div>
          ))}
          <button onClick={() => { const name = prompt('New file name (e.g. app.py, main.dart, index.html):'); if (name) createFile(name); }} className="px-2 h-full text-gray-600 hover:text-white" title="New File"><Plus size={14} /></button>
        </div>
        {/* Editor + Terminal */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {currentFile ? (
              <div className={`h-full ${accessState === 'view' ? 'pointer-events-none select-none opacity-90' : ''}`}>
                <Editor onMount={(editor, monaco) => { editorRef.current = editor; window.monaco = monaco; }} height="100%" language={currentFile.language} theme={settings.theme} value={currentFile.content} onChange={handleEditorChange} options={{ readOnly: accessState === 'view', minimap: { enabled: false }, fontSize: settings.fontSize, tabSize: settings.tabSize, wordWrap: settings.wordWrap ? 'on' : 'off', fontFamily: "'JetBrains Mono','Fira Code',monospace", padding: { top: 12 }, smoothScrolling: true, cursorBlinking: 'smooth' }} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                <div className="text-center"><Code size={48} className="mx-auto mb-4 text-gray-800" /><p>Select a file to start editing</p><p className="text-xs text-gray-700 mt-1">or create a new one with + in the tab bar</p></div>
              </div>
            )}
          </div>
          {/* Terminal */}
          <div className="w-full h-64 md:h-auto md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-gray-900 bg-black shrink-0 flex flex-col z-10 relative">
            <Terminal roomId={id} isRunning={isRunning} runOutput={runOutput} />
          </div>
        </div>
      </div>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
      {/* Credits Panel */}
      <AnimatePresence>
        {showCredits && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCredits(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Award size={20} className="text-purple-400" /> Project Credits</h2>
                <button onClick={() => setShowCredits(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={18} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-6">Room #{id} — Contributors and their roles</p>
              <div className="space-y-3">
                {roomCredits.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">No credits recorded yet.</div>
                ) : (
                  roomCredits.map((credit, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold">
                          {credit.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{credit.name}</div>
                          <div className="text-xs text-gray-400">{credit.role}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        credit.status === 'working' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {credit.status === 'working' ? '● Working' : '✓ Contributed'}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {userRole && (
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-[10px] text-gray-500">Your role: <span className="text-white font-medium">{userRole}</span></p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Complete Project Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-2">Complete Project</h2>
              <p className="text-sm text-gray-400 mb-6">Celebrate your success! Add links to your work and it will be showcased in the Completed Projects gallery.</p>
              
              <form onSubmit={handleCompleteProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">GitHub Repository URL</label>
                  <input 
                    type="url" 
                    value={completeForm.github}
                    onChange={e => setCompleteForm({...completeForm, github: e.target.value})}
                    placeholder="https://github.com/user/repo"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Live Demo / Production URL</label>
                  <input 
                    type="url" 
                    value={completeForm.live}
                    onChange={e => setCompleteForm({...completeForm, live: e.target.value})}
                    placeholder="https://my-app.vercel.app"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                
                <div className="pt-4 flex flex-col gap-3">
                  <button type="submit" className="glass-btn w-full py-3 text-white font-bold text-sm">
                    Finish & Showcase Project
                  </button>
                  <button type="button" onClick={() => setShowCompleteModal(false)} className="text-sm text-gray-500 hover:text-white transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Room;
