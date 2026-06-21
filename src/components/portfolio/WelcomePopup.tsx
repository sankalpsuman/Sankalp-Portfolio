import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Volume2, VolumeX, Cpu, Play, LogIn, Command } from 'lucide-react';

const playSynthSound = (type: 'startup' | 'click' | 'hover' | 'dismiss') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'startup') {
      // 1. Futuristic Power Surge Low Sweep
      const sweepOsc = ctx.createOscillator();
      const sweepOsc2 = ctx.createOscillator();
      const sweepFilter = ctx.createBiquadFilter();
      const sweepGain = ctx.createGain();

      sweepOsc.type = 'sawtooth';
      sweepOsc2.type = 'triangle';

      sweepOsc.frequency.setValueAtTime(80, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

      sweepOsc2.frequency.setValueAtTime(160, now);
      sweepOsc2.frequency.exponentialRampToValueAtTime(880, now + 1.2);

      sweepFilter.type = 'lowpass';
      sweepFilter.frequency.setValueAtTime(120, now);
      sweepFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.9);
      sweepFilter.Q.value = 7;

      sweepGain.gain.setValueAtTime(0, now);
      sweepGain.gain.linearRampToValueAtTime(0.22, now + 0.15);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      sweepOsc.connect(sweepFilter);
      sweepOsc2.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(ctx.destination);

      sweepOsc.start(now);
      sweepOsc2.start(now);
      sweepOsc.stop(now + 1.5);
      sweepOsc2.stop(now + 1.5);

      // 2. High-Tech Arpeggiator Chord Cascade (Major 7th & 9th accents)
      const chord = [261.63, 311.13, 392.00, 466.16, 523.25, 622.25, 783.99, 932.33]; // Cm9/Cm11 feel
      chord.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        const chimeFilter = ctx.createBiquadFilter();

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, now);

        const startTime = now + 0.3 + (idx * 0.1);
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.setValueAtTime(0, startTime);
        chimeGain.gain.linearRampToValueAtTime(0.09, startTime + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        chimeFilter.type = 'highpass';
        chimeFilter.frequency.setValueAtTime(300, now);

        chimeOsc.connect(chimeFilter);
        chimeFilter.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chimeOsc.start(now);
        chimeOsc.stop(startTime + 0.82);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.setValueAtTime(2100, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'dismiss') {
      // Gentle cyber release sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.log('[Audio Synth Engine] Skipped or blocked:', err);
  }
};

