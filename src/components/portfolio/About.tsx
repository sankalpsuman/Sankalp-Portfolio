import { useState, useEffect, useRef } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getDocument, ABOUT_DOC } from '../../services/firestoreService';
import { Zap, Award, Cpu } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Metric {
  label: string;
  value: string;
}

interface AboutData {
  content: string;
  metrics: Metric[];
  imageUrl?: string;
  videoUrl?: string;
}

// 2026 Interactive high-tech achievement counter with viewport detection
const AnimatedCounter: React.FC<{ value: string }> = ({ value }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract digits for counting and keep chars like '+', '%' as static suffixes
  const numericStr = value.replace(/[^0-9]/g, '');
  const suffix = value.replace(/[0-9]/g, '');
  const target = parseInt(numericStr, 10);

  useEffect(() => {
    if (isNaN(target)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const duration = 1500; // Count over 1.5s

          const animate = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Quadratic easing out: f(t) = t * (2 - t)
            const easeOutQuad = progress * (2 - progress);
            setCount(Math.floor(easeOutQuad * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, hasAnimated]);

  if (isNaN(target)) {
    return <span>{value}</span>;
  }

  return (
    <span ref={elementRef} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
};

const DEFAULT_METRICS = [
  { label: 'Years Experience', value: '7+' },
  { label: 'Projects Delivered', value: '50+' },
  { label: 'Teams Led', value: '4' },
  { label: 'QA Acceleration', value: '40%' }
];

export default function About({ active = true }: { active?: boolean }) {
  const [data, setData] = useState<AboutData | null>(null);
  const { t, language } = useLanguage();

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalize coordinates (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    setCoords({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setHovering(false);
    setCoords({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const rotateX = hovering ? -coords.y * 14 : 0;
  const rotateY = hovering ? coords.x * 14 : 0;
  
  const tiltStyle = {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, 0, 0)`,
    transition: hovering ? 'none' : 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
  };

  useEffect(() => {
    async function load() {
      try {
        const about = await getDocument<AboutData>(ABOUT_DOC);
        if (about) setData(about);
      } catch (err) {
        console.warn("About data load failed, using fallbacks:", err);
      }
    }
    load();
  }, []);

  const getLocalizedField = (dbData: any, fieldName: string, localTKey: string) => {
    if (!dbData) return t(localTKey);
    if (language === 'en') return dbData[fieldName] || t(localTKey);
    const translatedVal = dbData?.translations?.[language]?.[fieldName];
    if (translatedVal && typeof translatedVal === 'string' && translatedVal.trim() !== '') {
      return translatedVal;
    }
    return t(localTKey);
  };

  const metrics = data?.metrics || DEFAULT_METRICS;

  const getMetricLabel = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('experience')) return t('about.metric_years');
    if (lower.includes('projects')) return t('about.metric_projects');
    if (lower.includes('teams')) return t('about.metric_teams');
    if (lower.includes('acceleration') || lower.includes('qae') || lower.includes('qa')) return t('about.metric_acceleration');
    return label;
  };

  return (
    <Section id="about" title={t('about.title')} subtitle={t('about.subtitle')}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Content */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {t('about.heading_bold')}{' '}
              <span className="text-brand">{t('about.heading_mid')}</span>{' '}
              {t('about.heading_and')}{' '}
              <span className="text-purple-400">{t('about.heading_end')}</span>
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {getLocalizedField(data, 'content', 'about.content')}
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-2xl hover:border-brand/35 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-lg select-none"
              >
                {/* Visual Glass Reflection Glare */}
                <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-[150%] transition-all duration-[1000ms] ease-out pointer-events-none" />

                <div className="text-3xl font-black text-white mb-1 group-hover:text-brand transition-colors font-display">
                  <AnimatedCounter value={metric.value} />
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                  {getMetricLabel(metric.label)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Visual - Cinematic Futuristic Showcase */}
        <motion.div
           initial={{ opacity: 0, scale: 0.96 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="relative"
        >
          {/* Concentric AI-inspired holographic glows behind the portrait */}
          <div className="absolute -inset-8 bg-gradient-to-tr from-brand/12 via-[#22d3ee]/8 to-[#a855f7]/8 blur-[60px] rounded-full pointer-events-none opacity-60 z-0 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/5 to-purple-500/5 blur-[40px] rounded-full pointer-events-none opacity-40 z-0" />
          
          {/* Spotlight laser ray from top left corner */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-gradient-to-br from-[#22d3ee]/15 to-transparent blur-2xl pointer-events-none rounded-tr-none rotate-12 z-10" />

          {/* Interactive 3D Card Container */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={tiltStyle}
            className="relative rounded-[2.5rem] overflow-hidden border border-white/10 group bg-[#040612]/70 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.12)] hover:shadow-[0_0_65px_rgba(34,211,238,0.22)] transition-shadow duration-500 p-2 cursor-crosshair select-none z-10 transform-gpu animate-[fadeIn_0.5s_ease-out]"
          >
            {/* Inner dynamic borders / corner targets */}
            <div className="absolute top-6 left-6 border-t-2 border-l-2 border-cyan-400/50 w-5 h-5 rounded-tl-sm transition-all group-hover:scale-110 z-20"></div>
            <div className="absolute top-6 right-6 border-t-2 border-r-2 border-cyan-400/50 w-5 h-5 rounded-tr-sm transition-all group-hover:scale-110 z-20"></div>
            <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-cyan-400/50 w-5 h-5 rounded-bl-sm transition-all group-hover:scale-110 z-20"></div>
            <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-cyan-400/50 w-5 h-5 rounded-br-sm transition-all group-hover:scale-110 z-20"></div>

            {/* Glowing Tech Ring Behind Image */}
            <div className="absolute inset-4 rounded-[2rem] border border-dashed border-[#22d3ee]/15 pointer-events-none animate-[spin_60s_linear_infinite] z-20" />
            <div className="absolute inset-8 rounded-[1.8rem] border border-cyan-400/10 pointer-events-none animate-[spin_35s_linear_infinite_reverse] z-20" style={{ animationDelay: '-5s' }} />

            {/* Inner Glass Frame Border */}
            <div className="absolute inset-1.5 rounded-[2.35rem] border border-white/5 pointer-events-none z-20" />

            {/* Main Picture Wrapper */}
            <div className="relative rounded-[2.2rem] overflow-hidden bg-[#020309] border border-white/5 h-[520px] sm:h-[560px]">
              
              {/* Rotating Digital Scanning Lens overlay over picture */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#22d3ee]/10 border-double animate-spin pointer-events-none z-20" style={{ animationDuration: '45s' }} />

              {/* Parallax Shift layer for actual picture / video */}
              <motion.div 
                className="w-full h-full"
                animate={{
                  x: hovering ? -coords.x * 12 : 0,
                  y: hovering ? -coords.y * 12 : 0,
                  scale: hovering ? 1.025 : 1
                }}
                transition={{ type: "spring", damping: 25, stiffness: 220, mass: 0.5 }}
              >
                {data?.videoUrl && active ? (
                  <video 
                    src={data.videoUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover grayscale transition-all duration-700 brightness-[0.88] contrast-[1.05]"
                  />
                ) : (
                  <img 
                    src={data?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"} 
                    alt="Sankalp Suman" 
                    className="w-full h-full object-cover grayscale transition-all duration-700 brightness-[0.85] contrast-[1.05]"
                  />
                )}
              </motion.div>

              {/* Dynamic Overlay Gradient to anchor colors */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#040612] via-[#040612]/35 to-transparent opacity-80 pointer-events-none z-15" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-cyan-500/10 pointer-events-none z-15 mix-blend-screen" />

              {/* Running LED Laser Beam Scanline */}
              <motion.div 
                animate={{ top: ["-5%", "105%"] }}
                transition={{ 
                  duration: 5, 
                  ease: "easeInOut", 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                style={{ willChange: "top" }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#22d3ee]/60 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.7)] z-20 pointer-events-none"
              />

              {/* Luxury Sweep Glare Reflect effect */}
              <motion.div
                animate={{ left: ["-150%", "150%"] }}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                style={{ willChange: "left" }}
                className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 z-20 pointer-events-none"
              />

              {/* Micro Beacons on Critical Tech Clusters - elegant flashing points */}
              <div className="absolute left-[8%] top-[25%] z-20 pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22d3ee]"></span>
                </span>
                <span className="absolute left-3.5 top-[-4px] font-mono text-[6px] tracking-widest text-[#22d3ee]/80 opacity-70">QA_LEAD: ACTIVE</span>
              </div>
              <div className="absolute right-[8%] top-[45%] z-20 pointer-events-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
                </span>
                <span className="absolute right-3.5 top-[-4px] font-mono text-[6px] tracking-widest text-purple-400/80 opacity-70">AGILE: NOMINAL</span>
              </div>

              {/* Interactive cursor spotlight tracker flare */}
              {hovering && (
                <div 
                  style={{
                    left: `${(coords.x + 0.5) * 100}%`,
                    top: `${(coords.y + 0.5) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    willChange: 'left, top'
                  }}
                  className="absolute bg-gradient-to-tr from-cyan-400/12 to-brand/8 w-64 h-64 rounded-full blur-[45px] z-20 pointer-events-none mix-blend-screen"
                />
              )}

              {/* Micro sparks/data floating points in the picture overlay */}
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      x: `${20 + i * 15}%`, 
                      y: `${40 + i * 8}%` 
                    }}
                    animate={{ 
                      y: ["100%", "0%"],
                      opacity: [0, 0.4, 0],
                      x: [
                        `${20 + i * 15}%`, 
                        `${20 + i * 15 + (i % 2 === 0 ? 8 : -8)}%`
                      ]
                    }}
                    transition={{
                      duration: 6 + i,
                      repeat: Infinity,
                      delay: i * 0.9,
                      ease: "easeInOut"
                    }}
                    className="absolute w-1 h-1 rounded-full bg-[#22d3ee]/60"
                  />
                ))}
              </div>

              {/* Embedded Tech HUD Watermark Stats inside Card */}
              <div className="absolute bottom-6 left-6 right-6 z-25 flex justify-between items-end font-mono">
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 text-left leading-none space-y-0.5">
                  <span className="text-gray-500 text-[6.5px] font-bold block tracking-widest uppercase">AUTOMATION ENGINE</span>
                  <span className="text-[#22d3ee] text-[9px] font-extrabold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    SECURE DEPLOY
                  </span>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/5 text-right leading-none space-y-0.5">
                  <span className="text-gray-500 text-[6.5px] font-bold block tracking-widest uppercase">STURDINESS INDEX</span>
                  <span className="text-purple-400 text-[9px] font-extrabold block">99.8% COVERAGE</span>
                </div>
              </div>

            </div>
          </div>

          {/* Floating Luxury Badges / Cards with 3D Parallax offset */}
          <motion.div 
            style={{
              x: hovering ? coords.x * 25 : 0,
              y: hovering ? coords.y * 25 : 0,
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ 
              y: { repeat: Infinity, duration: 4.2, ease: "easeInOut" },
              x: { type: "spring", damping: 20, stiffness: 200 }
            }}
            className="absolute -top-4 -right-2 sm:-right-4 p-4 bg-gradient-to-br from-brand via-blue-950/95 to-[#0b102b] rounded-2xl shadow-[0_15px_35px_rgba(59,130,246,0.25)] flex items-center gap-3 border border-white/10 backdrop-blur-md z-30"
          >
             <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
             </div>
             <div>
                <div className="text-[9px] text-white/50 font-mono tracking-widest uppercase">{t('about.role_label')}</div>
                <div className="text-xs font-bold text-white tracking-tight">{t('about.role')}</div>
             </div>
          </motion.div>

          <motion.div 
            style={{
              x: hovering ? coords.x * -25 : 0,
              y: hovering ? coords.y * -25 : 0,
            }}
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              y: { repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 1.2 },
              x: { type: "spring", damping: 20, stiffness: 200 }
            }}
            className="absolute -bottom-4 -left-2 sm:-left-4 p-4 bg-[#050816]/95 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 border border-cyan-500/20 backdrop-blur-md z-30"
          >
             <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shadow-inner">
                <Award className="w-5 h-5 text-cyan-400" />
             </div>
             <div>
                <div className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">{t('about.efficiency_label')}</div>
                <div className="text-xs font-bold text-white tracking-tight">{t('about.reliability')}</div>
             </div>
          </motion.div>

        </motion.div>
      </div>
    </Section>
  );
}
