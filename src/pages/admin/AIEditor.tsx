import { useState, useEffect } from 'react';
import { AI_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Plus, Trash2, Globe } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface AIStep {
  title: string;
  desc: string;
  icon: string;
}

interface AIData {
  headline: string;
  subheadline: string;
  steps: AIStep[];
  efficiency: string;
  reliability: string;
  strategy: string;
  features: string[];
  translations?: Record<string, any>;
}

export default function AIEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);
  
  const { register, control, handleSubmit, setValue, watch, getValues } = useForm<AIData>();
  const [newFeature, setNewFeature] = useState('');
  
  const features = watch('features') || [];
  const translationsVal = (watch('translations') || {}) as any;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps"
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

  const getTransVal = (fieldPath: string): string => {
    const parts = fieldPath.split('.');
    let current = translationsVal[activeEditorLang];
    if (!current) return '';
    for (const part of parts) {
      if (current == null) return '';
      current = current[part];
    }
    return typeof current === 'string' ? current : '';
  };

  const setTransVal = (fieldPath: string, newVal: string) => {
    const updated = { ...translationsVal };
    if (!updated[activeEditorLang]) {
      updated[activeEditorLang] = {};
    }
    
    const parts = fieldPath.split('.');
    let current = updated[activeEditorLang];
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i+1];
      const isNextIdx = !isNaN(Number(nextPart));
      if (!current[part]) {
        current[part] = isNextIdx ? [] : {};
      }
      current = current[part];
    }
    const lastKey = parts[parts.length - 1];
    current[lastKey] = newVal;
    setValue('translations', updated);
  };

  useEffect(() => {
    async function load() {
      const data = await getDocument<AIData>(AI_DOC);
      if (data) {
        setValue('headline', data.headline);
        setValue('subheadline', data.subheadline);
        setValue('steps', data.steps || []);
        setValue('efficiency', data.efficiency);
        setValue('reliability', data.reliability);
        setValue('strategy', data.strategy || '');
        setValue('features', data.features || []);
        setValue('translations', data.translations || {});
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  const handleAutoTranslate = async () => {
    const values = getValues();
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument(values);
      if (docWithTranslations.translations) {
        setValue('translations', docWithTranslations.translations);
        alert('AI section translations generated successfully! Review the different language tabs and Save.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate automatic translations.');
    } finally {
      setTranslating(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setValue('features', [...features, newFeature.trim()]);
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setValue('features', features.filter((_, i) => i !== idx));
  };

  const [saved, setSaved] = useState(false);

  const onSubmit = async (data: AIData) => {
    setSaving(true);
    try {
      await saveDocument(AI_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = (index: number) => {
    setDeleteModal({ isOpen: true, index });
  };

  const confirmDelete = () => {
    if (deleteModal.index !== null) {
      remove(deleteModal.index);
    }
    setDeleteModal({ isOpen: false, index: null });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20 animate-in fade-in duration-300">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={confirmDelete}
        title="Remove Step"
        message="Are you sure you want to remove this step from the workflow? Changes will be permanent after saving."
      />

      {/* Language Editor Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#050816] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-gray-300">AI Profile Localization (Active: {activeEditorLang.toUpperCase()})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
            {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveEditorLang(lang)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer",
                  activeEditorLang === lang 
                    ? "bg-purple-600 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAutoTranslate}
            disabled={translating}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/10 hover:bg-purple-600/20 disabled:opacity-50 text-purple-400 rounded-lg text-xs font-bold transition-all border border-purple-500/20 cursor-pointer"
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-[#050816] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <h3 className="text-xl font-bold">AI in QA Configuration</h3>
              <p className="text-sm text-gray-400">Manage your AI-driven testing content</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-white rounded-xl transition-all font-bold shadow-lg disabled:opacity-50",
                saved ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/20"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                   Main Headline {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 {activeEditorLang === 'en' ? (
                   <input {...register('headline')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
                 ) : (
                   <input 
                     value={getTransVal('headline')}
                     onChange={(e) => setTransVal('headline', e.target.value)}
                     className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:border-purple-500 outline-none text-purple-300"
                     placeholder="Provide headline translation..."
                   />
                 )}
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                   Highlight Text {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 {activeEditorLang === 'en' ? (
                   <input {...register('subheadline')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
                 ) : (
                   <input 
                     value={getTransVal('subheadline')}
                     onChange={(e) => setTransVal('subheadline', e.target.value)}
                     className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:border-purple-500 outline-none text-purple-300"
                     placeholder="Provide subheadline translation..."
                   />
                 )}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                AI Strategy & Methodology {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
              </label>
              {activeEditorLang === 'en' ? (
                <textarea 
                  {...register('strategy')} 
                  rows={4}
                  placeholder="Describe your approach to AI in QA..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none resize-none" 
                />
              ) : (
                <textarea 
                  value={getTransVal('strategy')}
                  onChange={(e) => setTransVal('strategy', e.target.value)}
                  rows={4}
                  placeholder={`Describe your approach to AI in QA in ${activeEditorLang.toUpperCase()}...`}
                  className="w-full bg-white/5 border border-purple-500/30 rounded-lg px-4 py-2 focus:border-purple-500 outline-none resize-none text-purple-300" 
                />
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">AI Capabilities & Tools (English)</label>
              </div>
              <div className="flex gap-2">
                <input 
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="e.g. Gemini Flash, LangChain, Prompt Engineering"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none placeholder:text-gray-700"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                    {feature}
                    <button type="button" onClick={() => removeFeature(idx)} className="hover:text-red-400">
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">Workflows/Steps</label>
                {activeEditorLang === 'en' && (
                  <button type="button" onClick={() => append({ title: '', desc: '', icon: 'Sparkles' })} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-white/2 border border-white/10 rounded-xl relative group">
                    {activeEditorLang === 'en' && (
                      <button 
                        type="button" 
                        onClick={() => handleDeleteStep(index)} 
                        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeEditorLang === 'en' ? (
                        <>
                          <input {...register(`steps.${index}.title` as const)} placeholder="Step Title" className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none p-1 text-sm font-bold" />
                          <input {...register(`steps.${index}.desc` as const)} placeholder="Step Description" className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none p-1 text-sm col-span-2" />
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500">English: {watch(`steps.${index}.title`)}</span>
                            <input 
                              value={getTransVal(`steps.${index}.title`)} 
                              onChange={(e) => setTransVal(`steps.${index}.title`, e.target.value)} 
                              placeholder={`${activeEditorLang.toUpperCase()} Step Title`} 
                              className="bg-transparent border-b border-purple-500/20 focus:border-purple-500 outline-none p-1 text-sm font-bold text-purple-300" 
                            />
                          </div>
                          <div className="flex flex-col gap-1 col-span-2">
                            <span className="text-[10px] text-gray-500">English: {watch(`steps.${index}.desc`)}</span>
                            <input 
                              value={getTransVal(`steps.${index}.desc`)} 
                              onChange={(e) => setTransVal(`steps.${index}.desc`, e.target.value)} 
                              placeholder={`${activeEditorLang.toUpperCase()} Step Description`} 
                              className="bg-transparent border-b border-purple-500/20 focus:border-purple-500 outline-none p-1 text-sm text-purple-300" 
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest font-mono text-blue-400">
                   Efficiency Metric {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 {activeEditorLang === 'en' ? (
                   <input {...register('efficiency')} placeholder="+320%" className="w-full bg-blue-500/5 border border-blue-500/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none text-blue-400 font-bold" />
                 ) : (
                   <input 
                     value={getTransVal('efficiency')}
                     onChange={(e) => setTransVal('efficiency', e.target.value)}
                     placeholder="+320%" 
                     className="w-full bg-purple-500/5 border border-purple-500/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none text-purple-400 font-bold" 
                   />
                 )}
               </div>
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase tracking-widest font-mono text-purple-400">
                   Reliability Metric {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 {activeEditorLang === 'en' ? (
                   <input {...register('reliability')} placeholder="99.9%" className="w-full bg-purple-500/5 border border-purple-500/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none text-purple-400 font-bold" />
                 ) : (
                   <input 
                     value={getTransVal('reliability')}
                     onChange={(e) => setTransVal('reliability', e.target.value)}
                     placeholder="99.9%" 
                     className="w-full bg-purple-500/5 border border-purple-500/10 rounded-lg px-4 py-2 focus:border-purple-500 outline-none text-purple-400 font-bold" 
                   />
                 )}
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
