import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Target, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

interface ImpactStory {
  id?: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  tools: string[];
  metrics: string[];
  order: number;
}

export default function ImpactStoriesEditor() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ImpactStory | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    setLoading(true);
    const data = await getCollection<ImpactStory>('impactStories', 'order');
    setStories(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setSaving(true);
    await deleteCollectionDocument('impactStories', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
    setSaving(false);
    loadStories();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await updateCollectionDocument('impactStories', editing.id, editing);
      else await addCollectionDocument('impactStories', { ...editing, order: stories.length });
      setEditing(null);
      loadStories();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Target className="text-emerald-500" /> Impact Stories</h2>
        <button onClick={() => setEditing({ title: '', problem: '', solution: '', impact: '', tools: [], metrics: [], order: stories.length })} className="bg-emerald-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Story</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stories.map(story => (
          <div key={story.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{story.title}</h3><p className="text-xs text-gray-500 line-clamp-1">{story.impact}</p></div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(story)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => setDeleteModal({ isOpen: true, id: story.id! })} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        isLoading={saving}
        title="Delete Impact Story"
        message="Are you sure you want to delete this impact story? This action cannot be reversed."
      />

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="font-bold">Impact Story Detail</h3><button type="button" onClick={() => setEditing(null)}><X /></button></div>
              <div className="space-y-4">
                <input required placeholder="Story Title" value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <textarea required placeholder="The Problem" value={editing.problem} onChange={e => setEditing({...editing, problem: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24" />
                <textarea required placeholder="The Solution" value={editing.solution} onChange={e => setEditing({...editing, solution: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24" />
                <textarea required placeholder="Business Impact" value={editing.impact} onChange={e => setEditing({...editing, impact: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-emerald-600 rounded-xl font-bold flex justify-center items-center gap-2">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Story</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
