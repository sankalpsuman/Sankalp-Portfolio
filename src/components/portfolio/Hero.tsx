import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDocument, HERO_DOC } from '../../services/firestoreService';
import { Download, Linkedin, Send, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { AIResumeModal } from './AIResumeModal';
import heroBanner from '../../assets/images/hero_banner_1782037048434.jpg';

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
            <span className="bg-gradient-to-r from-cyan-400 via-brand to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(34,211,238,0.35)] select-none">
              {nameEN}
            </span>
            <span className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/80 to-purple-500/80 rounded-full blur-[1px] transform scale-x-100 origin-left hover:scale-x-105 transition-transform" />
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
            <span className="bg-gradient-to-r from-cyan-400 via-brand to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(34,211,238,0.35)] select-none">
              {nameHI}
            </span>
            <span className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400/80 to-purple-500/80 rounded-full blur-[1px]" />
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

            {/* Premium Header Banner Showcase */}
            <div className="relative max-w-5xl mx-auto mt-4" style={{ perspective: '1200px' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateX: isHovered ? rotateX : 0,
                  rotateY: isHovered ? rotateY : 0,
                }}
                transition={{ 
                  scale: { delay: 0.2, duration: 0.8, ease: "easeOut" },
                  rotateX: { type: "spring", damping: 25, stiffness: 200, mass: 0.5 },
                  rotateY: { type: "spring", damping: 25, stiffness: 200, mass: 0.5 }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] hover:shadow-[0_0_55px_rgba(59,130,246,0.28)] group transition-shadow duration-500 bg-[#0c102b]/40 backdrop-blur-sm p-1.5 cursor-crosshair select-none"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-purple-500/5 to-cyan-500/10 opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-brand/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-750 pointer-events-none rounded-3xl"></div>
                
                <div className="relative rounded-[1.35rem] overflow-hidden border border-white/5 bg-[#050816]">
                  {/* Opposite parallax shift on profile image so person appears moving relative to borders! */}
                  <div className="scale-[1.03] origin-center w-full h-full">
                    <motion.img 
                      src={heroBanner}
                      alt="Quality Today. Intelligence Tomorrow. Sankalp Suman - R&D Software Test Specialist & Scrum Master"
                      referrerPolicy="no-referrer"
                      style={{
                        x: -mouseX * 10,
                        y: -mouseY * 10,
                      }}
                      animate={{
                        x: isHovered ? -mouseX * 10 : 0,
                        y: isHovered ? -mouseY * 10 : 0,
                      }}
                      transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
                      className="w-full h-auto object-cover relative z-10 select-none group-hover:scale-[1.015] transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Dynamic Cursor Spotlight Flare */}
                  {isHovered && (
                    <motion.div 
                      style={{
                        left: `${(mouseX + 0.5) * 100}%`,
                        top: `${(mouseY + 0.5) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      transition={{ type: "spring", damping: 35, stiffness: 180, mass: 0.2 }}
                      className="absolute bg-gradient-to-tr from-cyan-400/14 to-brand/12 w-80 h-80 rounded-full blur-[65px] z-20 pointer-events-none mix-blend-screen"
                    />
                  )}

                  {/* 3D Floating Cyber Watermark HUD */}
                  <motion.div
                    style={{
                      x: mouseX * 18,
                      y: mouseY * 18,
                    }}
                    animate={{
                      x: isHovered ? mouseX * 18 : 0,
                      y: isHovered ? mouseY * 18 : 0,
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
                    className="absolute inset-0 z-25 pointer-events-none p-5 sm:p-7 flex flex-col justify-between"
                  >
                    {/* Top HUD Label elements */}
                    <div className="flex justify-between items-start font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.25em] text-cyan-400/80">
                      <div className="bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded border border-white/5 flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                        <span>AGILE_FLOW: NOMINAL</span>
                      </div>
                      <div className="bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded border border-white/5 flex items-center gap-1.3 shadow-md">
                        <span>STSM_MASTER_R&D</span>
                      </div>
                    </div>

                    {/* Laser Sight / Corner Watermark Brackets */}
                    <div className="absolute top-5 left-5 border-t-2 border-l-2 border-cyan-400/40 w-5 h-5 rounded-tl-sm"></div>
                    <div className="absolute top-5 right-5 border-t-2 border-r-2 border-cyan-400/40 w-5 h-5 rounded-tr-sm"></div>
                    <div className="absolute bottom-5 left-5 border-b-2 border-l-2 border-cyan-400/40 w-5 h-5 rounded-bl-sm"></div>
                    <div className="absolute bottom-5 right-5 border-b-2 border-r-2 border-cyan-400/40 w-5 h-5 rounded-br-sm"></div>

                    {/* Bottom Tech Grid Statistics Watermark */}
                    <div className="flex justify-between items-end font-mono text-[8px] tracking-wider text-white/50">
                      <div className="bg-black/50 backdrop-blur-xs p-2 sm:p-2.5 rounded border border-white/5 space-y-0.5 text-left leading-tight">
                        <div className="text-cyan-400 font-bold text-[7px] sm:text-[9px]">AUTOMATION SUITES</div>
                        <div className="text-[6px] sm:text-[8px] opacity-75">STATUS: 100% COVERAGE</div>
                      </div>
                      <div className="bg-black/50 backdrop-blur-xs p-2 sm:p-2.5 rounded border border-white/5 space-y-0.5 text-right leading-tight">
                        <div className="text-purple-400 font-bold text-[7px] sm:text-[9px]">QUALITY METRICS</div>
                        <div className="text-[6px] sm:text-[8px] opacity-75 text-cyan-300">SECURE DISPATCH PASS</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Animated Moving GIF-like Scanline / Cyber Laser Beam */}
                  <motion.div 
                    initial={{ top: "-5%" }}
                    animate={{ top: "105%" }}
                    transition={{ 
                      duration: 4.5, 
                      ease: "easeInOut", 
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] z-20 pointer-events-none"
                  />

                  {/* Glossy Diagonal Reflection Glare Sliding Sweep */}
                  <motion.div
                    initial={{ left: "-150%" }}
                    animate={{ left: "150%" }}
                    transition={{
                      duration: 6,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 z-20 pointer-events-none"
                  />

                  {/* Cyber Pulsing Hotspot Beacons / Live Testing Nodes */}
                  <div className="absolute right-[8%] top-[25%] z-20 pointer-events-none">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]"></span>
                    </span>
                  </div>
                  <div className="absolute right-[12%] top-[55%] z-20 pointer-events-none">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                    </span>
                  </div>
                  <div className="absolute right-[6%] top-[72%] z-20 pointer-events-none">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                    </span>
                  </div>

                  {/* Slow Floating Ambient Micro-Sparks */}
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          opacity: 0, 
                          x: `${15 + i * 12}%`, 
                          y: `${20 + i * 10}%`,
                          scale: Math.random() * 0.4 + 0.5 
                        }}
                        animate={{ 
                          y: ["100%", "0%"],
                          opacity: [0, 1, 0],
                          x: [
                            `${15 + i * 12}%`, 
                            `${15 + i * 12 + (Math.random() > 0.5 ? 10 : -10)}%`
                          ]
                        }}
                        transition={{
                          duration: Math.random() * 5 + 5,
                          repeat: Infinity,
                          delay: i * 0.85,
                          ease: "easeInOut"
                        }}
                        className="absolute w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee]"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

             {/* Command Hub Container: Beautiful glassmorphic deck */}
             <div className="relative max-w-4xl mx-auto rounded-[2rem] p-6 sm:p-12 mb-10 overflow-hidden border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-md shadow-2xl space-y-6">
               {/* Outer decorative accents/watermarks */}
               <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-400/5 blur-[50px] pointer-events-none rounded-full" />
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] pointer-events-none rounded-full" />

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

               {/* Glass corner design cues */}
               <div className="absolute top-4 left-4 border-t border-l border-white/10 w-4 h-4"></div>
               <div className="absolute top-4 right-4 border-t border-r border-white/10 w-4 h-4"></div>
               <div className="absolute bottom-4 left-4 border-b border-l border-white/10 w-4 h-4"></div>
               <div className="absolute bottom-4 right-4 border-b border-r border-white/10 w-4 h-4"></div>

               {/* Real Name Headline */}
               <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight will-change-transform font-display">
                 {renderFormattedHeadline(getLocalizedField(data, 'headline', 'hero.headline'))}
               </h1>

               {/* Active Sub-role Rotating Badge with tech parentheses */}
               <div className="flex items-center justify-center gap-3">
                 <span className="text-gray-600 font-mono text-xs sm:text-sm">[</span>
                 <div className="h-10 sm:h-12 flex items-center justify-center">
                   <AnimatePresence mode="wait">
                     <motion.span
                       key={titleIndex}
                       initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                       animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                       exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                       transition={{ duration: 0.35, ease: "easeOut" }}
                       className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide select-none font-display h-auto"
                     >
                       {titles[titleIndex]}
                     </motion.span>
                   </AnimatePresence>
                 </div>
                 <span className="text-gray-600 font-mono text-xs sm:text-sm">]</span>
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
               <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-gray-400 leading-relaxed font-sans">
                 {getLocalizedField(data, 'description', 'hero.description')}
               </p>

               {/* Button grid inside HUD container */}
               <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2 max-w-3xl mx-auto w-full px-2 relative z-30">
                 <a 
                   href={data?.resumeUrl || "#"} 
                   target="_blank"
                   className="h-11 px-6 bg-brand hover:brightness-110 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 group shadow-lg shadow-brand/20 w-full sm:w-auto relative overflow-hidden"
                 >
                   {/* Subtle glass sweep glow on button */}
                   <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out z-10 pointer-events-none" />
                   <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                   <span>{t('hero.btn_resume')}</span>
                 </a>
                 
                 <AIResumeModal />
                 
                 <a 
                   href="#contact"
                   className="h-11 px-6 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto"
                 >
                   <Send className="w-4 h-4 text-cyan-400" />
                   <span>{t('hero.btn_contact')}</span>
                 </a>

                 {settings?.calendlyUrl && (
                   <a 
                     href={settings.calendlyUrl}
                     target="_blank"
                     rel="noreferrer"
                     className="h-11 px-6 bg-gradient-to-r from-brand to-brand/80 hover:brightness-110 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 group shadow-md shadow-brand/5 w-full sm:w-auto"
                   >
                     <Calendar className="w-4 h-4 text-purple-300" />
                     <span>{t('hero.btn_strategy')}</span>
                   </a>
                 )}
                 
                 <a 
                   href={data?.linkedinUrl || "https://www.linkedin.com/in/sankalpsuman"} 
                   target="_blank"
                   className="h-11 px-6 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 text-[#00a0dc] hover:text-white rounded-xl border border-[#0077b5]/20 hover:border-[#0077b5]/50 transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto group"
                 >
                   <Linkedin className="w-4 h-4 text-[#00a0dc] group-hover:text-white" />
                   <span>LinkedIn</span>
                 </a>
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
