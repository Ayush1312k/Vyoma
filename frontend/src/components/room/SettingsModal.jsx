import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Monitor, Type, AlignLeft, Keyboard, Palette } from 'lucide-react';
export default function SettingsModal({ settings, onSave, onClose }) {
  const [s, setS] = useState({ ...settings });
  const handleSave = () => { onSave(s); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 shadow-2xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Room Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"><Palette size={14} /> Editor Theme</label>
            <select value={s.theme} onChange={e => setS({...s, theme: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none appearance-none">
              <option value="vs-dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="hc-black">High Contrast</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"><Type size={14} /> Font Size</label>
            <input type="range" min="10" max="24" value={s.fontSize} onChange={e => setS({...s, fontSize: +e.target.value})} className="w-full" />
            <span className="text-xs text-gray-500">{s.fontSize}px</span>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"><Keyboard size={14} /> Tab Size</label>
            <div className="flex gap-2">
              {[2, 4, 8].map(v => (
                <button key={v} onClick={() => setS({...s, tabSize: v})} className={`px-4 py-1.5 rounded-lg text-sm ${s.tabSize === v ? 'bg-white text-black' : 'bg-[#111] text-gray-400 border border-white/10 hover:border-white/20'}`}>{v}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"><AlignLeft size={14} /> Word Wrap</label>
            <button onClick={() => setS({...s, wordWrap: !s.wordWrap})} className={`px-4 py-1.5 rounded-lg text-sm ${s.wordWrap ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-[#111] text-gray-400 border border-white/10'}`}>{s.wordWrap ? 'On' : 'Off'}</button>
          </div>

          <div className="border-t border-white/5 pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2"><Monitor size={14} /> Keyboard Shortcuts</label>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="text-gray-300 font-mono bg-[#111] px-1 rounded">Ctrl+S</span> Save</p>
              <p><span className="text-gray-300 font-mono bg-[#111] px-1 rounded">Ctrl+Enter</span> Run Code</p>
              <p><span className="text-gray-300 font-mono bg-[#111] px-1 rounded">Ctrl+B</span> Toggle Sidebar</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2"><Save size={14} /> Save Settings</button>
        </div>
      </motion.div>
    </div>
  );
}
