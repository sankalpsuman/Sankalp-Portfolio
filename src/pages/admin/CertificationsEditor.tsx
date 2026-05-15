import { useState, useEffect, ChangeEvent } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Award, ExternalLink, Image as ImageIcon, FileUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { ImageCropper } from '../../components/admin/ImageCropper';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { AnimatePresence } from 'framer-motion';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  imageUrl?: string;
  order: number;
}

export default function CertificationsEditor() {
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<Certification | null>(null);
  const [localItem, setLocalItem] = useState<Certification | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    async function load() {
      const data = await getCollection<Certification>('certifications', 'order');
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (item: Certification) => {
    setActiveItem(item);
    setLocalItem(item);
  };

  const handleCreate = async () => {
    const newItem = {
      name: 'New Certification',
      issuer: 'Issuer Name',
      date: 'May 2026',
      order: items.length
    };
    setSaving(true);
    const id = await addCollectionDocument('certifications', newItem);
    const item = { ...newItem, id };
    setItems([...items, item]);
    setActiveItem(item);
    setLocalItem(item);
    setSaving(false);
  };

  const handleLocalUpdate = (updates: Partial<Certification>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    setSaving(true);
    try {
      await updateCollectionDocument('certifications', activeItem.id, localItem);
      setItems(items.map(item => item.id === activeItem.id ? localItem : item));
      setActiveItem(localItem);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const id = deleteModal.id;
    setSaving(true);
    try {
      await deleteCollectionDocument('certifications', id);
      setItems(items.filter(i => i.id !== id));
      if (activeItem?.id === id) {
        setActiveItem(null);
        setLocalItem(null);
      }
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      alert('Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!localItem) return;
    setTempImage(null);
    const file = new File([blob], 'cert.jpg', { type: 'image/jpeg' });
    
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      handleLocalUpdate({ imageUrl: url });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        isLoading={saving}
        title="Delete Certification"
        message="Are you sure you want to delete this certification? This action is permanent."
      />
      <AnimatePresence>
        {tempImage && (
          <ImageCropper 
            imageSrc={tempImage}
            onCropComplete={handleCropComplete}
            onCancel={() => setTempImage(null)}
            // Removed fixed aspect
          />
        )}
      </AnimatePresence>
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Certifications</h3>
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="p-1 px-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-blue-600/20"
          >
            <Plus className="w-3 h-3" /> Add New
          </button>
        </div>
        
        <div className="space-y-3">
          {items.map(item => (
            <div 
              key={item.id}
              onClick={() => handleSelect(item)}
              className={cn(
                "p-4 bg-[#050816] border rounded-xl transition-all cursor-pointer group flex items-center gap-4",
                activeItem?.id === item.id ? "border-blue-500" : "border-white/5 hover:border-white/10"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                 <Award className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">{item.name}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.issuer}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="p-2 -m-1 text-gray-500 hover:text-red-400 transition-colors"
                title="Delete Certification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {localItem ? (
          <div className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xl font-bold">Edit Certification</h3>
               <button 
                 onClick={handleSave} 
                 disabled={saving}
                 className={cn(
                   "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all text-sm font-bold",
                   saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700",
                   saving && "opacity-50"
                 )}
               >
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
               </button>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Certification Name</label>
                 <input 
                   value={localItem.name}
                   onChange={(e) => handleLocalUpdate({ name: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Issuer</label>
                    <input 
                      value={localItem.issuer}
                      onChange={(e) => handleLocalUpdate({ issuer: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Date</label>
                    <input 
                      value={localItem.date}
                      onChange={(e) => handleLocalUpdate({ date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Credential Image/Badge</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 group flex items-center justify-center">
                      {localItem.imageUrl ? (
                        <img src={localItem.imageUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/50 hover:bg-white/10 transition-all cursor-pointer group">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={uploading} />
                        <FileUp className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                        <span className="text-sm font-medium text-center">Update Image</span>
                      </label>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Or enter URL</span>
                        <input 
                          value={localItem.imageUrl || ''}
                          onChange={(e) => handleLocalUpdate({ imageUrl: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-xs"
                          placeholder="Badge URL..."
                        />
                      </div>
                    </div>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Credential URL</label>
                 <input 
                   value={localItem.url || ''}
                   onChange={(e) => handleLocalUpdate({ url: e.target.value })}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                 />
               </div>
            </div>
          </div>
        ) : (
          <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 italic">
            Select a certification to edit
          </div>
        )}
      </div>
    </div>
  );
}
