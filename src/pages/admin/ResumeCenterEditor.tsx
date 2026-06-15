import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, FileText, CheckCircle, Globe } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

interface Resume {
  id: string;
  title: string;
  description?: string;
  category: string;
  version: string;
  pdfUrl?: string;
  previewUrl?: string;
  isFeatured: boolean;
  downloadsCount: number;
  lastUpdated: string;
}

export default function ResumeCenterEditor() {
  const [items, setItems] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<Resume | null>(null);
  const [localItem, setLocalItem] = useState<Resume | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    async function load() {
      const data = await getCollection<Resume>('resumes', 'version');
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (item: Resume) => {
    setActiveItem(item);
    setLocalItem(item);
  };

  const handleCreate = async () => {
    const newItem = {
      title: 'Full Stack QA Engineer ATS Resume',
      description: 'Optimized standard ATS resume version',
      category: 'ATS Version',
      version: 'v1.0.0',
      pdfUrl: '',
      previewUrl: '',
      isFeatured: true,
      downloadsCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setSaving(true);
    try {
      const id = await addCollectionDocument('resumes', newItem);
      const created = { ...newItem, id };
      setItems([...items, created]);
      setActiveItem(created);
      setLocalItem(created);
    } catch (e) {
      alert('Failed to create resume entry');
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpdate = (updates: Partial<Resume>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    setSaving(true);
    try {
      const updated = {
        ...localItem,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      await updateCollectionDocument('resumes', activeItem.id, updated);
      setItems(items.map(item => item.id === activeItem.id ? updated : item));
      setActiveItem(updated);
      setLocalItem(updated);
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
      await deleteCollectionDocument('resumes', id);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Panel */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Resume Center ({items.length})</h3>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Version
          </button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeItem?.id === item.id 
                  ? 'bg-blue-500/10 border-blue-500' 
                  : 'bg-[#050816] border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${activeItem?.id === item.id ? 'text-blue-400' : 'text-gray-400'}`} />
                <div>
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">
                      {item.version}
                    </span>
                    <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-400">
                      {item.category}
                    </span>
                    {item.isFeatured && (
                      <span className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">{item.downloadsCount} dl</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center bg-[#050816] border border-white/5 rounded-xl text-gray-500 text-sm">
              No resumes uploaded yet. Click Add Version.
            </div>
          )}
        </div>
      </div>

      {/* Editor Panel */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {localItem ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#050816] border border-white/5 rounded-2xl p-6 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-bold text-white">Edit Resume Version</h3>
                  <p className="text-xs text-gray-500">Configure downloads, descriptions, and file links</p>
                </div>
                <div className="flex items-center gap-2">
                  {saved && <span className="text-xs text-green-400 font-semibold">Changes saved!</span>}
                  <button
                    onClick={() => handleDelete(activeItem.id)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:bg-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Version
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Resume Title</label>
                  <input
                    type="text"
                    value={localItem.title}
                    onChange={(e) => handleLocalUpdate({ title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., Senior QA Automation Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category / Tag</label>
                  <input
                    type="text"
                    value={localItem.category}
                    onChange={(e) => handleLocalUpdate({ category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., ATS Version, General Portfolio"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Version String</label>
                  <input
                    type="text"
                    value={localItem.version}
                    onChange={(e) => handleLocalUpdate({ version: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., v1.5.0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Downloads Counter</label>
                  <input
                    type="number"
                    value={localItem.downloadsCount || 0}
                    onChange={(e) => handleLocalUpdate({ downloadsCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={2}
                    value={localItem.description || ''}
                    onChange={(e) => handleLocalUpdate({ description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Brief description of this version..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Cloud Storage URL (.pdf File)</label>
                  <input
                    type="text"
                    value={localItem.pdfUrl || ''}
                    onChange={(e) => handleLocalUpdate({ pdfUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://drive.google.com/uc?export=download&id=..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Preview Document / Image Link</label>
                  <input
                    type="text"
                    value={localItem.previewUrl || ''}
                    onChange={(e) => handleLocalUpdate({ previewUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://visualcdn.com/... or google drive folder"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localItem.isFeatured || false}
                      onChange={(e) => handleLocalUpdate({ isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">Featured Resume</span>
                      <span className="text-xs text-gray-400">Pin this resume across the primary website and AI assistant downloads.</span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#050816] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <FileText className="w-12 h-12 text-gray-600 mb-4 opacity-40 animate-pulse" />
              <p className="text-gray-400 mb-4 max-w-xs text-sm">Select a resume version from the panel on the left to edit, or upload and configure a new document version.</p>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Resume Version
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Resume Version"
        message="Are you sure you want to delete this resume version? Direct downloads and visitor links to this file will break."
      />
    </div>
  );
}
