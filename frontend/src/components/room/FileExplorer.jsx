import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Plus, Trash2, FilePlus, FolderPlus } from 'lucide-react';
const EXT_LANG = { js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',py:'python',html:'html',css:'css',json:'json',dart:'dart',md:'markdown',yml:'yaml',yaml:'yaml',go:'go',rs:'rust',swift:'swift',kt:'kotlin',java:'java',cpp:'cpp',c:'c',rb:'ruby',php:'php',sql:'sql',sh:'shell',txt:'plaintext',xml:'xml' };
export const getLang = (f) => EXT_LANG[f.split('.').pop()?.toLowerCase()] || 'plaintext';
const FILE_ICONS = { javascript:'text-yellow-400',python:'text-blue-400',html:'text-orange-400',css:'text-blue-300',json:'text-green-400',dart:'text-cyan-400',markdown:'text-gray-400',yaml:'text-pink-400',typescript:'text-blue-500',go:'text-cyan-300',rust:'text-orange-300' };
function buildTree(files) {
  const tree = {};
  Object.keys(files).sort().forEach(p => {
    const parts = p.split('/');
    let cur = tree;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) { cur[part] = { _type: 'file', _path: p, _lang: files[p].language }; }
      else { if (!cur[part]) cur[part] = { _type: 'folder', _children: {} }; cur = cur[part]._children; }
    });
  });
  return tree;
}
function TreeNode({ name, node, depth, activeFile, onSelect, onDelete }) {
  const [open, setOpen] = useState(true);
  if (node._type === 'file') {
    const active = activeFile === node._path;
    const iconColor = FILE_ICONS[node._lang] || 'text-gray-400';
    return (
      <div onClick={() => onSelect(node._path)} className={`flex items-center gap-2 py-1 px-2 cursor-pointer text-sm rounded-md group ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`} style={{ paddingLeft: depth * 12 + 8 }}>
        <FileText size={14} className={iconColor} />
        <span className="truncate flex-1">{name}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(node._path); }} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity"><Trash2 size={12} /></button>
      </div>
    );
  }
  const children = node._children || {};
  return (
    <div>
      <div onClick={() => setOpen(!open)} className="flex items-center gap-1 py-1 px-2 cursor-pointer text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md" style={{ paddingLeft: depth * 12 + 8 }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />}
        <span className="ml-1">{name}</span>
      </div>
      {open && Object.entries(children).sort(([,a],[,b]) => (a._type==='folder'?0:1)-(b._type==='folder'?0:1)).map(([k, v]) => (
        <TreeNode key={k} name={k} node={v} depth={depth + 1} activeFile={activeFile} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}
export default function FileExplorer({ files, activeFile, onSelect, onDelete, onCreate }) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const tree = buildTree(files);
  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setShowNew(false);
  };
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Explorer</span>
        <div className="flex gap-1">
          <button onClick={() => setShowNew(!showNew)} className="p-1 text-gray-500 hover:text-white rounded transition-colors" title="New File"><FilePlus size={14} /></button>
          <button onClick={() => { const n = prompt('Folder name:'); if (n) onCreate(n.trim() + '/untitled.txt'); }} className="p-1 text-gray-500 hover:text-white rounded transition-colors" title="New Folder"><FolderPlus size={14} /></button>
        </div>
      </div>
      {showNew && (
        <form onSubmit={handleCreate} className="px-2 py-2 border-b border-white/5">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="filename.ext" className="w-full bg-[#111] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30" />
        </form>
      )}
      <div className="flex-1 overflow-auto py-1">
        {Object.entries(tree).sort(([,a],[,b]) => (a._type==='folder'?0:1)-(b._type==='folder'?0:1)).map(([k, v]) => (
          <TreeNode key={k} name={k} node={v} depth={0} activeFile={activeFile} onSelect={onSelect} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
