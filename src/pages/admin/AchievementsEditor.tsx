import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Award, Calendar, CheckSquare } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description?: string;
  badge?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export default function AchievementsEditor() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<Achievement | null>(null);
  const [localItem, setLocalItem] = useState<Achievement | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    async function load() {
      const data = await getCollection<Achievement>('achievements', 'order');
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (item: Achievement) => {
    setActiveItem(item);
    setLocalItem(item);
  };

  const handleCreate = async () => {
    const newItem = {
      title: 'Outstanding Performance Award',
      organization: 'Tech Holding Inc.',
      date: 'April 2026',
      description: 'Recognized for building robust automated validation frameworks.',
      badge: 'Gold Shield',
      imageUrl: '',
      featured: true,
      order: items.length
    };
    setSaving(true);
    try {
      const id = await addCollectionDocument('achievements', newItem);
      const created = { ...newItem, id };
      setItems([...items, created]);
      setActiveItem(created);
      setLocalItem(created);
    } catch (e) {
      alert('Failed to create achievement');
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpdate = (updates: Partial<Achievement>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    setSaving(true);
    try {
      await updateCollectionDocument('achievements', activeItem.id, localItem);
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
      await deleteCollectionDocument('achievements', id);
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
          <h3 className="text-lg font-semibold text-white">Achievements ({items.length})</h3>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Award
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
                <Award className={`w-5 h-5 ${activeItem?.id === item.id ? 'text-blue-400' : 'text-gray-400'}`} />
                <div>
                  <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                    <span className="text-[10px] text-blue-400">
                      {item.organization}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center bg-[#050816] border border-white/5 rounded-xl text-gray-500 text-sm">
              No awards added yet. Click Add Award.
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
                  <h3 className="font-bold text-white">Edit Achievement Details</h3>
                  <p className="text-xs text-gray-500">Configure award meta details and badges</p>
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
                    Delete Award
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Achievement Title</label>
                  <input
                    type="text"
                    value={localItem.title}
                    onChange={(e) => handleLocalUpdate({ title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Outstanding QA Award"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Issuing Organization</label>
                  <input
                    type="text"
                    value={localItem.organization}
                    onChange={(e) => handleLocalUpdate({ organization: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., Google Partners, ACM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Date Received</label>
                  <input
                    type="text"
                    value={localItem.date}
                    onChange={(e) => handleLocalUpdate({ date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., Dec 2025"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Badge Name / Tag</label>
                  <input
                    type="text"
                    value={localItem.badge || ''}
                    onChange={(e) => handleLocalUpdate({ badge: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g., Top Performer, MVP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={localItem.order}
                    onChange={(e) => handleLocalUpdate({ order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Award Image URL (Optional)</label>
                  <input
                    type="text"
                    value={localItem.imageUrl || ''}
                    onChange={(e) => handleLocalUpdate({ imageUrl: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://images.com/award.png"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={localItem.description || ''}
                    onChange={(e) => handleLocalUpdate({ description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="Details about standard metrics or impact accomplished to win this award..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localItem.featured || false}
                      onChange={(e) => handleLocalUpdate({ featured: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">Featured Achievement</span>
                      <span className="text-xs text-gray-400">Pin to highlights section on portfolio homepage.</span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#050816] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <Award className="w-12 h-12 text-gray-600 mb-4 opacity-40 animate-pulse" />
              <p className="text-gray-400 mb-4 max-w-xs text-sm">Select an achievement from the panel on the left to edit, or add a brand new award or appreciation record.</p>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add New Award
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Achievement Award"
        message="Are you sure you want to delete this achievement entry?"
      />
    </div>
  );
}
