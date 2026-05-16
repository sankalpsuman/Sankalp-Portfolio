import React, { useState, useEffect, ChangeEvent } from 'react';
import { getDocument, saveDocument } from '../../services/firestoreService';
import { Settings2, Save, Loader2, Palette, Globe, Shield, ToggleLeft, ToggleRight, FileUp, Link as LinkIcon, X, Check, ExternalLink, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

type TabType = 'general' | 'features' | 'integrations';

export default function SettingsEditor() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');

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

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saved]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await saveDocument(SETTINGS_DOC, settings);
      setSaved(true);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Loading Configuration...</p>
      </div>
    );
  }
  
  if (!settings) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'features', label: 'Features', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            Global Settings
          </h2>
          <p className="text-gray-400 text-sm mt-1">Configure your site's core identity, features, and external links.</p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-xs font-bold border border-green-400/20"
              >
                <Check className="w-3.5 h-3.5" /> Changes Published
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            form="settings-form"
            type="submit" 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm shadow-lg shadow-blue-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Publishing...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl sticky top-24 z-10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 lg:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group",
                  activeTab === tab.id ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600/20 border border-blue-500/20 rounded-xl"
                  />
                )}
                <Icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-blue-400" : "group-hover:text-gray-300")} />
                <span className="text-sm font-bold relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <form id="settings-form" onSubmit={handleSave} className="flex-1 w-full pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white/2 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl"
            >
              {activeTab === 'general' && (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <Palette className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Branding & Appearance</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Core visual identity settings</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">PRIMARY BRAND COLOR</label>
                        <div className="flex gap-4 items-center">
                          <input 
                            type="color" 
                            value={settings.themeColor}
                            onChange={e => setSettings({...settings, themeColor: e.target.value})}
                            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 p-1.5 cursor-pointer hover:border-blue-500/50 transition-colors"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="relative group">
                              <input 
                                type="text" 
                                value={settings.themeColor}
                                onChange={e => setSettings({...settings, themeColor: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 outline-none transition-all"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.themeColor }} />
                              Active Theme HEX
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-3 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Sparkles className="w-12 h-12 text-yellow-400" />
                           </div>
                           <div className="flex items-center gap-2 text-xs font-black text-gray-300 uppercase tracking-wider">
                             <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Dynamic UI Skin
                           </div>
                           <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Your primary branding color propagates through button backgrounds, border-glows, and text highlights sitewide.</p>
                         </div>
                      </div>
                    </div>
                  </section>

                  <section className="pt-12 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Moon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Visual Assets</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Logo and identity files</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1 w-full space-y-6">
                          <div className="space-y-4">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">SITE LOGO / AVATAR</label>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-10 hover:border-blue-500/50 transition-all cursor-pointer group bg-white/2 hover:bg-white/5 relative overflow-hidden shadow-2xl">
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={uploading}
                              />
                              {uploading ? (
                                <div className="flex flex-col items-center gap-3">
                                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                  <span className="text-[10px] font-black text-blue-400 tracking-[0.25em] animate-pulse">UPLOADING...</span>
                                </div>
                              ) : (
                                <>
                                  <FileUp className="w-10 h-10 text-gray-500 group-hover:text-blue-500 transition-all transform group-hover:-translate-y-1" />
                                  <span className="text-sm font-black text-gray-400 group-hover:text-white mt-4">Drop Logo Here</span>
                                  <span className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">PNG, SVG or JPG (Best: 1:1)</span>
                                </>
                              )}
                            </label>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">External Resource URL</span>
                              {settings.logoUrl && (
                                <button 
                                  type="button"
                                  onClick={() => setSettings({...settings, logoUrl: ''})}
                                  className="text-[10px] text-red-500/80 hover:text-red-400 transition-colors flex items-center gap-1 font-black uppercase tracking-widest"
                                >
                                  <X className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>
                            <div className="relative group">
                              <input 
                                type="url"
                                value={settings.logoUrl || ''}
                                onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                                placeholder="https://cdn.image.com/logo.png"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-blue-500 pr-10 transition-all"
                              />
                              <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                          </div>
                        </div>
                        
                        {settings.logoUrl && (
                          <div className="w-full md:w-64 space-y-4">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Live Asset Preview</label>
                            <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center gap-4 group relative overflow-hidden shadow-2xl flex-shrink-0">
                              <div className="w-full h-full flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-110">
                                <img src={settings.logoUrl} className="max-w-full max-h-full object-contain filter drop-shadow-[0_10px_30px_rgba(59,130,246,0.3)]" alt="Logo Preview" referrerPolicy="no-referrer" />
                              </div>
                              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <Shield className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Modular Architecture</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Enable or disable site components</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'enableBlog', label: 'Engineering Blog', desc: 'Personal engineering blog and posts' },
                        { key: 'enableAI', label: 'AI Interactive Space', desc: 'Interactive AI tools and playgrounds' },
                        { key: 'enableTimeline', label: 'Professional Timeline', desc: 'Animated career progress visualization' },
                        { key: 'enableTestimonials', label: 'Peer Testimonials', desc: 'Client and peer feedback carousel' },
                        { key: 'enableMetrics', label: 'Quality Analytics', desc: 'Live QA metrics and data visualization' },
                        { key: 'enableImpactStories', label: 'Strategic Impact', desc: 'Case studies for complex problem solving' },
                      ].map(item => (
                        <button 
                          key={item.key}
                          type="button"
                          onClick={() => setSettings({...settings, [item.key]: !settings[item.key as keyof GlobalSettings]})}
                          className={cn(
                            "flex items-start gap-4 p-6 rounded-2xl border transition-all text-left group active:scale-[0.98] outline-none",
                            settings[item.key as keyof GlobalSettings] 
                              ? "bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/10" 
                              : "bg-white/2 border-white/5 hover:bg-white/5"
                          )}
                        >
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg",
                            settings[item.key as keyof GlobalSettings] 
                              ? "bg-blue-600 text-white shadow-blue-600/20" 
                              : "bg-white/5 text-gray-600 group-hover:bg-white/10 group-hover:text-gray-400"
                          )}>
                            {settings[item.key as keyof GlobalSettings] ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-sm font-black tracking-tight mb-1 transition-colors uppercase", 
                              settings[item.key as keyof GlobalSettings] ? "text-white" : "text-gray-500"
                            )}>
                              {item.label}
                            </div>
                            <p className={cn(
                              "text-[10px] leading-relaxed font-bold uppercase tracking-wider transition-colors",
                              settings[item.key as keyof GlobalSettings] ? "text-blue-200/60" : "text-gray-600"
                            )}>
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="pt-10">
                    <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-start gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Shield className="w-12 h-12 text-orange-400" />
                      </div>
                      <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Architecture Note</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          Disabling a feature will automatically hide the associated navigation links and homepage sections. This allows for a clean transition between portfolio phases.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
                        <Globe className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Ecosystem Connections</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Social links and third-party tools</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                      {[
                        { key: 'calendlyUrl', label: 'Calendly Connector', placeholder: 'https://calendly.com/user', icon: Globe },
                        { key: 'resumeUrl', label: 'Asset Storage (Resume)', placeholder: 'https://drive.google.com/...', icon: Save },
                        { key: 'githubUrl', label: 'GitHub Repository', placeholder: 'https://github.com/user', icon: ExternalLink },
                        { key: 'linkedinUrl', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/user', icon: ExternalLink },
                      ].map(item => (
                        <div key={item.key} className="space-y-3 group">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-blue-400 transition-colors ml-1">{item.label}</label>
                          <div className="relative">
                            <input 
                              type="url"
                              value={settings[item.key as keyof GlobalSettings] as string}
                              onChange={e => setSettings({...settings, [item.key]: e.target.value})}
                              placeholder={item.placeholder}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-blue-500 focus:bg-blue-600/5 transition-all text-white placeholder:text-white/10 font-medium"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg border border-white/10 pointer-events-none group-focus-within:border-blue-500/50 transition-colors">
                              <item.icon className="w-3.5 h-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="pt-10">
                    <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex items-start gap-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe className="w-12 h-12 text-green-400" />
                      </div>
                      <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                        <Sparkles className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Configuration Hint</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                          These identifiers power the dynamic CTA blocks sitewide. Verify that your URLs use the <code className="text-blue-400 font-mono">https://</code> protocol to ensure cross-origin safety and analytics tracking.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}
