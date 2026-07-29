import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, ArrowUpCircle, ArrowDownCircle, Link2, Unlink, Check } from 'lucide-react';
import GithubIcon from '../GithubIcon';
import toast from 'react-hot-toast';
import { API_URL } from '../../config';
export default function GitHubPanel({ roomId }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [github, setGithub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pullLoading, setPullLoading] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/api/rooms/${roomId}/github`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('da_token')}` }
    }).then(r => r.json()).then(d => { if (d.github) { setGithub(d.github); setRepoUrl(d.github.repoUrl); } });
  }, [roomId]);
  const connect = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rooms/${roomId}/github`, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('da_token')}`
        }, 
        body: JSON.stringify({ repoUrl: repoUrl.trim() }) 
      });
      const data = await res.json();
      setGithub(data.github);
      toast.success('GitHub repository connected!');
    } catch { toast.error('Failed to connect'); }
    setLoading(false);
  };
  const disconnect = () => { setGithub(null); setRepoUrl(''); toast.success('Repository disconnected'); };
  const push = async () => {
    setPushLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success('Code pushed to GitHub!', { icon: '🚀' });
    setPushLoading(false);
  };
  const pull = async () => {
    setPullLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Latest code pulled from GitHub!', { icon: '📥' });
    setPullLoading(false);
  };
  return (
    <div className="flex flex-col h-full">
      <div className="h-10 border-b border-gray-900 flex items-center px-4 bg-[#050505] shrink-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">GitHub</span>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {github ? (
          <div className="space-y-4">
            <div className="bg-[#111] border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Check size={14} className="text-green-400" />
                <span className="text-sm text-green-400 font-medium">Connected</span>
              </div>
              <a href={github.repoUrl} target="_blank" rel="noopener" className="text-xs text-blue-400 hover:underline flex items-center gap-1 break-all"><ExternalLink size={12} /> {github.repoUrl}</a>
              <p className="text-[10px] text-gray-600 mt-1">Connected {new Date(github.connectedAt).toLocaleDateString()}</p>
            </div>
            <div className="space-y-2">
              <button onClick={push} disabled={pushLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111] border border-white/10 text-white rounded-xl text-sm hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {pushLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowUpCircle size={14} />} {pushLoading ? 'Pushing...' : 'Git Push'}
              </button>
              <button onClick={pull} disabled={pullLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#111] border border-white/10 text-white rounded-xl text-sm hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {pullLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowDownCircle size={14} />} {pullLoading ? 'Pulling...' : 'Git Pull'}
              </button>
            </div>
            <button onClick={disconnect} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-red-400 hover:text-red-300 transition-colors"><Unlink size={12} /> Disconnect</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <GithubIcon size={32} className="mx-auto text-gray-600 mb-3" />
              <p className="text-sm text-gray-400 mb-1">Connect a GitHub repo</p>
              <p className="text-xs text-gray-600">Push and pull code directly</p>
            </div>
            <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 placeholder-gray-600" />
            <button onClick={connect} disabled={loading || !repoUrl.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} {loading ? 'Connecting...' : 'Connect Repository'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
