import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal } from 'lucide-react';

export const WelcomePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    // Close on any click anywhere in the window
    const handleGlobalClick = () => {
      setIsVisible(false);
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050816]/80 backdrop-blur-md pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-[#0a0e23] border border-brand/20 rounded-[2.5rem] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(var(--brand-primary-rgb),0.15)] pointer-events-auto"
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-3xl flex items-center justify-center shadow-xl shadow-brand/10 mb-2">
                <Sparkles className="w-10 h-10 text-brand animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-brand uppercase tracking-[0.2em]">
                  <Terminal className="w-3 h-3" />
                  System Initialized
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">
                  Welcome to my <span className="text-brand">Portfolio</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                  Exploring the synergy between Quality Engineering & AI Innovation. 
                  Experience a journey of technical excellence.
                </p>
              </div>

              {/* Progress bar for auto-close */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-brand shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
                />
              </div>

              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pt-2">
                Click anywhere to proceed →
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
