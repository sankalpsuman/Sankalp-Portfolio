import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { Settings2, Zap, Sparkles, Eye, EyeOff, Battery, Monitor, ShieldCheck, Cpu } from 'lucide-react';

type EffectMode = 'minimal' | 'balanced' | 'cinematic' | 'ultra';

interface ImmersiveBackgroundProps {
  active?: boolean;
}

export const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({ active = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<EffectMode>('balanced');
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Scroll tracking
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const auroraRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  // Settings Toggles
  const [enableParticles, setEnableParticles] = useState(true);
  const [enableCursorGlow, setEnableCursorGlow] = useState(true);
  const [enableNoise, setEnableNoise] = useState(true);
  const [batterySaver, setBatterySaver] = useState(false);

  // Time-based colors
  const timeBasedColors = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { primary: '#004D7A', secondary: '#06152E' }; // Morning
    if (hour >= 12 && hour < 17) return { primary: '#0A1E3A', secondary: '#020617' }; // Afternoon
    if (hour >= 17 && hour < 21) return { primary: '#3B1D66', secondary: '#06152E' }; // Evening
    return { primary: '#020617', secondary: '#06152E' }; // Night
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Section Colors mapping
  const sectionThemes = {
    hero: { primary: '#020617', secondary: '#06152E', accent: '#3b82f6' },
    about: { primary: '#06152E', secondary: '#0A1E3A', accent: '#22d3ee' },
    experience: { primary: '#0A1E3A', secondary: '#111827', accent: '#8b5cf6' },
    projects: { primary: '#111827', secondary: '#020617', accent: '#ec4899' },
    contact: { primary: '#020617', secondary: '#06152E', accent: '#f59e0b' }
  };

  const [currentSection, setCurrentSection] = useState<keyof typeof sectionThemes>('hero');
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  // Welcome Animation Timer
  useEffect(() => {
    const timer = setTimeout(() => setWelcomeComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Section Tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id in sectionThemes) {
              setCurrentSection(id as keyof typeof sectionThemes);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = ['hero', 'about', 'experience', 'projects', 'contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Shooting Star Logic
  const shootingStars = useRef<any[]>([]);

  const [showEasterEgg, setShowEasterEgg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowEasterEgg(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  // Canvas Animation Engine
  useEffect(() => {
    if (!canvasRef.current || !active || batterySaver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Particles Data
    const particleCount = mode === 'minimal' ? 20 : mode === 'balanced' ? 60 : mode === 'cinematic' ? 120 : 200;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2
    }));

    // Neural Mesh Data
    const meshPoints: { x: number; y: number; originalX: number; originalY: number; pulse: number }[] = [];
    const rows = 12;
    const cols = 20;
    const spacingX = width / (cols - 1);
    const spacingY = 200 / (rows - 1);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        meshPoints.push({
          x: j * spacingX,
          y: height - (rows - i) * spacingY,
          originalX: j * spacingX,
          originalY: height - (rows - i) * spacingY,
          pulse: 0
        });
      }
    }

    let time = 0;
    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Easter Egg: "SS" Constellation
      if (showEasterEgg && mode !== 'minimal') {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.font = 'bold 200px font-display';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = `rgba(34, 211, 238, ${Math.sin(time) * 0.1 + 0.1})`;
        ctx.setLineDash([5, 15]);
        ctx.strokeText('SS', 0, 0);
        ctx.restore();
      }

      // Random Shooting Stars
      if (mode !== 'minimal' && Math.random() < 0.005) {
        shootingStars.current.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.5,
          len: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 5,
          opacity: 1
        });
      }

      shootingStars.current.forEach((star, idx) => {
        star.x += star.speed;
        star.y += star.speed * 0.5;
        star.opacity -= 0.02;

        if (star.opacity <= 0) {
          shootingStars.current.splice(idx, 1);
        } else {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.lineWidth = 2;
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - star.len, star.y - star.len * 0.5);
          ctx.stroke();
        }
      });

      // Draw Digital Mesh (Bottom)
      if (mode !== 'minimal') {
        ctx.beginPath();
        ctx.lineWidth = 0.5;

        meshPoints.forEach((p, idx) => {
          // Subtle organic movement
          p.x = p.originalX + Math.sin(time + p.originalY * 0.01) * 10;
          p.y = p.originalY + Math.cos(time + p.originalX * 0.01) * 5;

          // React to mouse
          const dx = mouseX.get() - p.x;
          const dy = mouseY.get() - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.x -= dx * force * 0.1;
            p.y -= dy * force * 0.1;
            p.pulse = Math.max(p.pulse, force);
          }

          p.pulse *= 0.95; // Decay pulse

          // AI Neural Pulse logic
          if (Math.random() < 0.0001) p.pulse = 1;

          ctx.strokeStyle = `rgba(34, 211, 238, ${0.08 + p.pulse * 0.2})`;

          // Horizontal lines
          if (idx % cols !== cols - 1) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(meshPoints[idx + 1].x, meshPoints[idx + 1].y);
          }
          // Vertical lines
          if (idx < (rows - 1) * cols) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(meshPoints[idx + cols].x, meshPoints[idx + cols].y);
          }
        });
        ctx.stroke();
      }

      // Draw Particles & Constellations
      if (enableParticles) {
        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(time * p.twinkleSpeed * 100 + p.twinkleOffset));
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(165, 180, 252, ${currentOpacity})`;
          ctx.fill();

          // Connect nearby particles (Constellation)
          if (mode === 'ultra' || mode === 'cinematic') {
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 100) {
                // Interactive Neural Network: Glow brighter near mouse
                const mx = mouseX.get();
                const my = mouseY.get();
                const mDist = Math.sqrt((p.x - mx) ** 2 + (p.y - my) ** 2);
                const glow = mDist < 150 ? (150 - mDist) / 150 : 0;

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(165, 180, 252, ${(100 - dist) / 1000 + glow * 0.1})`;
                ctx.stroke();
              }
            }
          }
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [active, mode, batterySaver, enableParticles, mouseX, mouseY]);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        scale: [1, 1.02, 1],
      }}
      transition={{ 
        opacity: { duration: 2 },
        scale: { duration: 15, repeat: Infinity, ease: 'easeInOut' }
      }}
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
      style={{ 
        backgroundColor: sectionThemes[currentSection].secondary,
        transition: 'background-color 2s ease'
      }}
    >
      {/* Layer 1: Animated Gradient */}
      <motion.div 
        style={{ y: backgroundY }}
        animate={{ 
          background: `radial-gradient(circle at 50% 50%, ${sectionThemes[currentSection].primary}, transparent 70%)`
        }}
        transition={{ duration: 3 }}
        className="absolute inset-0 opacity-40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#06152E] to-[#3B1D66] animate-[aurora_60s_linear_infinite]" />
      </motion.div>

      {/* Bonus: Floating Glass Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              rotate: [0, 360],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ 
              duration: 20 + i * 5, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`
            }}
            className="absolute rounded-full border border-white/5 bg-white/5 backdrop-blur-md"
          />
        ))}
      </div>

      {/* Layer 2: Aurora Lights */}
      <motion.div 
        style={{ rotate: auroraRotate }}
        className="absolute inset-0 opacity-10"
      >
        <svg className="w-full h-full">
          <filter id="aurora-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" seed="1" />
            <feDisplacementMap in="SourceGraphic" scale="100" />
          </filter>
          <motion.ellipse 
            animate={{ 
              rx: ['40%', '60%', '40%'],
              ry: ['20%', '40%', '20%'],
              cx: ['20%', '80%', '20%'],
              cy: ['20%', '50%', '20%']
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            fill="url(#grad-purple)" 
            filter="url(#aurora-filter)"
          />
          <defs>
            <radialGradient id="grad-purple">
              <stop offset="0%" stopColor="#3B1D66" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B1D66" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Layer 3-7: Canvas (Mesh, Particles, Constellations) */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Layer 5: Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 blur-[140px] rounded-full"
        />
      </div>

      {/* Layer 9: Noise Film Grain */}
      {enableNoise && <div className="noise-overlay" />}

      {/* Layer: Cursor Glow */}
      {enableCursorGlow && !isMobile && (
        <motion.div 
          style={{ x: smoothMouseX, y: smoothMouseY, translateX: '-50%', translateY: '-50%' }}
          className="fixed top-0 left-0 w-96 h-96 bg-brand/5 blur-[100px] rounded-full z-10"
        />
      )}

      {/* Depth Fog */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-40 pointer-events-none" />

      {/* Effects Control Panel - Fixed at bottom left */}
      <div className="fixed bottom-6 left-6 z-[60] pointer-events-auto">
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white/70 hover:text-white transition-all shadow-2xl flex items-center gap-2"
          >
            <Settings2 className="w-5 h-5" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase hidden group-hover:block">Visual Engine</span>
          </motion.button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-16 left-0 w-72 bg-[#0a0f1e]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Atmosphere Mode
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['minimal', 'balanced', 'cinematic', 'ultra'] as EffectMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-mono border transition-all ${
                          mode === m 
                            ? 'bg-brand/20 border-brand text-brand' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-[0.2em] uppercase flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    System Toggles
                  </h3>
                  <div className="space-y-2">
                    <ToggleItem 
                      icon={Sparkles} 
                      label="Particles" 
                      active={enableParticles} 
                      onClick={() => setEnableParticles(!enableParticles)} 
                    />
                    <ToggleItem 
                      icon={Eye} 
                      label="Cursor Glow" 
                      active={enableCursorGlow} 
                      onClick={() => setEnableCursorGlow(!enableCursorGlow)} 
                    />
                    <ToggleItem 
                      icon={Cpu} 
                      label="Noise Grain" 
                      active={enableNoise} 
                      onClick={() => setEnableNoise(!enableNoise)} 
                    />
                    <ToggleItem 
                      icon={Battery} 
                      label="Battery Saver" 
                      active={batterySaver} 
                      onClick={() => setBatterySaver(!batterySaver)} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">Engine Active • 60FPS</span>
                  </div>
                  <Monitor className="w-3 h-3 text-white/20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const ToggleItem: React.FC<{ icon: any; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
  >
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-white/20'}`} />
      <span className={`text-[10px] font-mono ${active ? 'text-white/80' : 'text-white/20'}`}>{label}</span>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-all ${active ? 'bg-brand/50' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </div>
  </button>
);
