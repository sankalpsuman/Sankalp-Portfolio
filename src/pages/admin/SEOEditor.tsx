import { useState, useEffect, ChangeEvent } from 'react';
import { SEO_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Search, X, Plus, FileUp, Link as LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

export default function SEOEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setValue('ogImage', url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
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

           <div className="space-y-3">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono">OG Preview Image</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer group bg-white/2">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    ) : (
                      <FileUp className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    )}
                    <div className="text-center mt-3">
                      <span className="text-sm font-medium text-gray-400 group-hover:text-white block">
                        {uploading ? 'Uploading...' : 'Upload Preview Image'}
                      </span>
                    </div>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Or Paste URL Directly</span>
                      {watch('ogImage') && (
                        <button 
                          type="button"
                          onClick={() => setValue('ogImage', '')}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                        >
                          <X className="w-2.5 h-2.5" /> Clear Image
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        {...register('ogImage')} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 outline-none pr-10" 
                        placeholder="https://unsplash.com/..." 
                      />
                      <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                {watch('ogImage') && (
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    <img src={watch('ogImage')} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">OG Preview</span>
                    </div>
                  </div>
                )}
              </div>
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
