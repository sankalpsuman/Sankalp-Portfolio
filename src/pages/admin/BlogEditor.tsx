import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { FileText, Plus, Trash2, Edit2, Loader2, Save, X, Eye, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface BlogPost {
  id?: string;
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

export default function BlogEditor() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    const data = await getCollection<BlogPost>('blogs', 'publishedAt');
    setBlogs(data.reverse());
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    
    try {
      if (editing.id) {
        await updateCollectionDocument('blogs', editing.id, editing);
      } else {
        await addCollectionDocument('blogs', { ...editing, publishedAt: new Date().toISOString() });
      }
      setEditing(null);
      loadBlogs();
    } catch (error) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await deleteCollectionDocument('blogs', id);
    loadBlogs();
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-blue-500" />
          Blog Management
        </h2>
        <button 
          onClick={() => setEditing({ title: '', slug: '', content: '', excerpt: '', category: '', tags: [], imageUrl: '', status: 'draft', publishedAt: '' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {blogs.map(blog => (
          <div key={blog.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group">
            <div>
              <h3 className="font-bold">{blog.title}</h3>
              <p className="text-xs text-gray-500 font-mono">/{blog.slug}</p>
              <div className="flex gap-2 mt-2">
                <span className={cn(
                  "text-[10px] uppercase px-2 py-0.5 rounded-full border",
                  blog.status === 'published' ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                )}>
                  {blog.status}
                </span>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-white/5 text-gray-500">{blog.category}</span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(blog)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(blog.id!)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSave}
              className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0b0e1a]/80 backdrop-blur-md z-10">
                <h3 className="font-bold text-lg">{editing.id ? 'Edit Article' : 'New Article'}</h3>
                <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Title</label>
                      <input 
                        required
                        value={editing.title}
                        onChange={e => setEditing({...editing, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Slug</label>
                      <input 
                        required
                        value={editing.slug}
                        onChange={e => setEditing({...editing, slug: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Category</label>
                        <input 
                          value={editing.category}
                          onChange={e => setEditing({...editing, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Status</label>
                        <select 
                          value={editing.status}
                          onChange={e => setEditing({...editing, status: e.target.value as any})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm"
                        >
                          <option value="draft" className="bg-[#0b0e1a]">Draft</option>
                          <option value="published" className="bg-[#0b0e1a]">Published</option>
                        </select>
                      </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Excerpt</label>
                    <textarea 
                      rows={2}
                      value={editing.excerpt}
                      onChange={e => setEditing({...editing, excerpt: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm resize-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Content (Markdown)</label>
                    <textarea 
                      required
                      rows={10}
                      value={editing.content}
                      onChange={e => setEditing({...editing, content: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all text-sm font-mono" 
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setEditing(null)}
                    className="px-6 py-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Article
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
