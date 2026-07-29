import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';

export default function Terminal({ roomId, isRunning, runOutput }) {
  const [history, setHistory] = useState([
    { type: 'system', text: '$ Vyoma Terminal v2.0' },
    { type: 'info', text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history, runOutput]);
  useEffect(() => {
    if (runOutput && runOutput.length > 0) {
      setHistory(prev => [...prev, ...runOutput]);
    }
  }, [runOutput]);
  const colors = { command: 'text-yellow-400', output: 'text-gray-200', error: 'text-red-400', warn: 'text-amber-400', success: 'text-green-400', info: 'text-blue-400', system: 'text-gray-500' };
  const exec = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const cmd = input.trim();
    setHistory(prev => [...prev, { type: 'command', text: `$ ${cmd}` }]);
    setInput('');
    if (cmd === 'clear' || cmd === 'cls') { setHistory([]); return; }
    if (cmd === 'help') {
      setHistory(prev => [...prev, { type: 'info', text: 'Available commands: Any bash/shell command (e.g. ls, pwd, echo).' }]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('da_token')}` },
        body: JSON.stringify({ code: cmd, language: 'bash', filename: 'shell' })
      });
      const data = await res.json();
      (data.output || []).forEach(t => {
        setHistory(prev => [...prev, { type: t.startsWith('[ERROR]') ? 'error' : 'output', text: t }]);
      });
    } catch (err) {
      setHistory(prev => [...prev, { type: 'error', text: err.message }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };
  return (
    <div className="flex flex-col h-full" onClick={() => inputRef.current?.focus()}>
      <div className="h-10 border-b border-gray-900 flex items-center justify-between px-4 bg-[#050505] shrink-0">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Terminal</span>
        <button onClick={() => setHistory([])} className="text-gray-600 hover:text-gray-300 transition-colors" title="Clear"><Trash2 size={14} /></button>
      </div>
      <div className="flex-1 p-3 font-mono text-xs overflow-auto">
        {history.map((line, i) => (
          <p key={i} className={`${colors[line.type] || 'text-gray-400'} mb-0.5 whitespace-pre-wrap break-all`}>{line.text}</p>
        ))}
        {(isRunning || loading) && (
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-3 bg-gray-500 mt-1" />
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={exec} className="flex items-center gap-2 px-3 py-2 border-t border-gray-900 bg-[#050505] shrink-0">
        <span className="text-green-400 text-xs font-mono shrink-0">~/workspace $</span>
        <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a command..." className="flex-1 bg-transparent text-xs font-mono text-white focus:outline-none placeholder-gray-600" disabled={loading} />
      </form>
    </div>
  );
}
