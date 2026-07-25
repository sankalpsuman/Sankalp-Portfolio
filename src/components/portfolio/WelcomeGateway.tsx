import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { getDocument, HERO_DOC, SETTINGS_DOC } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

interface WelcomeGatewayProps {
  onEnter: () => void;
}

export const WelcomeGateway = ({ onEnter }: WelcomeGatewayProps) => {
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [heroData, globalSettings] = await Promise.all([
          getDocument(HERO_DOC),
          getDocument(SETTINGS_DOC)
        ]);
        setData(heroData);
        setSettings(globalSettings);
      } catch (error) {
        console.error('Failed to load gateway data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-[#050816] flex items-center justify-center overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full animate-pulse delay-700" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-blue-400">Syncing Reality...</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-12"
            >
              {/* Branding */}
              <div className="flex flex-col items-center gap-4">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-white/10"
                >
                  {settings?.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Cpu className="w-8 h-8 text-white" />
                  )}
                </motion.div>
                
                <div className="space-y-1">
                   <h2 className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase">
                     {settings?.role_tag || 'Lead Quality Engineer'}
                   </h2>
                </div>
              </div>

              {/* Main Greeting */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
                  WELCOME TO THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                    {data?.name?.toUpperCase() || 'SANKALP'}'S UNIVERSE
                  </span>
                </h1>
                
                <p className="text-slate-400 text-lg md:text-xl font-serif italic max-w-lg mx-auto">
                  {data?.title || 'Bridging the gap between Quality Assurance and Generative AI.'}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                   <ShieldCheck className="w-4 h-4 text-emerald-400" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Verified Professional</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                   <Globe className="w-4 h-4 text-blue-400" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Open to Collaboration</span>
                </div>
              </div>

              {/* Action */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnter}
                className="group relative px-12 py-5 rounded-full bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Enter Portfolio <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
              </motion.button>

              {/* Footer Meta */}
              <div className="pt-8">
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-600">
                  EST. 2024 • DESIGNED BY SANKALP SUMAN
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decorative Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </motion.div>
  );
};
