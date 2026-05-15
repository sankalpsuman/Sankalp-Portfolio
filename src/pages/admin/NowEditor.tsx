import React, { useState, useEffect } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Clock, Save, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface NowContent {
  content: string;
  lastUpdated: string;
}

const NOW_DOC = 'now/content';

export default function NowEditor() {
  const [now, setNow] = useState<NowContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getDocument<NowContent>(NOW_DOC);
      setNow(data || { content: '', lastUpdated: new Date().toISOString() });
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
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="text-blue-500" /> "Now" Page Content</h2>
        <span className="text-xs text-gray-500 font-mono">Last updated: {now?.lastUpdated ? new Date(now.lastUpdated).toLocaleDateString() : 'Never'}</span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-gray-500">What are you focused on right now? (Markdown supported)</label>
          <textarea 
            required
            rows={15}
            value={now?.content}
            onChange={e => setNow({...now!, content: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-blue-500 transition-all text-sm leading-relaxed"
            placeholder="Currently working on..., Learning..., Researching..."
          />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" /> : <Save />} Save Now Content
        </button>
      </form>
    </div>
  );
}
