import { useState, useEffect } from 'react';
import { SEO_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Search, X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export default function SEOEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; keyword: string | null }>({ isOpen: false, keyword: null });
  const { register, handleSubmit, setValue, watch } = useForm();

  const keywords = watch('keywords') || [];

  useEffect(() => {
    async function load() {
      const data = await getDocument(SEO_DOC);
      if (data) {
        Object.entries(data).forEach(([key, value]) => setValue(key, value));
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await saveDocument(SEO_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    
    // Support comma separated keywords
    const keywordsToAdd = newKeyword.split(',')
      .map(kw => kw.trim())
      .filter(kw => kw && !keywords.includes(kw));

    if (keywordsToAdd.length > 0) {
      setValue('keywords', [...keywords, ...keywordsToAdd]);
    }
    setNewKeyword('');
  };

  const handleDeleteKeyword = (kw: string) => {
    setDeleteModal({ isOpen: true, keyword: kw });
  };

  const confirmDelete = () => {
    if (deleteModal.keyword) {
      setValue('keywords', keywords.filter((k: string) => k !== deleteModal.keyword));
    }
    setDeleteModal({ isOpen: false, keyword: null });
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl space-y-8">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, keyword: null })}
        onConfirm={confirmDelete}
        title="Remove Keyword"
        message={`Are you sure you want to remove "${deleteModal.keyword}"?`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h3 className="text-xl font-bold">SEO & Meta Configuration</h3>
           <button 
             type="submit" 
             disabled={saving} 
             className={cn(
               "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all text-sm font-bold disabled:opacity-50",
               saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-purple-600 hover:bg-purple-700"
             )}
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Config'}
           </button>
        </div>

        <div className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">Meta Title</label>
              <input {...register('title')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" placeholder="Sankalp Suman | AI QA Lead" />
           </div>

           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">Meta Description</label>
              <textarea {...register('description')} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none resize-none" placeholder="Brief site description for search engines..." />
           </div>

           <div className="space-y-4">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold">Keywords</label>
              <p className="text-[10px] text-gray-500 italic mb-2">Separate keywords with commas or press Enter</p>
              <div className="flex flex-wrap gap-2 mb-2">
                 {keywords.map((kw: string) => (
                    <div key={kw} className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold animate-in fade-in zoom-in duration-200">
                       {kw}
                       <button type="button" onClick={() => handleDeleteKeyword(kw)} className="hover:text-red-400 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                    </div>
                 ))}
              </div>
              <div className="flex gap-2">
                 <input 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-purple-500/50 focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-600"
                    placeholder="e.g. SEO, AI, Tech Lead..."
                 />
                 <button 
                   type="button" 
                   onClick={addKeyword} 
                   className="p-2 bg-purple-600/10 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600 hover:text-white active:scale-95 transition-all"
                   title="Add Keyword"
                 >
                   <Plus className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
