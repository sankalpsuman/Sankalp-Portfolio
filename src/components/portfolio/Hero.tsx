import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDocument, HERO_DOC } from '../../services/firestoreService';
import { Download, Linkedin, Send, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { AIResumeModal } from './AIResumeModal';
import { Tooltip } from './Tooltip';

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

  // Interactive 3D Parallax Tilt state for professional banner
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;

    setRotateX(-normalizedY * 6); // Max 6 degree tilt
    setRotateY(normalizedX * 6);  // Max 6 degree tilt
    setMouseX(normalizedX);
    setMouseY(normalizedY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setMouseX(0);
    setMouseY(0);
    setIsHovered(false);
  };

  const renderFormattedHeadline = (fullText: string) => {
    const nameEN = "Sankalp Suman";
    const nameHI = "संकल्प सुमन";
    
    if (fullText.includes(nameEN)) {
      const parts = fullText.split(nameEN);
      return (
        <>
          {parts[0]}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-brand to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(34,211,238,0.35)] select-none hover:scale-[1.02] transition-transform duration-500">
              {nameEN}
            </span>
          </span>
          {parts[1]}
        </>
      );
    } else if (fullText.includes(nameHI)) {
      const parts = fullText.split(nameHI);
      return (
        <>
          {parts[0]}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-brand to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(34,211,238,0.35)] select-none hover:scale-[1.02] transition-transform duration-500">
              {nameHI}
            </span>
          </span>
          {parts[1]}
        </>
      );
    }
    return fullText;
  };

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

             {/* Command Hub Container: Beautiful glassmorphic deck */}
             <div 
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
               onMouseEnter={() => setIsHovered(true)}
               style={{
                 transform: isHovered ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                 transition: isHovered ? 'none' : 'transform 0.5s ease-out',
               }}
               className="relative max-w-4xl mx-auto rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-10 mb-10 border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl shadow-2xl space-y-6 transform-gpu"
             >
               {/* Background Decorative Wrapper (Clipped) */}
               <div className="absolute inset-0 rounded-3xl sm:rounded-[2.5rem] overflow-hidden pointer-events-none">
                 {/* Outer decorative accents/watermarks */}
                 <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400/5 blur-[60px] pointer-events-none rounded-full" />
                 <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 blur-[60px] pointer-events-none rounded-full" />

                 {/* Watermark Logo Background Grid or Scope Circles */}
                 <div className="absolute left-[5%] top-[10%] opacity-15 pointer-events-none font-mono text-[9px] text-[#22d3ee]/30 text-left whitespace-nowrap hidden sm:block leading-relaxed">
                   RUNNING LOGS: SYSTEM_READY <br />
                   QA_LEAD: VERIFIED_PASS <br />
                   AST_PASS_STATE_99.9%
                 </div>
                 
                 <div className="absolute right-[5%] bottom-[10%] opacity-15 pointer-events-none font-mono text-[9px] text-[#22d3ee]/30 text-right hidden sm:block leading-relaxed">
                   SYS_ENGINE: ACTIVE <br />
                   CSM_ISTQB_SECURE_NODE <br />
                   AUTOMATION_COGNITIVE
                 </div>
               </div>

               {/* Glass corner design cues */}
               <div className="absolute top-4 left-4 border-t border-l border-white/10 w-4 h-4"></div>
               <div className="absolute top-4 right-4 border-t border-r border-white/10 w-4 h-4"></div>
               <div className="absolute bottom-4 left-4 border-b border-l border-white/10 w-4 h-4"></div>
               <div className="absolute bottom-4 right-4 border-b border-r border-white/10 w-4 h-4"></div>

               {/* Real Name Headline */}
               <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.05] will-change-transform font-display">
                 {renderFormattedHeadline(getLocalizedField(data, 'headline', 'hero.headline'))}
               </h1>

               {/* Active Sub-role Rotating Badge with tech parentheses */}
               <div className="flex items-center justify-center gap-2 sm:gap-3">
                 <span className="text-white/20 font-mono text-[10px] sm:text-xs">/</span>
                 <div className="h-7 sm:h-10 flex items-center justify-center">
                   <AnimatePresence mode="wait">
                     <motion.span
                       key={titleIndex}
                       initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                       animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                       exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                       transition={{ duration: 0.35, ease: "easeOut" }}
                       className="text-sm sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-[0.2em] select-none font-display h-auto uppercase"
                     >
                       {titles[titleIndex]}
                     </motion.span>
                   </AnimatePresence>
                 </div>
                 <span className="text-white/20 font-mono text-[10px] sm:text-xs">/</span>
               </div>

               {/* Tech separator bar with terminal prompt style */}
               <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                 <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                 <span className="text-[9px] font-mono tracking-widest text-[#22d3ee]/60 uppercase bg-[#050816]/60 px-2 py-0.5 rounded border border-white/5 select-none flex items-center gap-1.5">
                   <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping"></span>
                   console.active
                 </span>
                 <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
               </div>

               {/* High precision description */}
               <p className="max-w-xl mx-auto text-xs sm:text-base text-gray-400/90 leading-relaxed font-sans px-4 font-medium tracking-tight">
                 {getLocalizedField(data, 'description', 'hero.description')}
               </p>

                {/* Button grid inside HUD container */}
                <div className="flex flex-row flex-nowrap items-center justify-center gap-3 sm:gap-6 pt-4 max-w-full relative z-30">
                  <Tooltip content={t('hero.btn_resume')}>
                    <a 
                      href={data?.resumeUrl || "#"} 
                      target="_blank"
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-brand text-white hover:text-white rounded border border-white/10 hover:border-brand/50 transition-all flex items-center justify-center group shadow-lg shadow-brand/5 shrink-0 relative overflow-hidden"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </Tooltip>
                  
                  <Tooltip content="AI Resume">
                    <div className="shrink-0">
                      <AIResumeModal />
                    </div>
                  </Tooltip>
                  
                  <Tooltip content={t('hero.btn_contact')}>
                    <a 
                      href="#contact"
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-cyan-500 text-white hover:text-white rounded border border-white/10 hover:border-cyan-500/50 transition-all flex items-center justify-center shrink-0"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </Tooltip>

                  {settings?.calendlyUrl && (
                    <Tooltip content={t('hero.btn_strategy')}>
                      <a 
                        href={settings.calendlyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-9 h-9 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-purple-500 text-white hover:text-white rounded border border-white/10 hover:border-purple-500/50 transition-all flex items-center justify-center group shrink-0"
                      >
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    </Tooltip>
                  )}
                  
                  <Tooltip content="LinkedIn">
                    <a 
                      href={data?.linkedinUrl || "https://www.linkedin.com/in/sankalpsuman"} 
                      target="_blank"
                      className="w-9 h-9 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-blue-600 text-white hover:text-white rounded border border-white/10 hover:border-blue-600/50 transition-all flex items-center justify-center shrink-0"
                    >
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  </Tooltip>
                </div>
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
