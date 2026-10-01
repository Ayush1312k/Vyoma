import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Plus, X, Users, MessageSquare, ArrowLeft, Phone, Video, MoreVertical, Smile, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const INITIAL_DEMO_CONTACTS = [
  {
    id: 'demo-sarah',
    name: 'Sarah Chen',
    role: 'Lead Frontend Architect',
    email: 'sarah.chen@demo.vyoma.dev',
    avatar: '/demo-avatars/pro_avatar5.jpg',
    initials: 'SC',
    isDemo: true,
    lastMessage: 'The new multi-cursor canvas sync is looking super smooth!',
    lastTime: '11:20 AM',
    unread: 1
  },
  {
    id: 'demo-vikram',
    name: 'Vikram Malhotra',
    role: 'Head of Engineering Talent • Apex Quantum Labs',
    email: 'vikram.malhotra@apexlabs-demo.com',
    avatar: '/demo-avatars/pro_avatar1.jpg',
    initials: 'VM',
    isDemo: true,
    lastMessage: 'Hi Ayush, loved your architecture. Would love to discuss our Senior Lead role!',
    lastTime: '10:05 AM',
    unread: 1
  },
  {
    id: 'demo-marcus',
    name: 'Marcus Vance',
    role: 'Senior Systems Engineer',
    email: 'marcus.vance@demo.vyoma.dev',
    avatar: '/demo-avatars/pro_avatar4.jpg',
    initials: 'MV',
    isDemo: true,
    lastMessage: 'Benchmark results: 0.8ms average latency on the Raft cluster.',
    lastTime: 'Yesterday',
    unread: 0
  },
  {
    id: 'demo-alex',
    name: 'Alexander Wright',
    role: 'AI Systems Engineer',
    email: 'alexander.wright@demo.vyoma.dev',
    avatar: '/demo-avatars/pro_avatar3.jpg',
    initials: 'AW',
    isDemo: true,
    lastMessage: 'Just connected the vector search engine to the live workspace container.',
    lastTime: 'Oct 1',
    unread: 0
  }
];

