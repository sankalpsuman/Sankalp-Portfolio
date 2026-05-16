import { motion } from 'motion/react';
import { Cpu, Github, Linkedin, Mail, Twitter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDocument } from '../../services/firestoreService';

interface GlobalSettings {
  calendlyUrl: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function load() {
      const data = await getDocument<GlobalSettings>('settings/global');
      if (data) setSettings(data);
    }
    load();
  }, []);

  return (
    <footer className="bg-[#050816] border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter uppercase">Sankalp Suman</span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Pioneering the future of quality engineering through AI-driven automation and intelligent testing strategies.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all group">
                <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gray-800 hover:border-white transition-all group">
                <Github className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-400 hover:border-blue-400 transition-all group">
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-4">
              {['About', 'Experience', 'Projects', 'Skills', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-500 hover:text-blue-400 transition-colors text-sm">{item}</a>
                </li>
              ))}
              {settings?.calendlyUrl && (
                <li>
                  <a 
                    href={settings.calendlyUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-bold flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Session
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-4">
               <li className="flex items-center gap-3 text-gray-500 text-sm">
                  <Mail className="w-4 h-4" />
                  sankalpsmn@gmail.com
               </li>
               <li className="text-gray-500 text-xs leading-relaxed italic">
                  Based in Delhi NCR, working globally.
               </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-xs font-mono uppercase tracking-widest">
            © {currentYear} Sankalp Suman. Built with React & Intelligence.
          </p>
          <div className="flex items-center gap-6">
             <Link to="/admin/login" className="text-gray-600 hover:text-blue-400 transition-colors text-[10px] uppercase tracking-widest font-bold">Sankalp Login</Link>
             <a href="#" className="text-gray-600 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">Privacy Protocol</a>
             <a href="#" className="text-gray-600 hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold">Security Standards</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
