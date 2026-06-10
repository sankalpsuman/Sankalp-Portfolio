import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDocument, HERO_DOC } from '../../services/firestoreService';
import { Download, Linkedin, Send, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { AIResumeModal } from './AIResumeModal';

interface HeroData {
  headline: string;
  titles: string[];
  description: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  translations?: Record<string, any>;
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
  const { t, tArray, language } = useLanguage();

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

  const fallbackTitles = tArray('hero.titles');
  const titles = (language === 'en')
    ? (data?.titles && data.titles.length > 0 ? data.titles : fallbackTitles.length > 0 ? fallbackTitles : DEFAULT_TITLES)
    : (data?.translations?.[language]?.titles && data.translations[language].titles.length > 0 ? data.translations[language].titles : fallbackTitles.length > 0 ? fallbackTitles : DEFAULT_TITLES);

  useEffect(() => {
    const titlesCount = titles.length;
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titlesCount);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles]);

  const getLocalizedField = (dbData: any, fieldName: string, localTKey: string) => {
    if (!dbData) return t(localTKey);
    if (language === 'en') return dbData[fieldName] || t(localTKey);
    const translatedVal = dbData?.translations?.[language]?.[fieldName];
    if (translatedVal && typeof translatedVal === 'string' && translatedVal.trim() !== '') {
      return translatedVal;
    }
    return t(localTKey);
  };

  return (
    <>
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#050816]">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-brand/5 blur-[80px] rounded-full animate-pulse will-change-[opacity]"></div>
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-xs font-mono text-brand uppercase tracking-widest">{t('hero.badge')}</span>
            </div>

             <h1 className="text-5xl lg:text-8xl font-black tracking-tight text-white leading-tight will-change-transform">
              {getLocalizedField(data, 'headline', 'hero.headline')}
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
              {getLocalizedField(data, 'description', 'hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-4 max-w-3xl mx-auto w-full px-4">
              <a 
                href={data?.resumeUrl || "#"} 
                target="_blank"
                className="h-10 px-5 bg-brand hover:brightness-110 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-md shadow-brand/10 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>{t('hero.btn_resume')}</span>
              </a>
              
              <AIResumeModal />
              
              <a 
                href="#contact"
                className="h-10 px-5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Send className="w-4 h-4" />
                <span>{t('hero.btn_contact')}</span>
              </a>

              {settings?.calendlyUrl && (
                <a 
                  href={settings.calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 px-5 bg-gradient-to-r from-brand to-brand/80 hover:brightness-110 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-md shadow-brand/5 w-full sm:w-auto max-w-xs sm:max-w-none"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('hero.btn_strategy')}</span>
                </a>
              )}
              
              <a 
                href={data?.linkedinUrl || "https://www.linkedin.com/in/sankalpsuman"} 
                target="_blank"
                className="h-10 px-5 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#00a0dc] hover:text-white rounded-lg border border-[#0077b5]/30 hover:border-[#0077b5] transition-all flex items-center justify-center gap-2 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Floating UI Elements */}
        <button 
          onClick={() => {
            const el = document.getElementById('about');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 cursor-pointer group focus:outline-none border-none bg-transparent hover:brightness-110 active:scale-95 transition-transform"
        >
          <span className="text-[10px] font-mono text-gray-500 group-hover:text-brand uppercase tracking-widest transition-colors">{t('hero.scroll')}</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border-2 border-white/20 group-hover:border-brand/40 rounded-full flex justify-center pt-2 transition-colors"
          >
            <div className="w-1 h-1 bg-brand rounded-full animate-pulse"></div>
          </motion.div>
        </button>
      </section>
    </>
  );
}
