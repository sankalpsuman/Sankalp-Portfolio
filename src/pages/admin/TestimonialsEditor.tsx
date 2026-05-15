import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Star, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  order: number;
}

export default function TestimonialsEditor() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await getCollection<Testimonial>('testimonials', 'order');
    setTestimonials(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await updateCollectionDocument('testimonials', editing.id, editing);
      else await addCollectionDocument('testimonials', { ...editing, order: testimonials.length });
      setEditing(null);
      load();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-yellow-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Star className="text-yellow-500 fill-yellow-500" /> Testimonials</h2>
        <button onClick={() => setEditing({ name: '', role: '', company: '', content: '', rating: 5, order: testimonials.length })} className="bg-yellow-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(item => (
          <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{item.name}</h3><p className="text-xs text-gray-500">{item.role} @ {item.company}</p></div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(item)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteCollectionDocument('testimonials', item.id!).then(load)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="font-bold">Testimonial Detail</h3><button type="button" onClick={() => setEditing(null)}><X /></button></div>
              <div className="space-y-4">
                <input required placeholder="Name" value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <div className="grid grid-cols-2 gap-2">
                   <input required placeholder="Role" value={editing.role} onChange={e => setEditing({...editing, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs" />
                   <input required placeholder="Company" value={editing.company} onChange={e => setEditing({...editing, company: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs" />
                </div>
                <textarea required placeholder="Testimonial content..." value={editing.content} onChange={e => setEditing({...editing, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32 text-sm" />
                <div className="flex items-center gap-2">
                   <label className="text-xs text-gray-400">Rating:</label>
                   <input type="number" min="1" max="5" value={editing.rating} onChange={e => setEditing({...editing, rating: parseInt(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-2 w-16" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-yellow-600 rounded-xl font-bold flex justify-center items-center gap-2">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Testimonial</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
