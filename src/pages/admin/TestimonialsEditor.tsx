import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Star, Plus, Trash2, Edit2, Loader2, Save, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface Testimonial {
  id?: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  order: number;
  translations?: Record<string, any>;
}

export default function TestimonialsEditor() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const data = await getCollection<Testimonial>('testimonials', 'order');
    setTestimonials(data);
    setLoading(false);
  };

  const getEditingFieldVal = (field: 'name' | 'role' | 'company' | 'content') => {
    if (!editing) return '';
    if (activeEditorLang === 'en') {
      return editing[field] || '';
    }
    return editing.translations?.[activeEditorLang]?.[field] || '';
  };

  const setEditingFieldVal = (field: 'name' | 'role' | 'company' | 'content', val: string) => {
    if (!editing) return;
    if (activeEditorLang === 'en') {
      setEditing({ ...editing, [field]: val });
    } else {
      const translations = editing.translations || {};
      const langData = translations[activeEditorLang] || {};
      setEditing({
        ...editing,
        translations: {
          ...translations,
          [activeEditorLang]: {
            ...langData,
            [field]: val
          }
        }
      });
    }
  };

  const handleTestimonialAutoTranslate = async () => {
    if (!editing) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        name: editing.name,
        role: editing.role,
        company: editing.company,
        content: editing.content
      });
      if (docWithTranslations.translations) {
        setEditing({
          ...editing,
          translations: docWithTranslations.translations
        });
        alert('Testimonial translation generated successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const handleStartEdit = (item: Testimonial) => {
    setActiveEditorLang('en');
    setEditing(item);
  };

  const handleStartCreate = () => {
    setActiveEditorLang('en');
    setEditing({ name: '', role: '', company: '', content: '', rating: 5, order: testimonials.length });
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
        <button onClick={handleStartCreate} className="bg-yellow-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Testimonial</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(item => (
          <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{item.name}</h3><p className="text-xs text-gray-500">{item.role} @ {item.company}</p></div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleStartEdit(item)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
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
              
              {/* Language switcher */}
              <div className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Localization</span>
                  <button
                    type="button"
                    onClick={handleTestimonialAutoTranslate}
                    disabled={translating || !editing.content}
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 disabled:opacity-50"
                  >
                    {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                    Auto-Translate
                  </button>
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
                  {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveEditorLang(lang)}
                      className={cn(
                        "flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-all duration-150 cursor-pointer text-center",
                        activeEditorLang === lang 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <input required placeholder="Name" value={getEditingFieldVal('name')} onChange={e => setEditingFieldVal('name', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold" />
                <div className="grid grid-cols-2 gap-2">
                   <input required placeholder="Role" value={getEditingFieldVal('role')} onChange={e => setEditingFieldVal('role', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
                   <input required placeholder="Company" value={getEditingFieldVal('company')} onChange={e => setEditingFieldVal('company', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
                </div>
                <textarea required placeholder="Testimonial content..." value={getEditingFieldVal('content')} onChange={e => setEditingFieldVal('content', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32 text-sm text-gray-300" />
                <div className="flex items-center gap-2">
                   <label className="text-xs text-gray-400">Rating:</label>
                   <input type="number" min="1" max="5" value={editing.rating} onChange={e => setEditing({...editing, rating: parseInt(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-2 w-16 text-white" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-yellow-600 rounded-xl font-bold flex justify-center items-center gap-2 text-white">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Testimonial</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
