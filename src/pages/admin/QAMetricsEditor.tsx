import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { BarChart3, Plus, Trash2, Edit2, Loader2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QAMetric {
  id?: string;
  label: string;
  value: string;
  trend: string;
  type: 'counter' | 'percentage' | 'health';
  order: number;
}

export default function QAMetricsEditor() {
  const [metrics, setMetrics] = useState<QAMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QAMetric | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadMetrics(); }, []);

  const loadMetrics = async () => {
    setLoading(true);
    const data = await getCollection<QAMetric>('qaMetrics', 'order');
    setMetrics(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) await updateCollectionDocument('qaMetrics', editing.id, editing);
      else await addCollectionDocument('qaMetrics', { ...editing, order: metrics.length });
      setEditing(null);
      loadMetrics();
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-cyan-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="text-cyan-500" /> QA Metrics Dashboard</h2>
        <button onClick={() => setEditing({ label: '', value: '', trend: '', type: 'counter', order: metrics.length })} className="bg-cyan-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Metric</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{metric.label}</h3><p className="text-xl font-mono text-cyan-400">{metric.value}</p></div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(metric)} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteCollectionDocument('qaMetrics', metric.id!).then(loadMetrics)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4"><h3 className="font-bold">Metric Detail</h3><button type="button" onClick={() => setEditing(null)}><X /></button></div>
              <div className="space-y-4">
                <input required placeholder="Metric Label" value={editing.label} onChange={e => setEditing({...editing, label: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <input required placeholder="Value (e.g. 98%)" value={editing.value} onChange={e => setEditing({...editing, value: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <input placeholder="Trend (e.g. +5% this sprint)" value={editing.trend} onChange={e => setEditing({...editing, trend: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                <select value={editing.type} onChange={e => setEditing({...editing, type: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
                  <option value="counter">Counter</option>
                  <option value="percentage">Percentage</option>
                  <option value="health">Health Score</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-cyan-600 rounded-xl font-bold flex justify-center items-center gap-2">{saving ? <Loader2 className="animate-spin" /> : <Save />} Save Metric</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