export const WelcomePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const testLogs = [
    'CONNECTING TO LOCALPORT: 3000...',
    'LOADED CORE QA AGENTS [PASS]',
    'SELENIUM WEBDRIVERS: DISPATCHED',
    'SCRUM MASTER RETROSPECTIVES METRIC: NOMINAL',
    'SYNCHRONIZING AI WORKPLACE AGENTS...',
    'READY FOR FULL STACK SIMULATION!'
  ];

  // Typer logs effect cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % testLogs.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Preload synthesis voices on mount for prompt readiness
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const speakWelcomeMessage = () => {
    try {
      if (!('speechSynthesis' in window)) return;
      
      // Stop any other active spoken elements immediately
      window.speechSynthesis.cancel();
      
      const text = "Hello, I’m Sankalp Suman. QA Specialist, Scrum Master, AI Enthusiast. Welcome to my portfolio.";
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      
      // Look specifically for Indian English male voices first (iOS: Rishi, Windows: Ravi, Chrome: Google English (India))
      const searchLang = 'en-in';
      const maleIndianVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        const isIndian = lang.includes(searchLang) || lang.includes('en_in');
        const isMaleKeyword = name.includes('male') || name.includes('rishi') || name.includes('ravi') || name.includes('google') || name.includes('microsoft');
        return isIndian && isMaleKeyword;
      }) || voices.find(v => {
        const lang = v.lang.toLowerCase();
        return lang.includes(searchLang) || lang.includes('en_in');
      });

      // Secondary fallback to standard Western professional male voice if no Indian English is available
      const fallbackMaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        return lang.startsWith('en') && (
          name.includes('male') || 
          name.includes('david') || 
          name.includes('daniel') || 
          name.includes('guy') || 
          name.includes('kirk') || 
          name.includes('premium') || 
          name.includes('natural')
        );
      });

      const selectedVoice = maleIndianVoice || fallbackMaleVoice || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Fine-tune pitch and rate for an authentic, premium male Indian English greeting tone
      utterance.pitch = 0.95; // Grounded masculine tone
      utterance.rate = 0.90;  // Empathetic and professional cadence
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[Welcome Voice Grid Error]:', err);
    }
  };

  // Matrix binary digital rain waterfall behind the modal popup (acting like a live cool GIF!)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    canvas.width = 450;
    canvas.height = 180;

    const columns = Math.floor(canvas.width / 12);
    const drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -30));
    const chars = "10<>?/\\+-[]*#@$!%&";

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 14, 35, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.font = '9px var(--font-mono)';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 12;
        const y = drops[i] * 12;

        if (y > 0) {
          ctx.fillText(text, x, y);
        }

        if (y > canvas.height && Math.random() > 0.96) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isVisible]);

  const handleLaunch = () => {
    try {
      speakWelcomeMessage();
    } catch (e) {}
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050816]/92 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="w-full max-w-lg bg-[#0a0e23] border border-brand/35 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.3)]"
          >
            {/* Absolute Rotating cyber grid target loops (GIF replacement design) */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-brand/10 rounded-full border-2 border-dashed border-brand/20 animate-spin" style={{ animationDuration: '30s' }}></div>
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-purple-500/5 rounded-full border border-dashed border-purple-500/20 animate-reverse-spin" style={{ animationDuration: '18s' }}></div>

            {/* Matrix Digital Background Canvas (representing live visual loading feeds) */}
            <div className="absolute top-[110px] left-0 right-0 h-[100px] opacity-[0.22] pointer-events-none overflow-hidden select-none">
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0e23] to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              
              {/* Premium Floating Core Processor */}
              <div className="relative">
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 15, ease: "linear" },
                    scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
                  }}
                  className="w-16 h-16 bg-gradient-to-tr from-brand/20 via-purple-500/20 to-cyan-500/20 border-2 border-brand/40 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-brand/15"
                >
                  <Cpu className="w-8 h-8 text-cyan-400" />
                </motion.div>
                <div className="absolute -inset-1 bg-brand/10 rounded-[1.25rem] blur-md animate-pulse"></div>
              </div>

              {/* Status Headers */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] shadow-inner">
                  <Terminal className="w-3.5 h-3.5 animate-pulse text-brand" />
                  INIT_SYSTEM: SUCCESSFUL
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none font-display">
                  SANKALP <span className="text-brand bg-gradient-to-r from-cyan-400 via-brand to-purple-400 text-transparent bg-clip-text">SUMAN</span>
                </h2>
                
                <p className="text-gray-400 text-xs tracking-wider max-w-sm mx-auto font-mono uppercase text-cyan-300/80">
                  R&D Software Test Specialist & Scrum Master
                </p>
              </div>

              {/* Living Console Logs Typewriter Terminal (Acting like a high tech live computer monitor loop) */}
              <div className="w-full bg-black/50 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-left min-h-[76px] relative overflow-hidden flex flex-col justify-center shadow-inner">
                <div className="absolute top-2 right-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500/70 animate-ping"></span>
                  <span className="text-[8px] text-green-500 uppercase font-bold tracking-widest">Live Engine</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-gray-500 text-[10px]">&gt; system_audit_agent logs:</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeLogIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="text-cyan-400 font-semibold flex items-center gap-1.5"
                    >
                      <span className="text-purple-400">⚡</span>
                      {testLogs[activeLogIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* AI Representative Invitation Panel */}
              <div className="w-full bg-[#0d1433]/50 border border-brand/20 rounded-2xl p-4 text-left relative overflow-hidden backdrop-blur-xs">
                <h3 className="text-white text-xs font-bold flex items-center gap-1.5 mb-1 font-display">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 text-brand" />
                  Interactive Representative Mode Active
                </h3>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  Connect live with an automated virtual presentation representing my QA testing competencies, test suites, and project metrics.
                </p>
              </div>

              {/* Premium Entrance Gateway */}
              <div className="w-full pt-1">
                <button
                  onMouseEnter={() => {
                    try { playSynthSound('hover'); } catch(e){}
                  }}
                  onClick={() => handleLaunch()}
                  className="group relative w-full py-4 bg-gradient-to-r from-brand via-blue-600 to-cyan-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(34,211,238,0.22)] hover:shadow-[0_0_40px_rgba(34,211,238,0.42)] flex items-center justify-center gap-3 active:scale-95 cursor-pointer overflow-hidden font-display tracking-widest"
                >
                  {/* Glossy sweep glare effect inside button */}
                  <span className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-transform duration-1000 ease-out z-10 pointer-events-none" />
                  
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-white/10 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <Play className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  <span>CONTINUE</span>
                </button>
              </div>

              <div className="text-[9px] font-mono text-gray-500 tracking-widest pt-1 uppercase flex items-center gap-1">
                <Command className="w-3 h-3 text-cyan-600" /> SECURE WEB HOSTING ACTIVE
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

