import { useState, useEffect, useRef } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getDocument, ABOUT_DOC } from '../../services/firestoreService';
import { Zap, Award, Cpu, Sparkles, Target, Rocket } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { AICommandCenterPortrait } from './AICommandCenterPortrait';
import { cn } from '../../lib/utils';

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

const AnimatedCounter: React.FC<{ value: string }> = ({ value }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

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
          const duration = 2000;

          const animate = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeOutExpo * target));

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

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  if (isNaN(target)) return <span>{value}</span>;

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

  const getMetricIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('experience')) return Rocket;
    if (lower.includes('projects')) return Target;
    if (lower.includes('teams')) return Award;
    if (lower.includes('acceleration')) return Zap;
    return Sparkles;
  };

  return (
    <Section 
      id="about" 
      title={t('about.title')} 
      subtitle={t('about.subtitle')}
      className="relative overflow-hidden"
    >
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 sm:w-[500px] sm:h-[500px] bg-blue-600/5 blur-[60px] sm:blur-[120px] rounded-full pointer-events-none transform-gpu translate-z-0 will-change-transform" />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-[400px] sm:h-[400px] bg-purple-600/5 blur-[50px] sm:blur-[100px] rounded-full pointer-events-none transform-gpu translate-z-0 will-change-transform" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left: Interactive Visual */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="lg:col-span-5 relative"
        >
          <div className="relative z-10">
            <AICommandCenterPortrait 
              active={active} 
              imageUrl={data?.imageUrl} 
              videoUrl={data?.videoUrl} 
            />
          </div>
          {/* Subtle reflection below */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-blue-500/10 to-transparent blur-2xl opacity-50" />
        </motion.div>

        {/* Right: Content & Metrics */}
        <div className="lg:col-span-7 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {t('about.heading_bold')}{' '}
              <span className="text-blue-500 font-serif italic font-normal">{t('about.heading_mid')}</span>{' '}
              {t('about.heading_and')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{t('about.heading_end')}</span>
            </h3>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-light">
              {getLocalizedField(data, 'content', 'about.content')}
            </p>
          </motion.div>

          {/* Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((metric, idx) => {
              const Icon = getMetricIcon(metric.label);
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative glass-card p-6 rounded-3xl overflow-hidden"
                >
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">
                        <AnimatedCounter value={metric.value} />
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {metric.label}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-400/10 group-hover:border-blue-400/20 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  {/* Background decoration */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all" />
                </motion.div>
              );
            })}
          </div>

          {/* Call to action or signature */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 pt-4 border-t border-white/5"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-space-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                  {i === 3 ? '50+' : <Sparkles className="w-4 h-4 text-blue-400" />}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Trusted by enterprise teams worldwide <br/> for high-integrity QA delivery.
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
