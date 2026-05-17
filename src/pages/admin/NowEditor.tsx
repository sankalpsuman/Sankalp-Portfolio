import React, { useState, useEffect } from 'react';
import { getDocument, saveDocument, getCachedData, NOW_DOC } from '../../services/firestoreService';
import { Clock, Save, Loader2, MapPin, Coffee, Rocket, Eye, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

interface NowContent {
  content: string;
  location: string;
  status: string;
  focus: string;
  lastUpdated: string;
}

export default function NowEditor() {
  const [now, setNow] = useState<NowContent | null>(() => getCachedData<NowContent>(NOW_DOC));
  const [loading, setLoading] = useState(!getCachedData(NOW_DOC));
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    async function load() {
      const data = await getDocument<NowContent>(NOW_DOC);
      setNow(data || { 
        content: '', 
        location: 'Delhi NCR, India', 
        status: 'Open to collaboration', 
        focus: 'Scaling AI-Driven QA Platforms',
        lastUpdated: new Date().toISOString() 
      });
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!now) return;
    setSaving(true);
    await saveDocument(NOW_DOC, { ...now, lastUpdated: new Date().toISOString() });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
            <Clock className="text-blue-500 w-6 h-6" /> 
            "Now" Page CMS
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage your current status, location, and focus areas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setView('edit')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'edit' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button 
            onClick={() => setView('preview')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              view === 'preview' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            )}
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'edit' ? (
          <motion.form 
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSave} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <input 
                  type="text"
                  value={now?.location}
                  onChange={e => setNow({...now!, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Coffee className="w-3 h-3" /> Status
                </label>
                <input 
                  type="text"
                  value={now?.status}
                  onChange={e => setNow({...now!, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Building something new"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Rocket className="w-3 h-3" /> Current Focus
                </label>
                <input 
                  type="text"
                  value={now?.focus}
                  onChange={e => setNow({...now!, focus: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. React & TypeScript"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detailed Content (Markdown)</label>
              <textarea 
                required
                rows={15}
                value={now?.content}
                onChange={e => setNow({...now!, content: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-blue-500 transition-all text-sm leading-relaxed font-mono"
                placeholder="## What I'm doing now...
- Working on...
- Learning...
- Reading..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-gray-500 font-mono italic">
                Last synced: {now?.lastUpdated ? new Date(now.lastUpdated).toLocaleString() : 'Never'}
              </span>
              <button 
                type="submit" 
                disabled={saving} 
                className="bg-blue-600 px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />} 
                Publish Update
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: MapPin, label: 'Location', value: now?.location, color: 'text-blue-400', bg: 'bg-blue-600/10' },
                { icon: Coffee, label: 'Status', value: now?.status, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
                { icon: Rocket, label: 'Focus', value: now?.focus, color: 'text-purple-400', bg: 'bg-purple-600/10' }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
                  <div className={cn("p-3 rounded-xl", item.bg, item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</div>
                    <div className="text-sm font-medium mt-0.5">{item.value || 'Not set'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0b0e1a] border border-white/10 rounded-[2.5rem] p-8 md:p-12">
               <div className="prose prose-invert prose-blue max-w-none prose-headings:tracking-tight prose-p:text-gray-400 prose-p:leading-relaxed">
                  <ReactMarkdown>{now?.content || '_No content yet._'}</ReactMarkdown>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
