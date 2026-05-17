import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ABOUT_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

import { ImageCropper } from '../../components/admin/ImageCropper';

const aboutSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
  metrics: z.array(z.object({
    label: z.string().min(1, 'Label is required'),
    value: z.string().min(1, 'Value is required')
  })).max(10),
  imageUrl: z.string().optional().or(z.literal('')),
  videoUrl: z.string().optional().or(z.literal('')),
});

type AboutData = z.infer<typeof aboutSchema>;

export default function AboutEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<AboutData>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      metrics: [],
    }
  });

  const imageUrl = watch('imageUrl');
  const videoUrl = watch('videoUrl');

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metrics"
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

  useEffect(() => {
    async function loadData() {
      const data = await getDocument<AboutData>(ABOUT_DOC);
      if (data) {
        setValue('content', data.content);
        setValue('metrics', data.metrics || []);
        setValue('imageUrl', data.imageUrl || '');
        setValue('videoUrl', data.videoUrl || '');
      }
      setLoading(false);
    }
    loadData();
  }, [setValue]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be selected again
      e.target.value = '';
      return;
    }

    try {
      setUploading(type);
      const url = await uploadToCloudinary(file);
      setValue('videoUrl', url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setTempImage(null);
    const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
    
    try {
      setUploading('image');
      const url = await uploadToCloudinary(file);
      setValue('imageUrl', url);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const [saved, setSaved] = useState(false);

  const onSubmit = async (data: AboutData) => {
    setSaving(true);
    try {
      await saveDocument(ABOUT_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMetric = (index: number) => {
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
    <div className="max-w-4xl space-y-8">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null })}
        onConfirm={confirmDelete}
        title="Remove Metric"
        message="Are you sure you want to remove this metric? Changes will be permanent after saving."
      />
      <AnimatePresence>
        {tempImage && (
          <ImageCropper 
            imageSrc={tempImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setTempImage(null)}
            // aspect={1} removed for free-form cropping
          />
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-[#050816] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div>
              <h3 className="text-xl font-bold">About Section</h3>
              <p className="text-sm text-gray-400">Your bio and key metrics</p>
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
            {/* Visual Assets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Profile Image</label>
                <div className="space-y-3">
                  <div className="relative min-h-[200px] rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-xs">No image selected</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'image')}
                        disabled={!!uploading}
                      />
                      <div className="text-center">
                        {uploading === 'image' ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white mb-2" />
                        ) : (
                          <Plus className="w-6 h-6 text-white mb-2 mx-auto" />
                        )}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {uploading === 'image' ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </div>
                    </label>
                  </div>
                  <input
                    {...register('imageUrl')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:border-blue-500 outline-none"
                    placeholder="Or paste URL..."
                  />
                </div>
              </div>

              {/* Video Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Intro Video (Optional)</label>
                <div className="space-y-3">
                  <div className="relative min-h-[200px] rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                    {videoUrl ? (
                      <video src={videoUrl} className="w-full h-auto object-cover" controls />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <Video className="w-8 h-8 mb-2" />
                        <span className="text-xs">No video selected</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="video/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'video')}
                        disabled={!!uploading}
                      />
                      <div className="text-center">
                        {uploading === 'video' ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white mb-2" />
                        ) : (
                          <Plus className="w-6 h-6 text-white mb-2 mx-auto" />
                        )}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {uploading === 'video' ? 'Uploading...' : 'Upload Video'}
                        </span>
                      </div>
                    </label>
                  </div>
                  <input
                    {...register('videoUrl')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-400 focus:border-blue-500 outline-none"
                    placeholder="Or paste video URL..."
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Bio Content</label>
              <textarea
                {...register('content')}
                rows={8}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 transition-all outline-none resize-none",
                  errors.content && "border-red-500/50"
                )}
              />
              {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Key Metrics</label>
                <button
                  type="button"
                  onClick={() => append({ label: '', value: '' })}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Metric
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-white/2 border border-white/10 rounded-xl relative group">
                    <button
                      type="button"
                      onClick={() => handleDeleteMetric(index)}
                      className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Remove Metric"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        {...register(`metrics.${index}.label` as const)}
                        placeholder="Label (e.g. Teams Led)"
                        className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none p-1 text-sm text-gray-300"
                      />
                      <input
                        {...register(`metrics.${index}.value` as const)}
                        placeholder="Value (e.g. 4)"
                        className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none p-1 text-sm font-bold text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
