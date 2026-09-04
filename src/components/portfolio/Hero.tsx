import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowDown, Sparkles, Globe, ShieldCheck, Linkedin, Github, Calendar } from 'lucide-react';
import { BackgroundEffects } from './BackgroundEffects';
import { AIResumeModal } from './AIResumeModal';
import { getDocument } from '../../services/firestoreService';

export default function Hero({ data }: { data?: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      const s = await getDocument('settings/global');
      if (s) setSettings(s);
    }
    loadSettings();
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-20">
      <BackgroundEffects />
      
      {/* Cinematic Centerpiece Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] rounded-full bg-blue-500/5 blur-[80px] md:blur-[150px] transform-gpu translate-z-0 will-change-transform" 
        />
      </div>

      <div className="container relative z-10 px-6 mx-auto text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-star-gold animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">Agentic Quality Engineering</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-tight px-4"
          >
            {data?.name || 'Sankalp Suman'}
            <span className="sr-only"> – Software Test Specialist | QA Lead & AI Testing Expert</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-2xl font-serif italic text-slate-400 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-6"
          >
            {data?.title || 'Bridging the gap between Quality Assurance and Generative AI.'}
          </motion.p>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-6 md:gap-8 px-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <a 
                href="#projects"
                className="w-full sm:w-auto group relative px-8 py-4 rounded-full bg-white text-space-950 font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  View My Universe <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <a 
                href="#contact"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md text-white font-semibold transition-all hover:bg-white/[0.1] hover:border-white/20 active:scale-95 text-center"
              >
                Initiate Contact
              </a>
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              <div className="h-10 w-px bg-white/10 mx-2 hidden md:block" />
              
              {/* Feature Icons Group */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="scale-90 sm:scale-100"><AIResumeModal /></div>
                
                {settings?.linkedinUrl && (
                  <a 
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center group"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                
                {settings?.githubUrl && (
                  <a 
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center group"
                    title="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}

                {settings?.calendlyUrl && (
                  <a 
                    href={settings.calendlyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 sm:w-11 sm:h-11 bg-white/[0.03] hover:bg-purple-600 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all flex items-center justify-center group"
                    title="Book Meeting"
                  >
                    <Calendar className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Key Metrics / Roles */}
          <motion.div 
            variants={itemVariants}
            className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12"
          >
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Global Expertise</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Quality Author</span>
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">AI Innovation</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-4 h-4 text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  );
};
