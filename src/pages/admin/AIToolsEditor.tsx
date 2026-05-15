import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Bot, Plus, Trash2, Edit2, Loader2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface AITool {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  placeholder: string;
  enabled: boolean;
  order: number;
}

export default function AIToolsEditor() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AITool | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadTools(); }, []);

  const loadTools = async () => {
    setLoading(true);
    const data = await getCollection<AITool>('aiTools', 'order');
    setTools(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await updateCollectionDocument('aiTools', editing.id, editing);
      else await addCollectionDocument('aiTools', { ...editing, order: tools.length });
      setEditing(null);
      loadTools();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Bot className="text-purple-500" /> AI Playground Tools</h2>
        <button onClick={() => setEditing({ name: '', description: '', prompt: '', icon: 'Zap', placeholder: '', enabled: true, order: tools.length })} className="bg-purple-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New AI Tool</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tools.map(tool => (
          <div key={tool.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div className="flex items-center gap-4">
               <div className={cn("p-2 rounded-lg", tool.enabled ? "bg-purple-600/20 text-purple-400" : "bg-gray-800 text-gray-500")}><Bot className="w-5 h-5" /></div>
               <div><h3 className="font-bold">{tool.name}</h3><p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateCollectionDocument('aiTools', tool.id!, { enabled: !tool.enabled }).then(loadTools)} className="p-2 hover:bg-white/10 rounded-lg">{tool.enabled ? <ToggleRight className="text-purple-500" /> : <ToggleLeft className="text-gray-600" />}</button>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => setEditing(tool)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                 <button onClick={() => deleteCollectionDocument('aiTools', tool.id!).then(loadTools)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="font-bold">AI Tool Configuration</h3><button type="button" onClick={() => setEditing(null)}><X /></button></div>
              <div className="space-y-4">
                <input required placeholder="Tool Name (e.g. Bug Report Generator)" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <input required placeholder="Description" value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <textarea required placeholder="AI System Prompt (Instructions for Gemini)" value={editing.prompt} onChange={e => setEditing({...editing, prompt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-40 font-mono text-xs" />
                <input placeholder="Input Placeholder Text" value={editing.placeholder} onChange={e => setEditing({...editing, placeholder: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-purple-600 rounded-xl font-bold flex justify-center items-center gap-2">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Tool</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
