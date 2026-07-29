import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Plus, X, Users, MessageSquare, ArrowLeft, Phone, Video, MoreVertical, Smile, Image, Paperclip, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

const Chat = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('da_chat_contacts');
      return saved && saved !== 'undefined' ? JSON.parse(saved) || [] : [];
    } catch { return []; }
  });
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('da_chat_messages');
      return saved && saved !== 'undefined' ? JSON.parse(saved) || {} : {};
    } catch { return {}; }
  });
  const [activeChat, setActiveChat] = useState(null);
  const [msgInput, setMsgInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [globalUsers, setGlobalUsers] = useState([]);
  const [newChatSearch, setNewChatSearch] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/auth');
    const controller = new AbortController();
    if (isAuthenticated) {
      fetch(`${API_URL}/api/users/discover`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        signal: controller.signal
      }).then(r => r.json()).then(data => {
        if (!data.error && data.users) {
          setGlobalUsers(data.users.filter(u => u.email !== user?.email));
        }
      }).catch(() => {});
    }
    return () => controller.abort();
  }, [isAuthenticated, authLoading, navigate, user]);

  useEffect(() => {
    localStorage.setItem('da_chat_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('da_chat_messages', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    const timer = setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => clearTimeout(timer);
  }, [activeChat, conversations]);

  const startGlobalChat = (globalUser) => {
    const existingContact = contacts.find(c => c.email === globalUser.email);
    if (existingContact) {
      setActiveChat(existingContact.id);
      setShowNewChat(false);
      return;
    }
    const id = 'contact_' + globalUser.id;
    const contact = {
      id,
      name: globalUser.name || 'Unknown',
      email: globalUser.email,
      username: globalUser.username,
      type: 'direct',
      initials: (globalUser.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      lastSeen: 'Online',
      unread: 0
    };
    setContacts(prev => [contact, ...prev]);
    setConversations(prev => ({ ...prev, [id]: [] }));
    setShowNewChat(false);
    setActiveChat(id);
    toast.success(`Chat started with ${contact.name}!`);
  };

  const createGroup = () => {
    if (!groupName.trim()) return;
    const id = 'group_' + Date.now();
    const members = groupMembers.split(',').map(m => m.trim()).filter(Boolean);
    const group = {
      id,
      name: groupName.trim(),
      type: 'group',
      members: [user?.name, ...members],
      initials: groupName.trim().slice(0, 2).toUpperCase(),
      lastSeen: `${members.length + 1} members`,
      unread: 0
    };
    setContacts(prev => [group, ...prev]);
    setConversations(prev => ({ ...prev, [id]: [] }));
    setGroupName('');
    setGroupMembers('');
    setShowNewGroup(false);
    setActiveChat(id);
    toast.success(`Group "${group.name}" created!`);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChat) return;
    const msg = {
      id: Date.now(),
      text: msgInput.trim(),
      sender: user?.name || 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isMe: true
    };
    setConversations(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), msg]
    }));
    // Update last message for contact
    setContacts(prev => prev.map(c => c.id === activeChat ? { ...c, lastMessage: msgInput.trim(), lastTime: msg.time } : c));
    setMsgInput('');
  };

  const filteredContacts = Array.isArray(contacts) ? contacts.filter(c =>
    c && (c.name || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  ) : [];

  const activeChatContact = Array.isArray(contacts) ? contacts.find(c => c && c.id === activeChat) : null;
  const activeChatMessages = (conversations || {})[activeChat] || [];

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-transparent text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>
      {/* Left Sidebar — Contact List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col bg-black/20 backdrop-blur-md shrink-0 relative z-10 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold">Messages</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowNewGroup(true)} className="glass-btn p-2" title="New Group">
              <Users size={18} className="text-gray-400" />
            </button>
            <button onClick={() => setShowNewChat(true)} className="glass-btn p-2" title="New Chat">
              <Plus size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-12 px-6">
              <MessageSquare size={40} className="mx-auto mb-4 text-gray-700" />
              <p className="font-medium mb-1">No conversations yet</p>
              <p className="text-xs text-gray-600">Click + to start a new chat or create a group</p>
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => setActiveChat(contact.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-white/5 ${
                  activeChat === contact.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  contact?.type === 'group' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {contact?.initials || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{contact?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-500">{contact?.lastTime || ''}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-xs text-gray-500 truncate">{contact?.lastMessage || (contact?.type === 'group' ? `${contact?.members?.length || 0} members` : contact?.email || 'Start chatting...')}</span>
                    {contact?.unread > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{contact.unread}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel — Chat Messages */}
      <div className={`flex-1 flex flex-col min-w-0 relative z-10 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && activeChatContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-black/20 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-white/5 rounded-lg">
                  <ArrowLeft size={18} />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  activeChatContact.type === 'group' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  {activeChatContact.initials}
                </div>
                <div>
                  <div className="text-sm font-medium">{activeChatContact.name}</div>
                  <div className="text-[10px] text-gray-500">{activeChatContact.lastSeen}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Phone size={18} /></button>
                <button className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Video size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeChatMessages.length === 0 && (
                <div className="text-center text-gray-600 text-sm py-16">
                  <p className="text-gray-500 mb-1">Start your conversation</p>
                  <p className="text-xs text-gray-600">Messages are stored locally on your device</p>
                </div>
              )}
              {activeChatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.isMe 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-bl-md'
                  }`}>
                    {!msg.isMe && activeChatContact.type === 'group' && (
                      <div className="text-[10px] text-blue-400 font-medium mb-1">{msg.sender}</div>
                    )}
                    <p>{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                      <span className="text-[10px]">{msg.time}</span>
                      {msg.isMe && <CheckCheck size={12} />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-2 shrink-0">
              <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors"><Smile size={20} /></button>
              <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors"><Paperclip size={20} /></button>
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Type a message..."
                aria-label="Type a message"
                className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
              />
              <button type="submit" className="glass-btn p-2.5">
                <Send size={18} className="text-white" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-6 text-gray-800" />
              <h2 className="text-xl font-medium text-gray-400 mb-2">Vyoma Messenger</h2>
              <p className="text-sm text-gray-600">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewChat(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">New Chat</h3>
                <button onClick={() => setShowNewChat(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={newChatSearch} 
                  onChange={(e) => setNewChatSearch(e.target.value)} 
                  placeholder="Search globally by name or @username..." 
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 text-sm mb-4" 
                />
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {globalUsers
                    .filter(u => u.name?.toLowerCase().includes(newChatSearch.toLowerCase()) || u.username?.toLowerCase().includes(newChatSearch.toLowerCase()))
                    .map(u => (
                      <div key={u.id} onClick={() => startGlobalChat(u)} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/10">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {(u.name || '').split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{u.name}</div>
                          <div className="text-xs text-gray-500">@{u.username || 'user'}</div>
                        </div>
                      </div>
                  ))}
                  {globalUsers.length === 0 && <div className="text-sm text-gray-500 text-center py-4">No users found on the network.</div>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Group Modal */}
      <AnimatePresence>
        {showNewGroup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNewGroup(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Create Group</h3>
                <button onClick={() => setShowNewGroup(false)} className="p-1.5 hover:bg-white/10 rounded-lg"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group Name" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 text-sm" />
                <div>
                  <input type="text" value={groupMembers} onChange={(e) => setGroupMembers(e.target.value)} placeholder="Members (comma separated names)" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/20 text-sm" />
                  <p className="text-[10px] text-gray-500 mt-1">e.g. John, Sarah, Alex</p>
                </div>
                <button onClick={createGroup} className="glass-btn w-full py-3 text-white font-medium">Create Group</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
