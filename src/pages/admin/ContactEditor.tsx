import { useState, useEffect } from 'react';
import { CONTACT_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { autoTranslateDocument } from '../../lib/translationUtils';

export default function ContactEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const { register, handleSubmit, setValue, watch, getValues } = useForm();

  const translationsVal = (watch('translations') || {}) as any;

  const getTransVal = (field: 'location'): string => {
    if (activeEditorLang === 'en') {
      return watch(field) || '';
    }
    return translationsVal[activeEditorLang]?.[field] || '';
  };

  const setTransVal = (field: 'location', val: string) => {
    if (activeEditorLang === 'en') {
      setValue(field, val);
    } else {
      const updated = { ...translationsVal };
      if (!updated[activeEditorLang]) {
        updated[activeEditorLang] = {};
      }
      updated[activeEditorLang][field] = val;
      setValue('translations', updated);
    }
  };

  useEffect(() => {
    async function load() {
      const data = await getDocument(CONTACT_DOC);
      if (data) {
        Object.entries(data).forEach(([key, value]) => setValue(key, value));
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  const handleAutoTranslate = async () => {
    const values = getValues();
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        location: values.location
      });
      if (docWithTranslations.translations) {
        setValue('translations', docWithTranslations.translations);
        alert('Location translated successfully! Review different language tabs and Save.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate automatic translations.');
    } finally {
      setTranslating(false);
    }
  };

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await saveDocument(CONTACT_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-300">
      {/* Language Editor Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#050816] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-bold text-gray-300">Contact Localization (Active: {activeEditorLang.toUpperCase()})</span>
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
                    ? "bg-pink-600 text-white" 
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
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-600/10 hover:bg-pink-600/20 disabled:opacity-50 text-pink-400 rounded-lg text-xs font-bold transition-all border border-pink-500/20 cursor-pointer"
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

      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h3 className="text-xl font-bold">Contact Information</h3>
           <button 
             type="submit" 
             disabled={saving} 
             className={cn(
               "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all text-sm font-bold disabled:opacity-50",
               saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
             )}
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Info'}
           </button>
        </div>

        <div className="space-y-4">
           {activeEditorLang === 'en' && (
             <>
               <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
                  <input {...register('email')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</label>
                  <input {...register('phone')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
               </div>
             </>
           )}

           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2">
                <MapPin className="w-3 h-3 text-pink-500" /> Location {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
              </label>
              <input 
                value={getTransVal('location')} 
                onChange={(e) => setTransVal('location', e.target.value)}
                className={cn(
                  "w-full bg-white/5 border rounded-lg px-4 py-2 outline-none",
                  activeEditorLang === 'en' ? "border-white/10 focus:border-blue-500" : "border-pink-500/30 text-pink-300 focus:border-pink-500"
                )} 
              />
           </div>

           {activeEditorLang === 'en' && (
             <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
                <input {...register('linkedin')} className="w-full bg-[#030614] border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
             </div>
           )}
        </div>
      </form>
    </div>
  );
}
