import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Target, Plus, Trash2, Edit2, Loader2, Save, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { cn } from '../../lib/utils';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface ImpactStory {
  id?: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  tools: string[];
  metrics: string[];
  order: number;
  translations?: Record<string, any>;
}

export default function ImpactStoriesEditor() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ImpactStory | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    setLoading(true);
    const data = await getCollection<ImpactStory>('impactStories', 'order');
    setStories(data);
    setLoading(false);
  };

  const getEditingFieldVal = (field: 'title' | 'problem' | 'solution' | 'impact') => {
    if (!editing) return '';
    if (activeEditorLang === 'en') {
      return editing[field] || '';
    }
    return editing.translations?.[activeEditorLang]?.[field] || '';
  };

  const setEditingFieldVal = (field: 'title' | 'problem' | 'solution' | 'impact', val: string) => {
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

  const handleStoryAutoTranslate = async () => {
    if (!editing) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        title: editing.title,
        problem: editing.problem,
        solution: editing.solution,
        impact: editing.impact
      });
      if (docWithTranslations.translations) {
        setEditing({
          ...editing,
          translations: docWithTranslations.translations
        });
        alert('Story translated successfully! Review tabs and save.');
      }
    } catch (error) {
      console.error(error);
      alert('Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  const handleStartEdit = (story: ImpactStory) => {
    setActiveEditorLang('en');
    setEditing(story);
  };

  const handleStartCreate = () => {
    setActiveEditorLang('en');
    setEditing({ title: '', problem: '', solution: '', impact: '', tools: [], metrics: [], order: stories.length });
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
        <button onClick={handleStartCreate} className="bg-emerald-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Story</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stories.map(story => (
          <div key={story.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{story.title}</h3><p className="text-xs text-gray-500 line-clamp-1">{story.impact}</p></div>
            <div className="flex gap-2">
              <button onClick={() => handleStartEdit(story)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
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
              
              {/* Language Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-gray-300 font-mono">Story Translation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg animate-in fade-in duration-200">
                    {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveEditorLang(lang)}
                        className={cn(
                          "px-2.5 py-1 rounded text-xs font-bold uppercase transition-all duration-150 cursor-pointer",
                          activeEditorLang === lang 
                            ? "bg-emerald-600 text-white shadow" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleStoryAutoTranslate}
                    disabled={translating || !editing.title}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 disabled:opacity-50 text-emerald-400 rounded-lg text-xs font-bold transition-all border border-emerald-500/20 cursor-pointer"
                  >
                    {translating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                    <span>Auto-Translate</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-1 block mb-1">
                    Story Title {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                  </label>
                  <input required placeholder="Story Title" value={getEditingFieldVal('title')} onChange={e => setEditingFieldVal('title', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-1 block mb-1">
                    The Problem {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                  </label>
                  <textarea required placeholder="The Problem" value={getEditingFieldVal('problem')} onChange={e => setEditingFieldVal('problem', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 text-gray-300 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-1 block mb-1">
                    The Solution {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                  </label>
                  <textarea required placeholder="The Solution" value={getEditingFieldVal('solution')} onChange={e => setEditingFieldVal('solution', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 text-gray-300 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-1 block mb-1">
                    Business Impact {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                  </label>
                  <textarea required placeholder="Business Impact" value={getEditingFieldVal('impact')} onChange={e => setEditingFieldVal('impact', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-24 text-gray-300 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-emerald-600 rounded-xl font-bold flex justify-center items-center gap-2 text-white">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Story</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

