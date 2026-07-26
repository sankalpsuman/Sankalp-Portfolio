import React, { useState, useEffect } from 'react';
import { usePWA } from '../../context/PWAContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const PWASplashScreen: React.FC = () => {
  const { isInstalled } = usePWA();
  const [showSplash, setShowSplash] = useState<boolean>(false);

  useEffect(() => {
    // Show splash screen only when running in standalone PWA mode or on first launch
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const hasSeenSplash = sessionStorage.getItem('pwa_splash_seen');

    if (isStandalone && !hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('pwa_splash_seen', 'true');

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-50 bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-cyan-500/30 overflow-hidden"
      >
        {/* Glow ambient background elements */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center space-y-6 max-w-sm relative z-10"
        >
          {/* Logo container */}
          <div className="relative">
            <div className="absolute -inset-4 border border-dashed border-blue-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-400/30 p-2 shadow-2xl flex items-center justify-center backdrop-blur-md">
              <img src="/pwa-icon.svg" alt="Sankalp Suman Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-sans flex items-center justify-center gap-2">
              Sankalp Suman <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
            </h1>
            <p className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
              Senior QA Automation & AI Lead
            </p>
          </div>

          {/* Loading bar */}
          <div className="w-48 space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-600 to-purple-500"
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
              Launching App...
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWASplashScreen;
