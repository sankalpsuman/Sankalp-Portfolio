import { useState, useEffect } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AvailabilityData {
  openToWork: boolean;
  globalOpportunities: boolean;
  openAcrossIndia: boolean;
  remoteFriendly: boolean;
  hybrid: boolean;
  onsite: boolean;
  relocationAvailable: boolean;
  contractConsulting: boolean;
  fullTimeRoles: boolean;
  note?: string;
  lastUpdated?: string;
}

export default function AvailabilityEditor() {
  const [data, setData] = useState<AvailabilityData>({
    openToWork: true,
    globalOpportunities: true,
    openAcrossIndia: true,
    remoteFriendly: true,
    hybrid: true,
    onsite: true,
    relocationAvailable: true,
    contractConsulting: true,
    fullTimeRoles: true,
    note: 'Actively exploring leadership roles in QA, Test Automation, and AI-driven Quality Engineering.',
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const docPath = 'settings/availability';

  useEffect(() => {
    async function load() {
      try {
        const docData = await getDocument<any>(docPath);
        if (docData) {
          // Map fields with defaults for migration
          setData({
            openToWork: docData.openToWork ?? true,
            globalOpportunities: docData.globalOpportunities ?? true,
            openAcrossIndia: docData.openAcrossIndia ?? true,
            remoteFriendly: docData.remoteFriendly ?? docData.openToRemote ?? true,
            hybrid: docData.hybrid ?? true,
            onsite: docData.onsite ?? true,
            relocationAvailable: docData.relocationAvailable ?? docData.openToUSA ?? true,
            contractConsulting: docData.contractConsulting ?? docData.openToContract ?? true,
            fullTimeRoles: docData.fullTimeRoles ?? true,
            note: docData.note || 'Actively exploring leadership roles in QA, Test Automation, and AI-driven Quality Engineering.',
            lastUpdated: docData.lastUpdated
          });
        }
      } catch (e) {
        console.warn('Could not load availability settings:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      await saveDocument(docPath, payload);
      setData(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Save failed');
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

  const toggleField = (field: keyof AvailabilityData) => {
    if (typeof data[field] === 'boolean') {
      setData({
        ...data,
        [field]: !data[field]
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Recruiter Hub Management
          </h2>
          <p className="text-xs text-gray-500">Configure search parameters and status updates</p>
        </div>

        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-400 font-semibold animate-pulse">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Status
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex gap-3 text-xs text-blue-400 leading-relaxed">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>These settings power your live **Availability Badge** and dynamically direct recruiter leads based on matching parameters.</p>
        </div>

        <div className="space-y-3">
          {[
            { key: 'openToWork' as const, label: 'Actively Open to Work' },
            { key: 'globalOpportunities' as const, label: 'Open to Global Opportunities' },
            { key: 'openAcrossIndia' as const, label: 'Open Across India' },
            { key: 'remoteFriendly' as const, label: 'Remote Friendly' },
            { key: 'hybrid' as const, label: 'Hybrid Availability' },
            { key: 'onsite' as const, label: 'Onsite Availability' },
            { key: 'relocationAvailable' as const, label: 'Relocation Available' },
            { key: 'contractConsulting' as const, label: 'Contract / Consulting' },
            { key: 'fullTimeRoles' as const, label: 'Full-Time Roles' }
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
            >
              <input
                type="checkbox"
                checked={data[item.key] || false}
                onChange={() => toggleField(item.key)}
                className="w-4 h-4 accent-blue-500"
              />
              <span className="text-sm font-medium text-gray-200">{item.label}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Professional Career Summary (Recruiter Hub)</label>
          <textarea
            rows={3}
            value={data.note || ''}
            onChange={(e) => setData({ ...data, note: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. Actively exploring leadership roles in QA, Test Automation, and AI-driven Quality Engineering..."
          />
        </div>

        <div className="text-[10px] text-gray-500 flex items-center justify-between">
          <span>Active Status Badge</span>
          <span>Last Updated: {data.lastUpdated || 'Never'}</span>
        </div>
      </div>
    </motion.div>
  );
}
