import { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HERO_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Plus, X, FileUp, Link as LinkIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

const heroSchema = z.object({
  headline: z.string().min(1, 'Headline is required').max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  titles: z.array(z.string()).min(1, 'At least one title is required'),
  resumeUrl: z.string().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

type HeroData = z.infer<typeof heroSchema>;

export default function HeroEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; title: string | null }>({ isOpen: false, title: null });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HeroData>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      titles: [],
    }
  });

  const titles = watch('titles') || [];
  const resumeUrl = watch('resumeUrl');

  useEffect(() => {
    async function loadData() {
      const data = await getDocument<HeroData>(HERO_DOC);
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          setValue(key as any, value);
        });
      }
      setLoading(false);
    }
    loadData();
  }, [setValue]);

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setValue('resumeUrl', url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const [saved, setSaved] = useState(false);

  const onSubmit = async (data: HeroData) => {
    setSaving(true);
    try {
      await saveDocument(HERO_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addTitle = () => {
    if (newTitle.trim() && !titles.includes(newTitle.trim())) {
      setValue('titles', [...titles, newTitle.trim()]);
      setNewTitle('');
    }
  };

  const handleRemoveTitle = (title: string) => {
    setDeleteModal({ isOpen: true, title });
  };

  const confirmDelete = () => {
    if (deleteModal.title) {
      setValue('titles', titles.filter(t => t !== deleteModal.title));
    }
    setDeleteModal({ isOpen: false, title: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, title: null })}
        onConfirm={confirmDelete}
        title="Remove Title"
        message={`Are you sure you want to remove "${deleteModal.title}" from your rotating titles?`}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-[#050816] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <h3 className="text-xl font-bold">Hero Section Content</h3>
              <p className="text-sm text-gray-400">Main landing area details</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all font-medium",
                saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700",
                saving && "opacity-50"
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Headline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Headline</label>
              <input
                {...register('headline')}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none",
                  errors.headline && "border-red-500/50 focus:border-red-500"
                )}
                placeholder="e.g. Hi, I’m Sankalp Suman"
              />
              {errors.headline && <p className="text-xs text-red-500">{errors.headline.message}</p>}
            </div>

            {/* Rotating Titles */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Rotating Titles</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {titles.map((title) => (
                  <span key={title} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm">
                    {title}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTitle(title)}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTitle())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Add new title..."
                />
                <button
                  type="button"
                  onClick={addTitle}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {errors.titles && <p className="text-xs text-red-500">{errors.titles.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none",
                  errors.description && "border-red-500/50 focus:border-red-500"
                )}
                placeholder="Brief introduction displayed in hero section..."
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* URLs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Resume / CV</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer group">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleResumeUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      ) : (
                        <FileUp className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                      <span className="text-sm font-medium text-gray-400 mt-2 group-hover:text-white">
                        {uploading ? 'Uploading Resume...' : 'Upload New Resume'}
                      </span>
                    </label>

                    {resumeUrl ? (
                      <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-400 truncate flex-1">{resumeUrl}</span>
                        <button 
                          type="button" 
                          onClick={() => setValue('resumeUrl', '')}
                          className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-500 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-blue-400/60 font-medium bg-blue-400/5 p-2 rounded border border-blue-400/10 text-center">
                        No resume uploaded
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Or Paste URL Directly</span>
                      <input
                        {...register('resumeUrl')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs focus:border-blue-500 transition-all outline-none"
                        placeholder="https://cloud.com/resume.pdf"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">LinkedIn URL</label>
                <input
                  {...register('linkedinUrl')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
