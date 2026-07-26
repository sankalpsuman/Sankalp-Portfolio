import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { WifiOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineBanner: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-slate-950 px-4 py-2 text-center shadow-lg backdrop-blur-md border-b border-amber-400/40 flex items-center justify-center gap-2 font-medium text-xs sm:text-sm font-sans"
      >
        <WifiOff className="w-4 h-4 text-slate-950 animate-pulse flex-shrink-0" />
        <span className="font-bold">Offline Mode:</span>
        <span className="opacity-90">Showing cached portfolio content.</span>
        <span className="hidden md:inline-block opacity-75">• AI Assistant requires an internet connection.</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineBanner;
