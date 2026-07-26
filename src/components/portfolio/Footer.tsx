import { Cpu, Github, Linkedin, Mail, Twitter, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocument } from '../../services/firestoreService';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'motion/react';
import { SessionTimer } from './SessionTimer';

interface GlobalSettings {
  calendlyUrl: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getDocument<GlobalSettings>('settings/global');
      if (data) setSettings(data);
    }
    load();
  }, []);

  const footerNavs = [
    { label: t('nav.about'), href: '/#about' },
    { label: t('nav.journey'), href: '/#experience' },
    { label: t('nav.projects'), href: '/#projects' },
    { label: t('nav.toolkit'), href: '/#skills' },
    { label: t('nav.inquire'), href: '/#contact' }
  ];

  return (
    <footer className="bg-space-950 pt-32 pb-12 relative overflow-hidden">
      {/* Background Large Text Decor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none z-0">
        <h2 className="text-[20vw] font-black text-white/[0.02] tracking-tighter leading-none uppercase">
          Sankalp
        </h2>
      </div>

      {/* Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          {/* Brand Block */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tighter uppercase block leading-none">Sankalp Suman</span>
                <span className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mt-1 block">Lead Quality Engineer</span>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              {t('footer.pioneering')}
            </p>
            <div className="flex gap-4">
              {[
                { icon: Linkedin, href: "https://linkedin.com/in/sankalpsuman", color: "hover:bg-blue-600" },
                { icon: Github, href: "https://github.com/sankalpsuman", color: "hover:bg-slate-800" },
                { icon: Twitter, href: "https://twitter.com/sankalpsuman", color: "hover:bg-blue-400" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className={`w-12 h-12 rounded-2xl glass-card flex items-center justify-center transition-all ${social.color} group`}
                >
                  <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {footerNavs.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Block */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Quick Protocol</h4>
            <div className="space-y-6">
              {settings?.calendlyUrl && (
                <a 
                  href={settings.calendlyUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 glass-card rounded-2xl hover:bg-white/[0.05] transition-all group"
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-widest">{t('footer.book_session')}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Schedule a sync session</div>
                  </div>
                </a>
              )}
              <div className="flex items-center gap-4 p-4 glass-card rounded-2xl">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-widest">Email Node</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">sankalpsmn@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>© {currentYear} SANKALP SUMAN</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="flex items-center gap-1.5">
              Built for <Sparkles className="w-3 h-3 text-blue-500" /> Quality
            </span>
            <span className="w-1 h-1 bg-slate-800 rounded-full hidden sm:inline-block" />
            <SessionTimer variant="footer" className="mt-1 sm:mt-0" />
          </div>
          
          <div className="flex items-center gap-8">
            <Link to="/admin/login" className="text-[10px] font-bold text-slate-600 hover:text-white transition-all uppercase tracking-widest">Admin Control</Link>
            <div className="flex items-center gap-6">
               <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-white transition-all uppercase tracking-widest">Privacy</a>
               <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-white transition-all uppercase tracking-widest">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
