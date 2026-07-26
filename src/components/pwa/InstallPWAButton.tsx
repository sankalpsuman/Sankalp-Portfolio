import React, { useState } from 'react';
import { usePWA } from '../../context/PWAContext';
import { Smartphone, Check, Download, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface InstallPWAButtonProps {
  variant?: 'navbar' | 'mobile-menu' | 'floating' | 'banner';
  className?: string;
}

export const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({ variant = 'navbar', className }) => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    setClicked(true);
    await promptInstall();
    setTimeout(() => setClicked(false), 1000);
  };

  if (isInstalled) {
    if (variant === 'mobile-menu') {
      return (
        <div className={cn("flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider", className)}>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Installed</span>
        </div>
      );
    }
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider select-none", className)}>
        <Check className="w-3.5 h-3.5" />
        <span>Installed</span>
      </div>
    );
  }

  // If not explicitly installable yet, we still allow clicking (which opens iOS instructions or prompt)
  if (variant === 'mobile-menu') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 border border-white/10 transition-all cursor-pointer relative overflow-hidden group",
          className
        )}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Smartphone className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />
        <span className="flex items-center gap-1">
          Install App <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300/30" />
        </span>
      </motion.button>
    );
  }

  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          "fixed bottom-20 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-[#0d1527]/90 hover:bg-blue-600 text-white rounded-full border border-blue-500/30 shadow-2xl backdrop-blur-md text-xs font-bold uppercase tracking-wider transition-all cursor-pointer group",
          className
        )}
      >
        <Download className="w-4 h-4 text-cyan-400 group-hover:text-white" />
        <span>📲 Install App</span>
      </motion.button>
    );
  }

  // Default navbar variant
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md shadow-blue-600/25 border border-white/20 transition-all cursor-pointer relative overflow-hidden group whitespace-nowrap shrink-0",
        className
      )}
      title="Install Portfolio App on Your Device"
    >
      <span className="absolute inset-0 bg-white/15 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
      <Smartphone className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform shrink-0" />
      <span className="relative z-10 flex items-center gap-1 whitespace-nowrap">
        <span>Install App</span>
        <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300/40 hidden sm:inline-block shrink-0" />
      </span>
    </motion.button>
  );
};

export default InstallPWAButton;
