import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal } from 'lucide-react';

export const WelcomePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

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
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050816]/85 backdrop-blur-md pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-[#0a0e23] border border-brand/35 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_50px_rgba(var(--brand-primary-rgb),0.2)] pointer-events-auto"
          >
            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-5">
              <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center shadow-lg shadow-brand/10">
                <Sparkles className="w-7 h-7 text-brand animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-brand uppercase tracking-[0.2em]">
                  <Terminal className="w-3 h-3" />
                  System Initialized
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome to my <span className="text-brand">Portfolio</span>
                </h2>
                <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                  Exploring the synergy between Quality Engineering & AI Innovation. 
                  Experience a journey of technical excellence.
                </p>
              </div>

              {/* Chatbot feature announcement */}
              <div 
                onClick={(e) => e.stopPropagation()} // Stop propagation so clicking content doesn't dismiss the modal
                className="w-full bg-[#0d1433]/70 border border-brand/20 rounded-2xl p-4 text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand/10 blur-md rounded-full pointer-events-none"></div>
                <h3 className="text-white text-xs font-bold flex items-center gap-1.5 mb-1.5 font-display">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                  </span>
                  Talk with Sankalp's AI Representative
                </h3>
                <p className="text-gray-300 text-[11px] leading-relaxed mb-3">
                  Want to learn more about my 7+ years of QA experience, Scrum Master credentials, or relocation preparedness for roles globally? Ask my active AI chatbot assistant at any time!
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid closing popup from global click handler before event completes
                    setIsVisible(false);
                    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
                  }}
                  id="welcome-launch-chatbot-btn"
                  className="w-full py-2 bg-brand hover:bg-brand/90 text-white font-semibold text-xs rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand/25 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Open AI Chatbot Now
                </button>
              </div>

              {/* Progress bar for auto-close */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-brand shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
                />
              </div>

              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pt-1">
                Click anywhere else to dismiss →
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
