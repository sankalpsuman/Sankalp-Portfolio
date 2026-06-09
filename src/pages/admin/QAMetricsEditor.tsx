import React, { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { BarChart3, Plus, Trash2, Edit2, Loader2, Save, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { autoTranslateDocument } from '../../lib/translationUtils';

interface QAMetric {
  id?: string;
  label: string;
  value: string;
  trend: string;
  type: 'counter' | 'percentage' | 'health';
  order: number;
  translations?: Record<string, any>;
}

export default function QAMetricsEditor() {
  const [metrics, setMetrics] = useState<QAMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QAMetric | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const getFieldVal = (field: 'label' | 'trend') => {
    if (!editing) return '';
    if (activeEditorLang === 'en') {
      return editing[field] || '';
    }
    return editing.translations?.[activeEditorLang]?.[field] || '';
  };

  const setFieldVal = (field: 'label' | 'trend', val: string) => {
    if (!editing) return;
    if (activeEditorLang === 'en') {
      setEditing({ ...editing, [field]: val });
    } else {
      const translations = editing.translations || {};
      const langData = translations[activeEditorLang] || {};
      setEditing({
        ...editing,
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

  const handleAutoTranslate = async () => {
    if (!editing) return;
    setTranslating(true);
    try {
      const docWithTranslations = await autoTranslateDocument({
        label: editing.label,
        trend: editing.trend
      });
      if (docWithTranslations.translations) {
        setEditing({
          ...editing,
          translations: {
            ...((editing as any).translations || {}),
            ...docWithTranslations.translations
          }
        });
        alert('Metric translations generated successfully! Review language tabs.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate automatic translations.');
    } finally {
      setTranslating(false);
    }
  };

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
        <button onClick={() => { setActiveEditorLang('en'); setEditing({ label: '', value: '', trend: '', type: 'counter', order: metrics.length }); }} className="bg-cyan-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Metric</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center group">
            <div><h3 className="font-bold">{metric.label}</h3><p className="text-xl font-mono text-cyan-400">{metric.value}</p></div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setActiveEditorLang('en'); setEditing(metric); }} className="p-2 hover:bg-white/10 rounded-lg"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteCollectionDocument('qaMetrics', metric.id!).then(loadMetrics)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSave} className="bg-[#0b0e1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-cyan-400" /> Metric Detail</h3>
                <button type="button" onClick={() => setEditing(null)}><X /></button>
              </div>

              {/* Language Editor Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg w-full">
                {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveEditorLang(lang)}
                    className={cn(
                      "flex-1 py-1 rounded-md text-[9px] font-bold uppercase transition-[color,background-color] duration-150 cursor-pointer text-center",
                      activeEditorLang === lang 
                        ? "bg-cyan-600 text-white" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {lang}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={translating}
                  className="px-2.5 py-1 bg-cyan-600/10 hover:bg-cyan-600/20 disabled:opacity-50 text-cyan-400 rounded-md text-[9px] font-bold transition-all border border-cyan-500/20 ml-2"
                >
                  {translating ? <Loader2 className="w-3 h-3 animate-spin inline-block" /> : 'Auto'}
                </button>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Metric Label ({activeEditorLang.toUpperCase()})</label>
                  <input required placeholder="Metric Label" value={getFieldVal('label')} onChange={e => setFieldVal('label', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-cyan-500 outline-none" />
                </div>

                {activeEditorLang === 'en' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Metric Value (English Only)</label>
                    <input required placeholder="Value (e.g. 98%)" value={editing.value} onChange={e => setEditing({...editing, value: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-cyan-500 outline-none" />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Trend Description ({activeEditorLang.toUpperCase()})</label>
                  <input placeholder="Trend (e.g. +5% this sprint)" value={getFieldVal('trend')} onChange={e => setFieldVal('trend', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-cyan-500 outline-none" />
                </div>

                {activeEditorLang === 'en' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Metric Type</label>
                    <select value={editing.type} onChange={e => setEditing({...editing, type: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none">
                      <option value="counter" className="bg-[#0b0e1a]">Counter</option>
                      <option value="percentage" className="bg-[#0b0e1a]">Percentage</option>
                      <option value="health" className="bg-[#0b0e1a]">Health Score</option>
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 active:scale-[0.98] rounded-xl font-bold flex justify-center items-center gap-2 transition-all">{saving ? <Loader2 className="animate-spin text-white" /> : <Save />} Save Metric</button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
