import { useState, useEffect, useRef } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getDocument } from '../../services/firestoreService';
import { HelpCircle, ThumbsUp, Sparkles, Trophy, CalendarRange } from 'lucide-react';
import { AutoTranslate } from './TranslationComponents';

interface Statistic {
  label: string;
  value: string;
}

interface WhyHireMeData {
  headline: string;
  description: string;
  statistics: Statistic[];
  highlights: string[];
  ctaText?: string;
  ctaUrl?: string;
}

// Interactive achievement counter for WhyHireMe metrics
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
          const duration = 1500;

          const animate = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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
    <span ref={elementRef}>
      {count}
      {suffix}
    </span>
  );
};

export default function WhyHireMe() {
  const [data, setData] = useState<WhyHireMeData>({
    headline: '7+ Years Driving Pristine Software Quality and AI Test Architecture',
    description: 'Highly experienced Test Architect specializing in Selenium, Playwright, performance JMeter rigs, and deploying localized Gemini AI test automation agents. A scrum advocate focusing on team efficiency and elite test stability.',
    statistics: [
      { label: 'Years Experience', value: '7+' },
      { label: 'AI Test Automations', value: '100%' },
      { label: 'Sprint Cycles Saved', value: '35%' }
    ],
    highlights: [
      'Scrum Master & Team Facilitation leadership',
      'Advanced automation framework scaling (Cypress & Playwright)',
      'Intelligent exploratory QA with integrated Gemini agents',
      'Enterprise Fintech & Telecom QA governance'
    ],
    ctaText: 'Let\'s Sync Up',
    ctaUrl: '#contact'
  });

  useEffect(() => {
    async function load() {
      try {
        const val = await getDocument<WhyHireMeData>('settings/whyHireMe');
        if (val) {
          setData({
            ...val,
            statistics: val.statistics || [],
            highlights: val.highlights || []
          });
        }
      } catch (e) {
        console.warn('WhyHireMe document failed to load, utilizing default fallbacks.');
      }
    }
    load();
  }, []);

  return (
    <Section id="why-hire-me" title="Why Hire Me" subtitle="Elite test architecture & quality metrics driven mindset">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Text and highlights pitch */}
        <div className="lg:col-span-7 space-y-6">
          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-extrabold text-white leading-tight"
          >
            <AutoTranslate text={data.headline} />
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-400 text-base lg:text-lg leading-relaxed"
          >
            <AutoTranslate text={data.description} />
          </motion.p>

          <div className="space-y-3 pt-2">
            {data.highlights.map((highlight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl hover:border-brand/20 transition-all"
              >
                <span className="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="text-sm font-medium text-gray-200">
                  <AutoTranslate text={highlight} />
                </span>
              </motion.div>
            ))}
          </div>

          {data.ctaText && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <a
                href={data.ctaUrl || '#contact'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-xl text-sm hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-brand/25"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <AutoTranslate text={data.ctaText} />
              </a>
            </motion.div>
          )}
        </div>

        {/* Right Side: Key statistics grid & decorative frame */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          {data.statistics.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-2xl hover:border-brand/35 hover:bg-white/[0.03] transition-all text-center md:text-left flex flex-col justify-center relative overflow-hidden group shadow-lg select-none"
            >
              {/* Visual Glass Reflection Glare */}
              <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-[150%] transition-all duration-[1000ms] ease-out pointer-events-none" />

              <div className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand to-purple-400 mb-1 font-display">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-xs uppercase tracking-widest font-mono text-gray-400">
                <AutoTranslate text={stat.label} />
              </div>
            </motion.div>
          ))}
          {data.statistics.length === 0 && (
            <div className="text-center p-8 border border-white/5 rounded-2xl text-gray-500">
              <AutoTranslate text="Set up Why Hire Me stats in CMS dashboard." />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
