import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getDocument, ABOUT_DOC } from '../../services/firestoreService';
import { Zap, Award } from 'lucide-react';

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

const DEFAULT_METRICS = [
  { label: 'Years Experience', value: '7+' },
  { label: 'Projects Delivered', value: '50+' },
  { label: 'Teams Led', value: '4' },
  { label: 'QA Acceleration', value: '40%' }
];

export default function About() {
  const [data, setData] = useState<AboutData | null>(null);

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

  const metrics = data?.metrics || DEFAULT_METRICS;

  return (
    <Section id="about" title="Engineering Excellence" subtitle="About Me">
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
              Bridging the gap between <span className="text-brand">Software Engineering</span> and <span className="text-purple-400">AI Intelligence.</span>
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {data?.content || `Results-driven QA Lead with 7+ years of experience in end-to-end testing across web, mobile, desktop, and API systems.

Currently working as Software Test Specialist and Scrum Master at Amdocs, leading QA delivery for enterprise-scale telecom platforms.

Specialized in AI-powered testing, prompt engineering, API validation, ETL testing, automation acceleration, and Agile delivery methodologies.`}
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
                className="p-6 bg-white/2 border border-white/5 rounded-2xl hover:border-brand/20 transition-all group"
              >
                <div className="text-3xl font-bold text-white mb-1 group-hover:text-brand transition-colors">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-mono">
                  {metric.label}
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
            {data?.videoUrl ? (
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
                <div className="text-xs text-white/70 font-mono uppercase">Role</div>
                <div className="text-sm font-bold text-white">QA Lead</div>
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
                <div className="text-xs text-gray-500 font-mono uppercase">Efficiency</div>
                <div className="text-sm font-bold text-white">99.9% Reliable</div>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}
