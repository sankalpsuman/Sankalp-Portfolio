import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Bot, Plus, Trash2, Edit2, Loader2, Save, X, ToggleLeft, ToggleRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { autoTranslateDocument, bulkAutoTranslateDocuments } from '../../lib/translationUtils';

interface AITool {
  id?: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  placeholder: string;
  enabled: boolean;
  order: number;
  translations?: Record<string, any>;
}

export default function AIToolsEditor() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AITool | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [saving, setSaving] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const getFieldVal = (field: 'name' | 'description' | 'placeholder') => {
    if (!editing) return '';
    if (activeEditorLang === 'en') {
      return editing[field] || '';
    }
    return editing.translations?.[activeEditorLang]?.[field] || '';
  };

  const setFieldVal = (field: 'name' | 'description' | 'placeholder', val: string) => {
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

  const handleAutoTranslate = async () => {
    if (!editing) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        name: editing.name,
        description: editing.description,
        placeholder: editing.placeholder
      });
      if (docWithTranslations.translations) {
        setEditing({
          ...editing,
          translations: {
            ...((editing as any).translations || {}),
            ...docWithTranslations.translations
          }
        });
        alert('Tool translations generated successfully! Review language tabs.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate automatic translations.');
    } finally {
      setTranslating(false);
    }
  };

  const handleAutoTranslateAll = async () => {
    if (tools.length === 0) return;
    setTranslating(true);
    try {
      const updated = await bulkAutoTranslateDocuments(tools);
      setTools(updated);
      alert('All AI tools auto-translated successfully! Don’t forget to save individual changes.');
    } catch (e) {
      console.error(e);
      alert('Bulk translation failed. Quota may be exhausted.');
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => { loadTools(); }, []);

  const loadTools = async () => {
    setLoading(true);
    const data = await getCollection<AITool>('aiTools', 'order');
    setTools(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setSaving(true);
    await deleteCollectionDocument('aiTools', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
    setSaving(false);
    loadTools();
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoTranslateAll}
            disabled={translating || tools.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-gray-300 rounded-lg text-xs font-bold transition-all border border-white/10 cursor-pointer"
            title="Translate ALL tools in one go"
          >
            {translating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>Bulk All</span>
          </button>
          <button onClick={() => { setActiveEditorLang('en'); setEditing({ name: '', description: '', prompt: '', icon: 'Zap', placeholder: '', enabled: true, order: tools.length }); }} className="bg-purple-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New AI Tool</button>
        </div>
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
              <div className="flex items-center gap-2">
                 <button onClick={() => { setActiveEditorLang('en'); setEditing(tool); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Edit Tool"><Edit2 className="w-4 h-4" /></button>
                 <button onClick={() => setDeleteModal({ isOpen: true, id: tool.id! })} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete Tool"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        isLoading={saving}
        title="Delete AI Tool"
        message="Are you sure you want to delete this AI tool? This will remove its prompt logic and configurations."
      />

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-purple-400" /> AI Tool Configuration</h3>
                <button type="button" onClick={() => setEditing(null)}><X /></button>
              </div>

              {/* Language Editor Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl w-full">
                {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveEditorLang(lang)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-[color,background-color] duration-200 cursor-pointer text-center",
                      activeEditorLang === lang 
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {lang}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={translating}
                  className="px-3 py-1 bg-purple-600/10 hover:bg-purple-600/20 disabled:opacity-50 text-purple-400 rounded-lg text-[9px] font-bold transition-all border border-purple-500/20"
                >
                  {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin inline-block" /> : 'Auto-Translate'}
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Tool Name ({activeEditorLang.toUpperCase()})</label>
                  <input required placeholder="Tool Name (e.g. Bug Report Generator)" value={getFieldVal('name')} onChange={e => setFieldVal('name', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Description ({activeEditorLang.toUpperCase()})</label>
                  <input required placeholder="Description" value={getFieldVal('description')} onChange={e => setFieldVal('description', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Input Placeholder ({activeEditorLang.toUpperCase()})</label>
                  <input placeholder="Input Placeholder Text" value={getFieldVal('placeholder')} onChange={e => setFieldVal('placeholder', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 outline-none" />
                </div>

                {activeEditorLang === 'en' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">AI System Prompt (Instructions - English Only)</label>
                    <textarea required placeholder="AI System Prompt (Instructions for Gemini)" value={editing.prompt} onChange={e => setEditing({...editing, prompt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32 font-mono text-xs focus:border-purple-500 outline-none" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-purple-600 rounded-xl font-bold flex justify-center items-center gap-2 mt-4 hover:bg-purple-700 active:scale-[0.98] transition-all">{saving ? <Loader2 className="animate-spin text-white" /> : <Save />} Save Tool</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
