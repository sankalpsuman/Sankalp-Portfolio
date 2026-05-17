import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDocument, HERO_DOC } from '../../services/firestoreService';
import { Download, Linkedin, Send, Calendar } from 'lucide-react';

interface HeroData {
  headline: string;
  titles: string[];
  description: string;
  resumeUrl?: string;
  linkedinUrl?: string;
}

const DEFAULT_TITLES = [
  'AI-Driven QA Lead',
  'Software Test Specialist',
  'Scrum Master',
  'AI Testing Engineer',
  'Prompt Engineering Professional'
];

interface GlobalSettings {
  calendlyUrl: string;
}

export default function Hero() {
  const [data, setData] = useState<HeroData | null>(null);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [hero, globalSettings] = await Promise.all([
          getDocument<HeroData>(HERO_DOC),
          getDocument<GlobalSettings>('settings/global')
        ]);
        if (hero) setData(hero);
        if (globalSettings) setSettings(globalSettings);
      } catch (err) {
        console.warn("Hero data load failed, using fallbacks:", err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % (data?.titles?.length || DEFAULT_TITLES.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [data]);

  const titles = data?.titles || DEFAULT_TITLES;

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#050816]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-600/5 blur-[80px] rounded-full animate-pulse will-change-[opacity]"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/5 blur-[80px] rounded-full will-change-transform"></div>
          <div 
            className="absolute inset-0 opacity-[0.02]" 
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '40px 40px' }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
             className="space-y-8 will-change-[transform,opacity]"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Available for new opportunities</span>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black tracking-tight text-white leading-tight will-change-transform">
              {data?.headline || "Hi, I'm Sankalp Suman"}
            </h1>

            <div className="h-12 lg:h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={titleIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent will-change-[transform,opacity]"
                >
                  {titles[titleIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            <p className="max-w-2xl mx-auto text-lg lg:text-xl text-gray-400 leading-relaxed">
              {data?.description || "Transforming modern software quality through AI-powered testing, intelligent automation, API validation, and Agile leadership."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <a 
                href={data?.resumeUrl || "#"} 
                target="_blank"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 group shadow-xl shadow-blue-900/10"
              >
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                Download Resume
              </a>
              
              <a 
                href="#contact"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Contact Me
              </a>

              {settings?.calendlyUrl && (
                <a 
                  href={settings.calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 group shadow-xl shadow-blue-500/5"
                >
                  <Calendar className="w-5 h-5" />
                  Strategy Session
                </a>
              )}
              <a 
                href={data?.linkedinUrl || "https://www.linkedin.com/in/sankalpsuman"} 
                target="_blank"
                className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Floating UI Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
