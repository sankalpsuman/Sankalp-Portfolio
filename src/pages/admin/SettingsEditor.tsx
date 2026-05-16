import React, { useState, useEffect, ChangeEvent } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Settings2, Save, Loader2, Palette, Globe, Shield, ToggleLeft, ToggleRight, FileUp, Link as LinkIcon, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface GlobalSettings {
  themeColor: string;
  enableBlog: boolean;
  enableAI: boolean;
  enableTimeline: boolean;
  enableTestimonials: boolean;
  enableMetrics: boolean;
  enableImpactStories: boolean;
  calendlyUrl: string;
  resumeUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  logoUrl: string;
}

const SETTINGS_DOC = 'settings/global';

export default function SettingsEditor() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getDocument<GlobalSettings>(SETTINGS_DOC);
      if (data) {
        setSettings(data);
      } else {
        setSettings({
          themeColor: '#3b82f6',
          enableBlog: true,
          enableAI: true,
          enableTimeline: true,
          enableTestimonials: true,
          enableMetrics: true,
          enableImpactStories: true,
          calendlyUrl: '',
          resumeUrl: '',
          githubUrl: '',
          linkedinUrl: '',
          logoUrl: ''
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await saveDocument(SETTINGS_DOC, settings);
    setSaving(false);
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setSettings({ ...settings, logoUrl: url });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!settings) return null;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings2 className="text-gray-400" />
          Global Site Settings
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Appearance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Appearance
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Primary Theme Color</label>
                <div className="flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-xl border border-white/10" style={{ backgroundColor: settings.themeColor }}></div>
                   <input 
                     type="text" 
                     value={settings.themeColor}
                     onChange={e => setSettings({...settings, themeColor: e.target.value})}
                     className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono truncate"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Feature Control
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'enableBlog', label: 'Blog System' },
                { key: 'enableAI', label: 'AI Playground' },
                { key: 'enableTimeline', label: 'Career Journey' },
                { key: 'enableTestimonials', label: 'Testimonials' },
                { key: 'enableMetrics', label: 'QA Metrics' },
                { key: 'enableImpactStories', label: 'Impact Stories' },
              ].map(item => (
                <button 
                  key={item.key}
                  type="button"
                  onClick={() => setSettings({...settings, [item.key]: !settings[item.key as keyof GlobalSettings]})}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                    settings[item.key as keyof GlobalSettings] 
                      ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                      : "bg-white/2 border-white/5 text-gray-500"
                  )}
                >
                  <span className="text-xs font-medium">{item.label}</span>
                  {settings[item.key as keyof GlobalSettings] ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* External Links */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
           <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Globe className="w-4 h-4" /> External Integrations
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'calendlyUrl', label: 'Calendly Booking URL', placeholder: 'https://calendly.com/your-username' },
                { key: 'resumeUrl', label: 'Resume Drive Link', placeholder: 'https://drive.google.com/...' },
                { key: 'githubUrl', label: 'GitHub Profile', placeholder: 'https://github.com/...' },
                { key: 'linkedinUrl', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/...' },
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <label className="text-xs text-gray-400">{item.label}</label>
                  <input 
                    type="url"
                    value={settings[item.key as keyof GlobalSettings] as string}
                    onChange={e => setSettings({...settings, [item.key]: e.target.value})}
                    placeholder={item.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div className="space-y-2 md:col-span-2 pt-4 border-t border-white/5">
                <label className="text-xs text-gray-400">Site Logo (OG Preview & Navbar Fallback)</label>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full space-y-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer group bg-white/2">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      ) : (
                        <FileUp className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                      <div className="text-center mt-3">
                        <span className="text-sm font-medium text-gray-400 group-hover:text-white block">
                          {uploading ? 'Uploading Image...' : 'Upload Logo Image'}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1 block">PNG, JPG or SVG (Max 5MB)</span>
                      </div>
                    </label>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Or Paste URL Directly</span>
                        {settings.logoUrl && (
                          <button 
                            type="button"
                            onClick={() => setSettings({...settings, logoUrl: ''})}
                            className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <X className="w-2.5 h-2.5" /> Clear Logo
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input 
                          type="url"
                          value={settings.logoUrl || ''}
                          onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                          placeholder="https://your-logo-url.png"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 pr-10"
                        />
                        <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500">This image will appear in social previews when a specific page image is missing.</p>
                  </div>
                  
                  {settings.logoUrl && (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-white/5 p-4 flex items-center justify-center relative group">
                      <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo Preview" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Logo Preview</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:translate-x-0 z-[60]">
           <button 
             type="submit" 
             disabled={saving}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
           >
             {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             Update Global Configuration
           </button>
        </div>
      </form>
    </div>
  );
}
