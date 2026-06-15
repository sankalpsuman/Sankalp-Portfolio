import { useState, useEffect, ChangeEvent, useMemo, memo } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Layers, ExternalLink, Github, Image as ImageIcon, X, FileUp, Search, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { ImageCropper } from '../../components/admin/ImageCropper';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, AnimatePresence } from 'motion/react';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  order: number;
  translations?: Record<string, any>;
}

const ProjectListItem = memo(({ item, isActive, onSelect, onDelete }: { 
  item: Project; 
  isActive: boolean; 
  onSelect: (item: Project) => void;
  onDelete: (id: string) => void;
}) => (
  <motion.div 
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={() => onSelect(item)}
    className={cn(
      "p-4 bg-[#050816] border rounded-xl transition-all cursor-pointer group flex items-center gap-4",
      isActive ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10" : "border-white/5 hover:border-white/10"
    )}
  >
    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
       {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" loading="lazy" /> : <ImageIcon className="w-full h-full p-3 text-gray-700" />}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">{item.title}</h4>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.techStack.length} Technologies</p>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
      className="p-2 -m-1 text-gray-500 hover:text-red-400 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
      title="Delete Project"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
));

export default function ProjectsEditor() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<Project | null>(null);
  const [localItem, setLocalItem] = useState<Project | null>(null);
  const [newTech, setNewTech] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!localItem) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        title: localItem.title,
        description: localItem.description
      });
      if (docWithTranslations.translations) {
        setLocalItem({
          ...localItem,
          translations: {
            ...(localItem.translations || {}),
            ...docWithTranslations.translations
          }
        });
        alert('Project translated! Review other language tabs and click Save Changes.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate automatic translations.');
    } finally {
      setTranslating(false);
    }
  };

  const getFieldVal = (field: 'title' | 'description') => {
    if (!localItem) return '';
    if (activeEditorLang === 'en') {
      return localItem[field] || '';
    }
    return localItem.translations?.[activeEditorLang]?.[field] || '';
  };

  const setFieldVal = (field: 'title' | 'description', val: string) => {
    if (!localItem) return;
    if (activeEditorLang === 'en') {
      setLocalItem({ ...localItem, [field]: val });
    } else {
      const translations = localItem.translations || {};
      const langData = translations[activeEditorLang] || {};
      setLocalItem({
        ...localItem,
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

  const load = async (bypass = false) => {
    try {
      const data = await getCollection<Project>('projects', 'order', undefined, bypass);
      setItems(data);
    } catch (e) {
      console.error('Error loading projects:', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await load(true);
      setLoading(false);
    };
    init();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.techStack.some(t => t.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const handleSelect = (item: Project) => {
    setActiveItem(item);
    setLocalItem({...item}); // Deep copy for local editing
    setActiveEditorLang('en');
  };

  const handleCreate = async () => {
    const newItem = {
      title: 'New Project',
      description: 'Project description goes here...',
      techStack: [],
      order: items.length
    };
    setSaving(true);
    try {
      const id = await addCollectionDocument('projects', newItem);
      await load(true);
      const response = await getCollection<Project>('projects', 'order', undefined, true);
      const createdItem = response.find(i => i.id === id);
      if (createdItem) {
        handleSelect(createdItem);
      }
    } catch (e) {
      alert('Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpdate = (updates: Partial<Project>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    
    setSaving(true);
    try {
      await updateCollectionDocument('projects', activeItem.id, localItem);
      await load(true);
      
      const response = await getCollection<Project>('projects', 'order', undefined, true);
      const updated = response.find(i => i.id === activeItem.id);
      if (updated) {
        handleSelect(updated);
      }
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
      await deleteCollectionDocument('projects', id);
      await load(true);
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

  const addTech = () => {
    if (!localItem || !newTech.trim()) return;
    
    // Support comma separated tags
    const stackToAdd = newTech.split(',')
      .map(t => t.trim())
      .filter(t => t && !localItem.techStack.includes(t));

    if (stackToAdd.length > 0) {
      const updatedStack = [...localItem.techStack, ...stackToAdd];
      handleLocalUpdate({ techStack: updatedStack });
    }
    setNewTech('');
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
    const file = new File([blob], 'project.jpg', { type: 'image/jpeg' });
    
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

  const removeTech = (tech: string) => {
    if (localItem) {
      const updatedStack = localItem.techStack.filter(t => t !== tech);
      handleLocalUpdate({ techStack: updatedStack });
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
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated data will be removed permanently."
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
      {/* List Column */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-white uppercase text-[10px] tracking-widest opacity-50">Portfolio Projects</h3>
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="p-1 px-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search projects or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050816] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto px-1 -mx-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <ProjectListItem 
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-gray-600 text-xs italic">
              No projects matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Editor Column */}
      <div className="lg:col-span-2">
        {localItem ? (
          <div className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-8 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xl font-bold">Edit Project</h3>
               <div className="flex items-center gap-2">
                 <button
                   onClick={() => handleDelete(activeItem.id)}
                   disabled={saving}
                   className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:bg-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                   type="button"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                   Delete Project
                 </button>
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
               <div className="flex gap-2">
                  {localItem.liveUrl && <a href={localItem.liveUrl} target="_blank" className="p-2 bg-white/5 rounded-lg hover:text-blue-400"><ExternalLink className="w-4 h-4" /></a>}
                  {localItem.githubUrl && <a href={localItem.githubUrl} target="_blank" className="p-2 bg-white/5 rounded-lg hover:text-blue-400"><Github className="w-4 h-4" /></a>}
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 {/* Language Editor Tabs and Auto translate */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl mb-6">
                   <div className="flex items-center gap-2">
                     <Globe className="w-4 h-4 text-blue-400" />
                     <span className="text-xs font-bold text-gray-300">Localization (Active: {activeEditorLang.toUpperCase()})</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-xl">
                       {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                         <button
                           key={lang}
                           type="button"
                           onClick={() => setActiveEditorLang(lang)}
                           className={cn(
                             "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer",
                             activeEditorLang === lang 
                               ? "bg-blue-600 text-white" 
                               : "text-gray-400 hover:text-white"
                           )}
                         >
                           {lang}
                         </button>
                       ))}
                     </div>

                     <button
                       type="button"
                       onClick={handleAutoTranslate}
                       disabled={translating || !localItem?.title}
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

                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">
                   Project Title {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 <input 
                   value={getFieldVal('title')}
                   onChange={(e) => setFieldVal('title', e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none text-white text-lg font-bold"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Project Image</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                      {localItem.imageUrl ? (
                        <img src={localItem.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <span className="text-xs">No image uploaded</span>
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
                        <span className="text-sm font-medium">Upload Image</span>
                      </label>
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest block">Or enter URL</span>
                        <input 
                          value={localItem.imageUrl || ''}
                          onChange={(e) => handleLocalUpdate({ imageUrl: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-xs"
                          placeholder="Image URL..."
                        />
                      </div>
                    </div>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs text-gray-400 uppercase font-mono tracking-widest font-bold">Tech Stack</label>
                 <p className="text-[10px] text-gray-500 italic mb-2">Separate technologies with commas or press Enter</p>
                 <div className="flex flex-wrap gap-2 mb-3">
                   {localItem.techStack.map(tech => (
                     <span key={tech} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold animate-in fade-in zoom-in duration-200">
                       {tech}
                       <button onClick={() => removeTech(tech)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                     </span>
                   ))}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTech();
                        }
                      }}
                      className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 focus:bg-white/[0.05] outline-none transition-all placeholder:text-gray-600"
                      placeholder="e.g. React, Node.js, AWS..."
                    />
                    <button 
                      onClick={addTech} 
                      className="p-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white active:scale-95 transition-all"
                      title="Add Tech"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">
                   Description {activeEditorLang !== 'en' && `(${activeEditorLang.toUpperCase()})`}
                 </label>
                 <textarea 
                   value={getFieldVal('description')}
                   onChange={(e) => setFieldVal('description', e.target.value)}
                   rows={6}
                   className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none resize-none text-gray-300"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Live URL</label>
                    <input 
                      value={localItem.liveUrl || ''}
                      onChange={(e) => handleLocalUpdate({ liveUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">GitHub URL</label>
                    <input 
                      value={localItem.githubUrl || ''}
                      onChange={(e) => handleLocalUpdate({ githubUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
               </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs text-gray-500 italic">
               <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Changes must be manually saved
               </div>
               <span>Order Index: {localItem.order}</span>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
            <Layers className="w-12 h-12 mb-4 opacity-20 text-gray-500 animate-pulse" />
            <p className="text-gray-400 mb-4 max-w-xs text-sm">Select a project to manifest its properties, or start listing a brand new product instantly.</p>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
