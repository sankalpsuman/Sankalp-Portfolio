import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  variant?: 'footer' | 'chat' | 'compact' | 'badge';
  className?: string;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ variant = 'footer', className = '' }) => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let startTime = sessionStorage.getItem('portfolio_session_start');
    if (!startTime) {
      startTime = Date.now().toString();
      sessionStorage.setItem('portfolio_session_start', startTime);
    }

    const startMs = parseInt(startTime, 10) || Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setSeconds(elapsed > 0 ? elapsed : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}h ${pad(mins)}m ${pad(secs)}s`;
    }
    return `${pad(mins)}m ${pad(secs)}s`;
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 text-[10px] font-mono tracking-wider shadow-sm backdrop-blur-md select-none ${className}`}>
        <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
        <span className="text-slate-400 text-[9px] font-sans uppercase">Exploring:</span>
        <span className="font-bold text-white">{formatTime(seconds)}</span>
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-slate-400 text-[10px] select-none ${className}`}>
        <Clock className="w-2.5 h-2.5 text-blue-400" />
        <span>Session: {formatTime(seconds)}</span>
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono select-none ${className}`}>
        <Clock className="w-3 h-3 text-blue-400" />
        <span>{formatTime(seconds)}</span>
      </div>
    );
  }

  // default footer variant
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-medium tracking-wider select-none ${className}`}>
      <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
      <span className="text-slate-400 font-sans text-[9px] uppercase tracking-widest">Session Time:</span>
      <span className="font-bold text-blue-200">{formatTime(seconds)}</span>
    </div>
  );
};

export default SessionTimer;
