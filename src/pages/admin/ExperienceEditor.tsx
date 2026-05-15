import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Briefcase, Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  tags?: string[];
  order: number;
}

export default function ExperienceEditor() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<Experience | null>(null);
  const [localItem, setLocalItem] = useState<Experience | null>(null);
  const [newTag, setNewTag] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    async function load() {
      const data = await getCollection<Experience>('experience', 'order');
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (item: Experience) => {
    setActiveItem(item);
    setLocalItem(item);
  };

  const handleCreate = async () => {
    const newItem = {
      company: 'New Company',
      role: 'Role',
      period: '2023 - Present',
      description: '',
      tags: [],
      order: items.length
    };
    setSaving(true);
    const id = await addCollectionDocument('experience', newItem);
    const item = { ...newItem, id };
    setItems([...items, item]);
    setActiveItem(item);
    setLocalItem(item);
    setSaving(false);
  };

  const handleLocalUpdate = (updates: Partial<Experience>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    setSaving(true);
    try {
      await updateCollectionDocument('experience', activeItem.id, localItem);
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
      await deleteCollectionDocument('experience', id);
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

  const addTag = () => {
    if (!localItem || !newTag.trim()) return;
    
    // Support comma separated tags
    const tagsToAdd = newTag.split(',')
      .map(t => t.trim())
      .filter(t => t && !localItem.tags?.includes(t));

    if (tagsToAdd.length > 0) {
      const updatedTags = [...(localItem.tags || []), ...tagsToAdd];
      handleLocalUpdate({ tags: updatedTags });
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    if (localItem) {
      const updatedTags = localItem.tags?.filter(t => t !== tag) || [];
      handleLocalUpdate({ tags: updatedTags });
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
        title="Delete Experience"
        message="Are you sure you want to delete this experience entry? This will permanently remove it from your resume."
      />
      {/* List Column */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Experience History</h3>
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="p-1 px-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-blue-600/20 transition-all"
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
                "p-4 bg-[#050816] border rounded-xl group transition-all cursor-pointer",
                activeItem?.id === item.id ? "border-blue-500" : "border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors uppercase">{item.company}</h4>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="p-2 -m-1 text-gray-500 hover:text-red-400 transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Column */}
      <div className="lg:col-span-2">
        {localItem ? (
          <div className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <h3 className="text-xl font-bold">Editing Experience</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Company Name</label>
                <input 
                  value={localItem.company}
                  onChange={(e) => handleLocalUpdate({ company: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Period</label>
                <input 
                  value={localItem.period}
                  onChange={(e) => handleLocalUpdate({ period: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Role Title</label>
              <input 
                value={localItem.role}
                onChange={(e) => handleLocalUpdate({ role: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase font-mono tracking-widest">Description</label>
              <textarea 
                value={localItem.description}
                onChange={(e) => handleLocalUpdate({ description: e.target.value })}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase font-mono tracking-widest font-bold">Key Focus Areas / Tags</label>
              <p className="text-[10px] text-gray-500 italic mb-2">Separate tags with commas or press Enter</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {localItem.tags?.map(tag => (
                  <div key={tag} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold group/tag animate-in fade-in zoom-in duration-200">
                    {tag}
                    <button 
                      onClick={() => removeTag(tag)} 
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g. React, TypeScript, QA..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500/50 focus:bg-white/[0.05] outline-none text-sm transition-all placeholder:text-gray-600"
                />
                <button 
                  onClick={addTag}
                  className="p-2 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white active:scale-95 transition-all"
                  title="Add Tag"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end items-center gap-4 text-xs text-gray-500 italic">
               <Briefcase className="w-4 h-4" /> Changes must be manually saved
            </div>
          </div>
        ) : (
          <div className="h-96 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 italic">
            <Briefcase className="w-12 h-12 mb-4 opacity-20" />
            Select an experience entry to edit
          </div>
        )}
      </div>
    </div>
  );
}
