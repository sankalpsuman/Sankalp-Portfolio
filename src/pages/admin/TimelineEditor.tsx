import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Milestone, Plus, Trash2, Edit2, Loader2, Save, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface TimelineMilestone {
  id?: string;
  title: string;
  company: string;
  date: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  translations?: Record<string, any>;
}

export default function TimelineEditor() {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TimelineMilestone | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const getEditingFieldVal = (field: 'title' | 'company' | 'description' | 'date') => {
    if (!editing) return '';
    if (activeEditorLang === 'en') {
      return editing[field] || '';
    }
    return editing.translations?.[activeEditorLang]?.[field] || '';
  };

  const setEditingFieldVal = (field: 'title' | 'company' | 'description' | 'date', val: string) => {
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

  const handleMilestoneAutoTranslate = async () => {
    if (!editing) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        title: editing.title,
        company: editing.company,
        description: editing.description,
        date: editing.date
      });
      if (docWithTranslations.translations) {
        setEditing({
          ...editing,
          translations: docWithTranslations.translations
        });
        alert('Milestone translation generated successfully! Review language tabs and save changes.');
      }
    } catch (error) {
      console.error(error);
      alert('Translation failed.');
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    const data = await getCollection<TimelineMilestone>('timeline', 'order');
    setMilestones(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    
    try {
      if (editing.id) {
        await updateCollectionDocument('timeline', editing.id, editing);
      } else {
        await addCollectionDocument('timeline', { ...editing, order: milestones.length });
      }
      setEditing(null);
      loadMilestones();
    } catch (error) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setSaving(true);
    await deleteCollectionDocument('timeline', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
    setSaving(false);
    loadMilestones();
  };

  const handleStartEdit = (item: TimelineMilestone) => {
    setActiveEditorLang('en');
    setEditing(item);
  };

  const handleStartCreate = () => {
    setActiveEditorLang('en');
    setEditing({ title: '', company: '', date: '', description: '', icon: 'Briefcase', color: '#3b82f6', order: milestones.length });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Milestone className="text-purple-500" />
          Career Journey Management
        </h2>
        <button 
          onClick={() => setEditing({ title: '', company: '', date: '', description: '', icon: 'Briefcase', color: '#3b82f6', order: milestones.length })}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {milestones.map((item, idx) => (
          <div key={item.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                <Milestone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.company} • {item.date}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleStartEdit(item)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => setDeleteModal({ isOpen: true, id: item.id! })} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        isLoading={saving}
        title="Delete Milestone"
        message="Are you sure you want to delete this career milestone? This cannot be undone."
      />

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSave}
              className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-lg"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-lg">{editing.id ? 'Edit Milestone' : 'New Milestone'}</h3>
                <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              {/* Language Switcher Tabs */}
              <div className="p-4 mx-6 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-gray-300">Milestone Localization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
                    {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveEditorLang(lang)}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer",
                          activeEditorLang === lang 
                            ? "bg-blue-600 text-white" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleMilestoneAutoTranslate}
                    disabled={translating || !editing.title}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 disabled:opacity-50 text-blue-400 rounded-lg text-xs font-bold transition-all border border-blue-500/20 cursor-pointer"
                  >
                    {translating ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                    <span>Auto-Translate</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">
                      Title {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                    </label>
                    <input 
                      required
                      value={getEditingFieldVal('title')}
                      onChange={e => setEditingFieldVal('title', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-sm text-white font-bold" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">
                      Company {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                    </label>
                    <input 
                      required
                      value={getEditingFieldVal('company')}
                      onChange={e => setEditingFieldVal('company', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-sm text-white font-semibold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">
                      Date Range (e.g. 2021 - Present) {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                    </label>
                    <input 
                      required
                      value={getEditingFieldVal('date')}
                      onChange={e => setEditingFieldVal('date', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-sm text-white font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Color (Hex)</label>
                    <input 
                      type="color"
                      value={editing.color}
                      onChange={e => setEditing({...editing, color: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-[46px] p-2 outline-none cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500">
                    Description {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                  </label>
                  <textarea 
                    rows={3}
                    value={getEditingFieldVal('description')}
                    onChange={e => setEditingFieldVal('description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-sm resize-none text-gray-300" 
                  />
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                  <button type="submit" disabled={saving} className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Milestone
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
