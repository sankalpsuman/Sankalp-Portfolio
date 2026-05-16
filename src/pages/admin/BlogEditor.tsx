import React, { useState, useEffect, useMemo, memo } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { FileText, Plus, Trash2, Edit2, Loader2, Save, X, Eye, ExternalLink, Search, Clock, Hash, Tag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl: string;
  status: 'draft' | 'published';
  publishedAt: string;
}

const BlogListItem = memo(({ item, isActive, onSelect, onDelete }: { 
  item: BlogPost; 
  isActive: boolean; 
  onSelect: (item: BlogPost) => void;
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
    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center text-white/40">
       {item.imageUrl ? (
         <img src={item.imageUrl} className="w-full h-full object-cover" loading="lazy" />
       ) : (
         <FileText className="w-5 h-5" />
       )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors truncate">{item.title}</h4>
      <div className="flex items-center gap-2 mt-1">
        <span className={cn(
          "text-[8px] uppercase px-1.5 py-0.5 rounded border leading-none font-bold",
          item.status === 'published' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-amber-400 border-amber-500/20 bg-amber-500/5"
        )}>
          {item.status}
        </span>
        <span className="text-[10px] text-gray-500 font-mono truncate">/{item.slug}</span>
      </div>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onDelete(item.id!); }}
      className="p-2 -m-1 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      title="Delete Article"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </motion.div>
));

