import { useState, useEffect, useRef } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getDocument, ABOUT_DOC } from '../../services/firestoreService';
import { Zap, Award } from 'lucide-react';
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

        {/* Right: Visual */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative"
        >
          <div className="rounded-3xl overflow-hidden border border-white/10 group bg-[#02040a] shadow-2xl h-full">
            {data?.videoUrl && active ? (
              <video 
                src={data.videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                 className="w-full h-auto min-h-[500px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
            ) : (
              <img 
                 src={data?.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"} 
                 alt="Sankalp Suman" 
                 className="w-full h-auto min-h-[500px] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
            )}
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-60 pointer-events-none"></div>
          </div>

          {/* Floating Cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 p-4 bg-brand rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
             <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
             </div>
             <div>
                <div className="text-xs text-white/70 font-mono uppercase">{t('about.role_label')}</div>
                <div className="text-sm font-bold text-white">{t('about.role')}</div>
             </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-6 -left-6 p-4 bg-[#0B1120] rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
             <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-400" />
             </div>
             <div>
                <div className="text-xs text-gray-500 font-mono uppercase">{t('about.efficiency_label')}</div>
                <div className="text-sm font-bold text-white">{t('about.reliability')}</div>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
