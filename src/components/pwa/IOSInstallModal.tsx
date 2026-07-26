import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { Share, PlusSquare, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IOSInstallModal: React.FC = () => {
  const { showIOSModal, dismissIOSModal } = usePWA();

  if (!showIOSModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md">
        {/* Backdrop click dismiss */}
        <div className="absolute inset-0" onClick={dismissIOSModal} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-[#0b0f19] border border-white/15 p-6 sm:p-8 rounded-3xl shadow-2xl text-white z-10 space-y-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                  Install Portfolio <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/40" />
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Safari on iOS / iPadOS</p>
              </div>
            </div>
            <button
              onClick={dismissIOSModal}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Install <strong className="text-blue-400">Sankalp Suman Portfolio</strong> on your iPhone or iPad home screen for a full native app experience with offline capabilities:
          </p>

          {/* Steps */}
          <div className="space-y-3 font-sans">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-xs font-bold font-mono text-blue-300">
                1
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  Tap Share <Share className="w-4 h-4 text-blue-400 inline-block" />
                </p>
                <p className="text-[11px] text-slate-400">
                  Tap the Share button in Safari’s bottom toolbar bar.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-xs font-bold font-mono text-emerald-300">
                2
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  Add to Home Screen <PlusSquare className="w-4 h-4 text-emerald-400 inline-block" />
                </p>
                <p className="text-[11px] text-slate-400">
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-xs font-bold font-mono text-purple-300">
                3
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-white flex items-center gap-1.5">
                  Confirm "Add" <Check className="w-4 h-4 text-purple-400 inline-block" />
                </p>
                <p className="text-[11px] text-slate-400">
                  Tap <strong>"Add"</strong> in the top right corner to launch like a native app!
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={dismissIOSModal}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Got It!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IOSInstallModal;
