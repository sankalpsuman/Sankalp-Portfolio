import { useState, useEffect } from 'react';
import { CONTACT_DOC, getDocument, saveDocument } from '../../services/firestoreService';
import { Save, Loader2, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '../../lib/utils';

export default function ContactEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    async function load() {
      const data = await getDocument(CONTACT_DOC);
      if (data) {
        Object.entries(data).forEach(([key, value]) => setValue(key, value));
      }
      setLoading(false);
    }
    load();
  }, [setValue]);

  const [saved, setSaved] = useState(false);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await saveDocument(CONTACT_DOC, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-[#050816] border border-white/5 rounded-2xl p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
           <h3 className="text-xl font-bold">Contact Information</h3>
           <button 
             type="submit" 
             disabled={saving} 
             className={cn(
               "flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all text-sm font-bold disabled:opacity-50",
               saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
             )}
           >
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Info'}
           </button>
        </div>

        <div className="space-y-4">
           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Mail className="w-3 h-3" /> Email</label>
              <input {...register('email')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Phone className="w-3 h-3" /> Phone</label>
              <input {...register('phone')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</label>
              <input {...register('location')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
           </div>
           <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono flex items-center gap-2"><Linkedin className="w-3 h-3" /> LinkedIn URL</label>
              <input {...register('linkedin')} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none" />
           </div>
        </div>
      </form>
    </div>
  );
}