const INITIAL_CONVERSATIONS = {
  'demo-sarah': [
    { id: 1, text: 'Hey Ayush! How is the live workspace WebRTC integration going?', time: '11:15 AM', isMe: false },
    { id: 2, text: 'Hey Sarah! Just verified audio streams and zero-latency file sync.', time: '11:18 AM', isMe: true },
    { id: 3, text: 'The new multi-cursor canvas sync is looking super smooth!', time: '11:20 AM', isMe: false }
  ],
  'demo-vikram': [
    { id: 1, text: 'Hello Ayush, this is Vikram from Apex Quantum Labs.', time: '10:00 AM', isMe: false },
    { id: 2, text: 'Hi Ayush, loved your architecture. Would love to discuss our Senior Lead role!', time: '10:05 AM', isMe: false }
  ],
  'demo-marcus': [
    { id: 1, text: 'Running the Raft consensus performance tests now.', time: 'Yesterday', isMe: false },
    { id: 2, text: 'Benchmark results: 0.8ms average latency on the Raft cluster.', time: 'Yesterday', isMe: false }
  ],
  'demo-alex': [
    { id: 1, text: 'Just connected the vector search engine to the live workspace container.', time: 'Oct 1', isMe: false }
  ]
};

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('da_chat_contacts');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_DEMO_CONTACTS;
    } catch { return INITIAL_DEMO_CONTACTS; }
  });

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('da_chat_messages');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch { return INITIAL_CONVERSATIONS; }
  });

  const [activeChat, setActiveChat] = useState('demo-sarah');
  const [msgInput, setMsgInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [globalUsers, setGlobalUsers] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/users/discover`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    })
    .then(r => r.json())
    .then(data => {
      if (!data.error && data.users) {
        setGlobalUsers(data.users.filter(u => u.email !== user?.email));
      }
    })
    .catch(() => {});
  }, [user]);

  useEffect(() => {
    localStorage.setItem('da_chat_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('da_chat_messages', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChat) return;

    const msg = {
      id: Date.now(),
      text: msgInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isMe: true
    };

    setConversations(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), msg]
    }));

    setContacts(prev => prev.map(c => 
      c.id === activeChat 
        ? { ...c, lastMessage: msgInput.trim(), lastTime: msg.time, unread: 0 } 
        : c
    ));

    setMsgInput('');

    // Simulated reply from demo user
    setTimeout(() => {
      const activeC = contacts.find(c => c.id === activeChat);
      if (activeC && activeC.isDemo) {
        const replyMsg = {
          id: Date.now() + 1,
          text: `Thanks for the update, Ayush! Looking forward to collaborating on this.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          isMe: false
        };
        setConversations(prev => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), replyMsg]
        }));
      }
    }, 1500);
  };

  const handleStartChatWithUser = (u) => {
    const existing = contacts.find(c => c.id === u.id || c.email === u.email);
    if (existing) {
      setActiveChat(existing.id);
      setShowNewChat(false);
      return;
    }
    const newC = {
      id: u.id || 'contact_' + Date.now(),
      name: u.name,
      role: u.role || 'Member',
      email: u.email,
      avatar: u.profile_photo || null,
      initials: (u.name || 'U').slice(0, 2).toUpperCase(),
      isDemo: u.isDemo !== false,
      lastMessage: 'Conversation started',
      lastTime: 'Now',
      unread: 0
    };
    setContacts(prev => [newC, ...prev]);
    setActiveChat(newC.id);
    setShowNewChat(false);
  };

  const filteredContacts = (contacts || []).filter(c =>
    c && (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const activeChatContact = (contacts || []).find(c => c && c.id === activeChat);
  const activeChatMessages = (conversations || {})[activeChat] || [];

  return (
    <div className="h-[calc(100vh-80px)] flex bg-transparent text-white overflow-hidden relative font-sans">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Left Sidebar — Contact List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-xl shrink-0 relative z-10 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white">Direct Messages</h1>
            <p className="text-xs text-gray-500">Collaborator & Recruiter Chat</p>
          </div>
          <button 
            onClick={() => setShowNewChat(true)} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            title="New Chat"
          >
            <Plus size={18} className="text-cyan-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map(contact => (
            <div
              key={contact.id}
              onClick={() => {
                setActiveChat(contact.id);
                setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/5 ${
                activeChat === contact.id ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              {contact.avatar ? (
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0 shadow-md" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
                  {contact.initials || 'U'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm font-semibold truncate text-white">{contact.name}</span>
                    {contact.isDemo && (
                      <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest shrink-0">
                        demo
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0">{contact.lastTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 truncate">{contact.lastMessage}</span>
                  {contact.unread > 0 && (
                    <span className="bg-cyan-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Chat Messages */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChatContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-xl shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 hover:bg-white/10 rounded-full mr-1">
                  <ArrowLeft size={18} />
                </button>
                {activeChatContact.avatar ? (
                  <img src={activeChatContact.avatar} alt={activeChatContact.name} className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {activeChatContact.initials || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-semibold text-white truncate">{activeChatContact.name}</h2>
                    {activeChatContact.isDemo && (
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                        demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{activeChatContact.role || activeChatContact.email}</p>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeChatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    msg.isMe 
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                      : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-xl flex items-center gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder={`Message ${activeChatContact.name}...`}
                className="flex-1 bg-[#111] border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
              />
              <button
                type="submit"
                className="w-9 h-9 bg-cyan-400 text-black hover:bg-cyan-300 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-lg"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 text-gray-700" />
            <p className="text-sm font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewChat(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0d] border border-white/15 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Start New Chat</h2>
                <button onClick={() => setShowNewChat(false)} className="p-1.5 text-gray-400 hover:text-white rounded-full">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {INITIAL_DEMO_CONTACTS.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleStartChatWithUser(u)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-xs font-bold">
                        {u.initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.isDemo && <span className="text-[8px] px-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded uppercase">demo</span>}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{u.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
