import { useState, useEffect } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Calendar, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface BookMeetingData {
  calendlyUrl: string;
  googleCalendarUrl?: string;
  ctaTitle: string;
  ctaDescription: string;
}

export default function BookMeetingEditor() {
  const [data, setData] = useState<BookMeetingData>({
    calendlyUrl: 'https://calendly.com/your-profile',
    googleCalendarUrl: '',
    ctaTitle: 'Schedule a 15-Minute Sync with Me',
    ctaDescription: 'Find a time that suits you on my calendar to discuss potential contracts, consulting, or interview loops.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const docPath = 'settings/bookMeeting';

  useEffect(() => {
    async function load() {
      try {
        const docData = await getDocument<BookMeetingData>(docPath);
        if (docData) {
          setData(docData);
        }
      } catch (e) {
        console.warn('Could not load booking settings:', e);
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
      className="max-w-xl mx-auto bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Book a Meeting CMS
          </h2>
          <p className="text-xs text-gray-500">Configure scheduling tool integration parameters</p>
        </div>

        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-green-400 font-semibold animate-pulse">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Link
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">CTA Section Header</label>
          <input
            type="text"
            value={data.ctaTitle}
            onChange={(e) => setData({ ...data, ctaTitle: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="Book a 15-Minute Sync"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">CTA Description / Detail</label>
          <textarea
            rows={3}
            value={data.ctaDescription}
            onChange={(e) => setData({ ...data, ctaDescription: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="Introduce active contracts or notices..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
            Calendly URL Link
          </label>
          <input
            type="text"
            value={data.calendlyUrl}
            onChange={(e) => setData({ ...data, calendlyUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="https://calendly.com/userName"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
            Google Calendar Appointment URL (Optional)
          </label>
          <input
            type="text"
            value={data.googleCalendarUrl || ''}
            onChange={(e) => setData({ ...data, googleCalendarUrl: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="https://calendar.google.com/appointments/schedules/..."
          />
        </div>
      </div>
    </motion.div>
  );
}