export default function BlogEditor() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeItem, setActiveItem] = useState<BlogPost | null>(null);
  const [localItem, setLocalItem] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getCollection<BlogPost>('blogs', 'publishedAt');
    setItems(data.reverse());
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      item.slug.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleSelect = (item: BlogPost) => {
    setActiveItem(item);
    setLocalItem({...item}); // Deep copy
  };

  const handleCreate = () => {
    const newItem: BlogPost = {
      id: '',
      title: 'New Article',
      slug: 'new-article-' + Date.now(),
      content: '',
      excerpt: '',
      category: 'General',
      tags: [],
      imageUrl: '',
      status: 'draft',
      publishedAt: new Date().toISOString()
    };
    setActiveItem(newItem);
    setLocalItem(newItem);
  };

  const handleAIGenerateImage = async () => {
    if (!localItem) return;
    setSaving(true);
    try {
      const response = await fetch('/api/ai/suggest-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: localItem.title, excerpt: localItem.excerpt }),
      });
      const data = await response.json();
      if (data.keywords) {
        const url = `https://images.unsplash.com/featured/1200x800?${encodeURIComponent(data.keywords)}`;
        setLocalItem({ ...localItem, imageUrl: url });
      }
    } catch (error) {
      console.error('Error suggesting image:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!localItem) return;
    setSaving(true);
    try {
      let finalItem = { ...localItem };
      
      // Auto-generate image if missing
      if (!finalItem.imageUrl) {
        try {
          const response = await fetch('/api/ai/suggest-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: finalItem.title, excerpt: finalItem.excerpt }),
          });
          const data = await response.json();
          if (data.keywords) {
            finalItem.imageUrl = `https://images.unsplash.com/featured/1200x800?${encodeURIComponent(data.keywords)}`;
          }
        } catch (e) {
          console.warn('Silent failure on auto-image generation:', e);
        }
      }

      const { id, ...data } = finalItem;
      if (id) {
        await updateCollectionDocument('blogs', id, data);
      } else {
        await addCollectionDocument('blogs', data);
      }
      load();
      setActiveItem(null);
      setLocalItem(null);
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setSaving(true);
    try {
      await deleteCollectionDocument('blogs', deleteModal.id);
      if (activeItem?.id === deleteModal.id) {
        setActiveItem(null);
        setLocalItem(null);
      }
      load();
    } finally {
      setDeleteModal({ isOpen: false, id: null });
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
        <p className="text-xs text-gray-500 font-mono">Synchronizing Knowledge Base...</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* List Column */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-white uppercase text-[10px] tracking-widest opacity-50">Articles</h3>
          <button 
            onClick={handleCreate}
            disabled={saving}
            className="p-1 px-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="w-3 h-3" /> New article
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050816] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
          />
        </div>
        
        <div className="space-y-3 max-h-[70vh] overflow-y-auto px-1 -mx-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <BlogListItem 
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                onSelect={handleSelect}
                onDelete={(id) => setDeleteModal({ isOpen: true, id })}
              />
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && (
            <div className="text-center py-10 text-gray-600 text-xs italic">
              No articles matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Editor Column */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {localItem ? (
            <motion.div
              key={activeItem?.id || 'new'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 sticky top-2"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {localItem.id ? 'Edit Article' : 'Draft New Insight'}
                  </h3>
                  <p className="text-xs text-gray-500">Refine and publish your professional thoughts</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => { setActiveItem(null); setLocalItem(null); }}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Article Title</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        value={localItem.title}
                        onChange={e => setLocalItem({...localItem, title: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-medium text-white"
                        placeholder="e.g. The Future of AI in QA Engineering"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">URL Slug</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        value={localItem.slug}
                        onChange={e => setLocalItem({...localItem, slug: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-mono text-white"
                        placeholder="future-ai-qa"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        value={localItem.category}
                        onChange={e => setLocalItem({...localItem, category: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 text-white"
                        placeholder="e.g. Research"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Status</label>
                    <select 
                      value={localItem.status}
                      onChange={e => setLocalItem({...localItem, status: e.target.value as any})}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all appearance-none text-white/80"
                    >
                      <option value="draft" className="bg-[#0b0e1a]">Draft Mode</option>
                      <option value="published" className="bg-[#0b0e1a]">Published Live</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Publish Date</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-600" />
                      <input 
                        type="date"
                        value={localItem.publishedAt ? localItem.publishedAt.split('T')[0] : ''}
                        onChange={e => setLocalItem({...localItem, publishedAt: new Date(e.target.value).toISOString()})}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all text-white/70"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Article Excerpt</label>
                  <textarea 
                    value={localItem.excerpt}
                    onChange={e => setLocalItem({...localItem, excerpt: e.target.value})}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none text-white"
                    placeholder="Short summary for the feed card..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Main Image URL</label>
                    <button 
                      onClick={handleAIGenerateImage}
                      disabled={saving}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" /> Magic Image
                    </button>
                  </div>
                  <input 
                    value={localItem.imageUrl}
                    onChange={e => setLocalItem({...localItem, imageUrl: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-mono text-white"
                    placeholder="https://..."
                  />
                  {localItem.imageUrl && (
                    <div className="mt-2 w-full h-32 rounded-xl border border-white/5 overflow-hidden">
                      <img src={localItem.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Content Body (Markdown)</label>
                    <span className="text-[10px] font-mono text-blue-500/50">MD Support Enabled</span>
                  </div>
                  <textarea 
                    value={localItem.content}
                    onChange={e => setLocalItem({...localItem, content: e.target.value})}
                    rows={12}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-mono custom-scrollbar text-white"
                    placeholder="# Your analysis starts here..."
                  />
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end gap-3">
                  <button 
                    onClick={() => { setActiveItem(null); setLocalItem(null); }}
                    className="px-6 py-2.5 rounded-xl text-gray-500 hover:text-white transition-all text-sm font-bold active:scale-95"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {localItem.id ? 'Push Update' : 'Publish article'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[600px] border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-white/[0.01]">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Editorial Hub</h3>
              <p className="text-gray-500 max-w-xs text-sm">Select an article from the list to refine its content or generate a new insight for your audience.</p>
              <button 
                onClick={handleCreate}
                className="mt-8 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white text-sm font-bold transition-all active:scale-95"
              >
                Draft New Insight
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        isLoading={saving}
        title="Burn record"
        message="Are you sure you want to remove this project from the official portfolio record? This bypasses standard archival protocols."
      />
    </div>
  );
}
