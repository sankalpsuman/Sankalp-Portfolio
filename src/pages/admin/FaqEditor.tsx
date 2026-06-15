import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, HelpCircle } from 'lucide-react';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, AnimatePresence } from 'motion/react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  visible: boolean;
  order: number;
}

export default function FaqEditor() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeItem, setActiveItem] = useState<FAQ | null>(null);
  const [localItem, setLocalItem] = useState<FAQ | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    async function load() {
      const data = await getCollection<FAQ>('faqs', 'order');
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSelect = (item: FAQ) => {
    setActiveItem(item);
    setLocalItem(item);
  };

  const handleCreate = async () => {
    const newItem = {
      question: 'What is your stack proficiency?',
      answer: 'I hold expertise in JavaScript, TypeScript, Python, Playwright, Cypress, Selenium, JMeter, Docker, and various CI/CD pipelines.',
      category: 'Technical',
      visible: true,
      order: items.length
    };
    setSaving(true);
    try {
      const id = await addCollectionDocument('faqs', newItem);
      const created = { ...newItem, id };
      setItems([...items, created]);
      setActiveItem(created);
      setLocalItem(created);
    } catch (e) {
      alert('Failed to create FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleLocalUpdate = (updates: Partial<FAQ>) => {
    if (localItem) {
      setLocalItem({ ...localItem, ...updates });
    }
  };

  const handleSave = async () => {
    if (!localItem || !activeItem) return;
    setSaving(true);
    try {
      await updateCollectionDocument('faqs', activeItem.id, localItem);
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
      await deleteCollectionDocument('faqs', id);
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
          <h3 className="text-lg font-semibold text-white">Frequently Asked ({items.length})</h3>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add FAQ
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
                <HelpCircle className={`w-5 h-5 ${activeItem?.id === item.id ? 'text-blue-400' : 'text-gray-400'}`} />
                <div>
                  <h4 className="font-semibold text-sm text-white line-clamp-1">{item.question}</h4>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">
                      {item.category}
                    </span>
                    {!item.visible && (
                      <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded text-red-400">
                        Hidden
                      </span>
                    )}
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
              No FAQs added yet. Click Add FAQ.
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
                  <h3 className="font-bold text-white">Edit FAQ</h3>
                  <p className="text-xs text-gray-500">Configure questions and structural accordion visibility</p>
                </div>
                <div className="flex items-center gap-2">
                  {saved && <span className="text-xs text-green-400 font-semibold">Saved!</span>}
                  <button
                    onClick={() => handleDelete(activeItem.id)}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:bg-red-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete FAQ
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
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Question</label>
                  <input
                    type="text"
                    value={localItem.question}
                    onChange={(e) => handleLocalUpdate({ question: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Category</label>
                  <input
                    type="text"
                    value={localItem.category}
                    onChange={(e) => handleLocalUpdate({ category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="E.g. Technical, General, Process"
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Answer</label>
                  <textarea
                    rows={4}
                    value={localItem.answer}
                    onChange={(e) => handleLocalUpdate({ answer: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localItem.visible ?? true}
                      onChange={(e) => handleLocalUpdate({ visible: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-white block">Visible</span>
                      <span className="text-xs text-gray-400">Control if this FAQ is published to the public portfolio Accordion page.</span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#050816] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <HelpCircle className="w-12 h-12 text-gray-600 mb-4 opacity-40 animate-pulse" />
              <p className="text-gray-400 mb-4 max-w-xs text-sm">Select an FAQ from the panel on the left to edit its details, or create a brand new one instantly.</p>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create New FAQ
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Frequently Asked Question"
        message="Are you sure you want to delete this FAQ entry?"
      />
    </div>
  );
}
