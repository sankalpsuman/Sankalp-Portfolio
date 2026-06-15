import { useState, useEffect } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Plus, Trash2, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface Statistic {
  label: string;
  value: string;
}

interface WhyHireMeData {
  headline: string;
  description: string;
  statistics: Statistic[];
  highlights: string[];
  ctaText?: string;
  ctaUrl?: string;
}

export default function WhyHireMeEditor() {
  const [data, setData] = useState<WhyHireMeData>({
    headline: '7+ Years Driving Pristine Software Quality and AI Test Architecture',
    description: 'Highly experienced Test Architect specializing in Selenium, Playwright, performance JMeter rigs, and deploying localized Gemini AI test automation agents.',
    statistics: [
      { label: 'Years Experience', value: '7+' },
      { label: 'AI Test Automations', value: '100%' },
      { label: 'Sprint Cycles Saved', value: '35%' }
    ],
    highlights: [
      'Scrum Master & Team Facilitation leadership',
      'Advanced automation framework scaling (Cypress & Playwright)',
      'Intelligent exploratory QA with integrated Gemini agents',
      'Enterprise Fintech & Telecom QA governance'
    ],
    ctaText: 'Let\'s Connect',
    ctaUrl: '#contact'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Stats input states
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  // Highlight state
  const [newHighlight, setNewHighlight] = useState('');

  const docPath = 'settings/whyHireMe';

  useEffect(() => {
    async function load() {
      try {
        const docData = await getDocument<WhyHireMeData>(docPath);
        if (docData) {
          setData({
            ...docData,
            statistics: docData.statistics || [],
            highlights: docData.highlights || []
          });
        }
      } catch (e) {
        console.warn('Could not load Why Hire Me configurations:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDocument(docPath, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addStat = () => {
    if (!newStatLabel || !newStatValue) return;
    setData({
      ...data,
      statistics: [...data.statistics, { label: newStatLabel, value: newStatValue }]
    });
    setNewStatLabel('');
    setNewStatValue('');
  };

  const removeStat = (index: number) => {
    setData({
      ...data,
      statistics: data.statistics.filter((_, i) => i !== index)
    });
  };

  const addHighlight = () => {
    if (!newHighlight) return;
    setData({
      ...data,
      highlights: [...data.highlights, newHighlight]
    });
    setNewHighlight('');
  };

  const removeHighlight = (index: number) => {
    setData({
      ...data,
      highlights: data.highlights.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-8"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-500" />
            Recruiter Focus: Why Hire Me
          </h2>
          <p className="text-xs text-gray-500">A resume summary pit with targeted statistics & value propositions</p>
        </div>

        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-400 font-semibold animate-pulse">Changes Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Punchy Headline</label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => setData({ ...data, headline: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="Headline to instantly grab the hiring manager's attention..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Brief Pitch Narrative</label>
          <textarea
            rows={4}
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="State your unique value proposition, automation systems experience, and methodologies..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-white/5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">CTA Button Title</label>
            <input
              type="text"
              value={data.ctaText || ''}
              onChange={(e) => setData({ ...data, ctaText: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">CTA Button Target URL</label>
            <input
              type="text"
              value={data.ctaUrl || ''}
              onChange={(e) => setData({ ...data, ctaUrl: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Statistics Editor */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Metrics & Key Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.statistics.map((stat, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-blue-400">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeStat(i)}
                  className="p-1 px-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-end">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Statistic Value (E.g. "99.8%")</label>
              <input
                type="text"
                value={newStatValue}
                onChange={(e) => setNewStatValue(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Label (E.g. "SLA Guard Rate")</label>
              <input
                type="text"
                value={newStatLabel}
                onChange={(e) => setNewStatLabel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <button
              type="button"
              onClick={addStat}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Highlights List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Highlight Bullets List</h3>
          
          <div className="space-y-2">
            {data.highlights.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/[0.01] border border-white/5 px-4 py-2.5 rounded-xl text-sm text-gray-300">
                <span>🎯 {item}</span>
                <button
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-end">
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Highlight Selling Point</label>
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="E.g. Docker, K8s, CI/CD Jenkins setup"
              />
            </div>
            <button
              type="button"
              onClick={addHighlight}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Bullet
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
