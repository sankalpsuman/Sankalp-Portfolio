import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  Cpu, 
  Award, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Zap, 
  Compass, 
  Crosshair 
} from 'lucide-react';

interface AICommandCenterPortraitProps {
  active?: boolean;
  imageUrl?: string;
  videoUrl?: string;
}

export const AICommandCenterPortrait: React.FC<AICommandCenterPortraitProps> = ({ 
  active = true, 
  imageUrl, 
  videoUrl 
}) => {
  const { t } = useLanguage();
  
  // Parallax tilt coordinates
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Orbiting timing angle state driven of requestAnimationFrame for ultra-smooth rendering
  const [angle, setAngle] = useState(0);

  // Physics animation values for the parallax tilt utilizing Motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 180, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Track if mobile to bypass heavy hover tracking or adjust orbit radiuses
  const [isMobile, setIsMobile] = useState(false);

  // Initialize and run orbiting sequence
  useEffect(() => {
    let frameId: number;
    let lastTime = 0;
    
    const tick = (time: number) => {
      // 1.5 rads/sec orbit speed
      setAngle((prev) => (prev + 0.006) % (Math.PI * 2));
      frameId = requestAnimationFrame(tick);
    };
    
    if (active) {
      frameId = requestAnimationFrame(tick);
    }
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [active]);

  // Handle Resize and Mobile Detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Neural Network Particle Constellation drawing loop inside full canvas container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth || 500);
    let height = (canvas.height = canvas.offsetHeight || 550);

    const handleCanvasResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 500;
      height = canvas.height = canvas.offsetHeight || 550;
    };
    window.addEventListener('resize', handleCanvasResize);

    // Dynamic constellation nodes with elegant executive scheme
    const particleCount = isMobile ? 18 : 32;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 0.8,
        // Alternate between gold/amber nodes and royal blue nodes
        color: i % 2 === 0 ? 'rgba(234, 179, 8, 0.65)' : 'rgba(34, 211, 238, 0.65)'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background grid lines lightly
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw interconnecting network lines
      ctx.lineWidth = 0.55;
      const maxDistance = isMobile ? 80 : 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.16;
            // Mixed gold-blue connection line gradient
            const grad = ctx.createLinearGradient(pi.x, pi.y, pj.x, pj.y);
            grad.addColorStop(0, pi.color.replace('0.65', String(alpha)));
            grad.addColorStop(1, pj.color.replace('0.65', String(alpha)));

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleCanvasResize);
      cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  // Pointer movement triggers premium 3D Parallax Tilt coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;
    
    setCoords({ x: normalizedX, y: normalizedY });
    
    // Set motion value springs
    mouseX.set(normalizedX * 16);
    mouseY.set(normalizedY * 16);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    mouseX.set(0);
    mouseY.set(0);
  };

  // Badges lists for the 3D high-tech elliptical orbit
  const orbitBadges = [
    { label: 'QA Architecture', icon: Cpu, color: 'from-amber-400/90 to-amber-600/95', shadow: 'rgba(234,179,8,0.3)', key: 'qa' },
    { label: t('about.role'), icon: ShieldCheck, color: 'from-cyan-400/90 to-blue-500/95', shadow: 'rgba(34,211,238,0.3)', key: 'role' },
    { label: 'Test Lead & QA Eng', icon: Activity, color: 'from-blue-500/90 to-purple-600/95', shadow: 'rgba(59,130,246,0.3)', key: 'test' },
    { label: 'Agile Scrum Master', icon: Terminal, color: 'from-purple-500/90 to-pink-600/95', shadow: 'rgba(168,85,247,0.3)', key: 'scrum' }
  ];

  // Elite coordinates for orbiting elements
  const computedOrbit = (index: number) => {
    // Distribute 4 badges evenly (0, PI/2, PI, 3PI/2 offset)
    const angleOffset = (index * Math.PI) / 2;
    const currentAngle = angle + angleOffset;

    // Oval path radius - wider horizontally, flatter/shallower vertically
    const rx = isMobile ? 145 : 225;
    const ry = isMobile ? 18 : 32;

    const x = Math.cos(currentAngle) * rx;
    const y = Math.sin(currentAngle) * ry;
    
    // Determine depth: front or behind the portrait
    const zIndex = Math.sin(currentAngle) > 0 ? 40 : 5;
    const scale = 0.82 + (Math.sin(currentAngle) + 1) * 0.14;
    const opacity = 0.45 + (Math.sin(currentAngle) + 1) * 0.55;
    
    return { x, y, zIndex, scale, opacity };
  };

  return (
    <div className="relative select-none">
      
      {/* 1. Cinematic Luxury Aura - Dual Blue and Gold Glowing Orbs */}
      <div className="absolute -inset-16 bg-gradient-to-tr from-blue-600/12 via-amber-500/4 to-cyan-400/10 blur-[50px] md:blur-[90px] rounded-full pointer-events-none opacity-80 z-0 animate-pulse transform-gpu translate-z-0 will-change-transform" style={{ animationDuration: '8s' }} />
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/8 via-amber-500/2 to-purple-600/8 blur-[30px] md:blur-[50px] rounded-full pointer-events-none opacity-60 z-0 transform-gpu translate-z-0 will-change-transform" />
      
      {/* Dynamic Liquid Morphing Aurora Blob (provides the fluid luxury liquid effect) */}
      <svg viewBox="0 0 200 200" className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%] opacity-40 blur-3xl z-0 pointer-events-none animate-[pulse_10s_infinite]">
        <path fill="url(#liquid-aurora)" d="M40,-61C51,-52,58,-38,62,-23C66,-9,68,5,66,20C63,35,56,51,44,61C32,71,16,74,1,73C-14,71,-29,65,-41,55C-53,46,-63,32,-67,17C-71,2,-68,-14,-62,-28C-56,-42,-46,-55,-34,-63C-22,-71,-11,-75,2,-79C16,-82,29,-70,40,-61Z" transform="translate(100, 100)">
          <animate attributeName="d" dur="14s" repeatCount="indefinite" values="
            M40,-61C51,-52,58,-38,62,-23C66,-9,68,5,66,20C63,35,56,51,44,61C32,71,16,74,1,73C-14,71,-29,65,-41,55C-53,46,-63,32,-67,17C-71,2,-68,-14,-62,-28C-56,-42,-46,-55,-34,-63C-22,-71,-11,-75,2,-79C16,-82,29,-70,40,-61Z;
            M47,-55C57,-44,61,-27,62,-10C63,7,60,25,51,39C43,53,29,63,13,67C-3,71,-21,69,-35,60C-50,52,-61,37,-65,20C-69,3,-66,-14,-58,-28C-50,-42,-37,-53,-24,-61C-11,-69,2,-73,15,-72C28,-71,37,-67,47,-55Z;
            M42,-64C54,-56,62,-40,64,-24C65,-8,60,8,53,23C46,38,37,53,24,60C10,68,-7,68,-23,62C-38,57,-51,46,-58,31C-66,16,-67,-2,-63,-19C-59,-36,-50,-51,-37,-59C-24,-67,-12,-69,1,-71C15,-73,29,-71,42,-64Z;
            M40,-61C51,-52,58,-38,62,-23C66,-9,68,5,66,20C63,35,56,51,44,61C32,71,16,74,1,73C-14,71,-29,65,-41,55C-53,46,-63,32,-67,17C-71,2,-68,-14,-62,-28C-56,-42,-46,-55,-34,-63C-22,-71,-11,-75,2,-79C16,-82,29,-70,40,-61Z
          "/>
        </path>
        <defs>
          <linearGradient id="liquid-aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.38" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#040611" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Premium Spotlight laser beam from top left */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-gradient-to-br from-amber-400/10 via-cyan-400/5 to-transparent blur-3xl pointer-events-none rounded-tl-none rotate-12 z-10" />

      {/* Embedded tech constellation dots outside frame */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[20, 50, 80].map((left, idx) => (
          <motion.div
            key={idx}
            animate={{ 
              y: [0, -25, 0], 
              opacity: [0.1, 0.4, 0.1],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 5 + idx * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 1.5
            }}
            className="absolute rounded-full bg-amber-400/30 w-1.5 h-1.5 shadow-[0_0_6px_rgba(234,179,8,0.5)]"
            style={{ left: `${left}%`, top: `${15 + idx * 25}%` }}
          />
        ))}
      </div>

      {/* 2. Interactive Parallax Showcase Shell */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        style={{
          transform: `perspective(1200px) rotateX(${-coords.y * 11}deg) rotateY(${coords.x * 11}deg) translate3d(0px, 0px, 0px)`,
          transition: isHovered ? 'none' : 'transform 0.75s cubic-bezier(0.2, 0.85, 0.32, 1.2)',
          willChange: 'transform'
        }}
        className="relative rounded-[2.8rem] overflow-hidden border border-white/10 group bg-[#040611]/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(59,130,246,0.12)] hover:shadow-[0_0_80px_rgba(234,179,8,0.18)] transition-all duration-700 p-2.5 cursor-crosshair z-10 transform-gpu"
      >
        {/* Outer Premium Thin Glowing Rings */}
        <div className="absolute inset-0 border border-white/[0.04] rounded-[2.75rem] pointer-events-none z-10" />
        <div className="absolute inset-2 border border-dashed border-amber-500/10 rounded-[2.6rem] pointer-events-none animate-[spin_100s_linear_infinite] z-10" />
        <div className="absolute inset-3 border border-double border-cyan-400/5 rounded-[2.5rem] pointer-events-none animate-[spin_50s_linear_infinite_reverse] z-10" />

        {/* HUD Targeting Corner Nodes (Iron Man inspired executive details) */}
        <div className="absolute top-6 left-6 border-t-2 border-l-2 border-amber-500/60 w-6 h-6 rounded-tl-sm transition-all duration-300 group-hover:scale-115 z-20" />
        <div className="absolute top-6 right-6 border-t-2 border-r-2 border-cyan-400/60 w-6 h-6 rounded-tr-sm transition-all duration-300 group-hover:scale-115 z-20" />
        <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-cyan-400/60 w-6 h-6 rounded-bl-sm transition-all duration-300 group-hover:scale-115 z-20" />
        <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-amber-500/60 w-6 h-6 rounded-br-sm transition-all duration-300 group-hover:scale-115 z-20" />

        {/* AI HUD Target rings layered behind main image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-dashed border-amber-500/10 animate-[spin_40s_linear_infinite] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-double border-cyan-500/10 animate-[spin_30s_linear_infinite_reverse] pointer-events-none z-0" />

        {/* 3. Embedded Web Neural network Canvas drawing */}
        <div className="absolute inset-3 rounded-[2.5rem] bg-[#020309] overflow-hidden z-0">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" />
        </div>

        {/* 4. Luxury Inner Glass Frame holding portrait & filters */}
        <div className="relative rounded-[2.45rem] overflow-hidden border border-white/[0.07] bg-[#03050c]/90 h-[510px] sm:h-[550px] z-10 overflow-hidden">
          
          {/* Subtle horizontal gold laser sweeping scan mesh */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_96%,_rgba(234,179,8,0.1)_98%,_rgba(234,179,8,0.2)_100%)] bg-[size:100%_40px] pointer-events-none z-10 animate-[pulse_8s_infinite] opacity-60 mix-blend-screen" />
          
          {/* Static premium grid backdrop coordinates - repositioned lower to clear the face completely */}
          <div className="absolute bottom-[23%] right-6 text-[7px] text-[#22d3ee]/40 font-mono tracking-widest text-right space-y-1 select-none pointer-events-none z-20 bg-black/35 backdrop-blur-sm p-1 rounded-md border border-white/5">
            <div>SYS_SYS_INIT: OK_V1.02</div>
            <div>SECTOR_GRID: 902.1 / SANK</div>
            <div>LATENCY: O(1) ROBUST</div>
          </div>
          <div className="absolute bottom-[23%] left-6 text-[7px] text-amber-500/40 font-mono tracking-widest space-y-1 select-none pointer-events-none z-20 bg-black/35 backdrop-blur-sm p-1 rounded-md border border-white/5">
            <div>EXECUTIVE_DEPLOYS: NOMINAL</div>
            <div>RELIABILITY: 100% COVERAGE</div>
            <div>VERIFICATION: SECURE</div>
          </div>

          {/* Active holographic scan laser moving up & down - ultra-fine and translucent to never hide face detail */}
          <motion.div 
            animate={{ top: ["-2%", "102%"] }}
            transition={{ 
              duration: 5.5, 
              ease: "easeInOut", 
              repeat: Infinity,
              repeatType: "loop"
            }}
            style={{ willChange: "top" }}
            className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.4)] z-20 pointer-events-none"
          />

          {/* Premium sweep lighting lens reflex */}
          <motion.div
            animate={{ left: ["-130%", "130%"] }}
            transition={{
              duration: 7,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2
            }}
            style={{ willChange: "left" }}
            className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 z-20 pointer-events-none"
          />

          {/* Golden energy ring around image boundary */}
          <div className="absolute inset-6 rounded-[2.1rem] border border-dashed border-amber-500/10 pointer-events-none z-20 animate-pulse" />
          <div className="absolute inset-8 rounded-[1.9rem] border border-cyan-400/15 pointer-events-none z-20" />

          {/* 5. Parallax Portrait Container */}
          <motion.div 
            className="w-full h-full relative"
            animate={{
              x: isHovered ? -coords.x * 14 : 0,
              y: isHovered ? -coords.y * 14 : 0,
              scale: isHovered ? 1.03 : 1
            }}
            transition={{ type: "spring", damping: 26, stiffness: 220, mass: 0.5 }}
          >
            {videoUrl && active ? (
              <video 
                src={videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover transition-all duration-[800ms] brightness-[0.92] contrast-[1.04]"
              />
            ) : (
              <img 
                src={imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"} 
                alt="Sankalp Suman" 
                className="w-full h-full object-cover transition-all duration-[800ms] brightness-[0.88] contrast-[1.04]"
              />
            )}

            {/* Custom interactive mouse cursor tracking radial highlight */}
            {isHovered && (
              <div 
                style={{
                  left: `${(coords.x + 0.5) * 100}%`,
                  top: `${(coords.y + 0.5) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  willChange: 'left, top'
                }}
                className="absolute bg-gradient-to-tr from-cyan-400/12 to-amber-400/10 w-72 h-72 rounded-full blur-[50px] z-20 pointer-events-none mix-blend-screen"
              />
            )}
          </motion.div>

          {/* Deep elegant shading overlay on base portrait to anchor with deep portfolio background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#040611] via-[#040611]/35 to-transparent opacity-85 pointer-events-none z-15" />
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/8 via-transparent to-amber-500/8 pointer-events-none z-15 mix-blend-screen" />

          {/* Dynamic micro flickering beacons - repositioned lower to stay fully clear of face */}
          <div className="absolute left-[6%] bottom-[16%] z-20 pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span className="absolute left-3.5 top-[-4px] font-mono text-[6px] tracking-widest text-amber-400/80 font-bold uppercase whitespace-nowrap">QA_CORE: FAULTLESS</span>
          </div>

          <div className="absolute right-[6%] bottom-[16%] z-20 pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
            </span>
            <span className="absolute right-3.5 top-[-4px] font-mono text-[6px] tracking-widest text-[#22d3ee]/80 font-bold uppercase whitespace-nowrap">SE_DRIVEN: 100% STABLE</span>
          </div>

          {/* 6. Gold & Blue Tech Glass HUD Badge Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-25 flex justify-between items-end font-mono">
            <div className="bg-black/65 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 text-left leading-none space-y-1 shadow-2xl">
              <span className="text-gray-500 text-[6px] font-bold block tracking-widest uppercase">TEST INTEGRATION</span>
              <span className="text-[#22d3ee] text-[9.5px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                COGNITIVE DEPLOY
              </span>
            </div>
            <div className="bg-black/65 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 text-right leading-none space-y-1 shadow-2xl">
              <span className="text-gray-500 text-[6px] font-bold block tracking-widest uppercase">QUALITY SECURITY</span>
              <span className="text-amber-400 text-[9.5px] font-extrabold block">ZERO DEFECT FLOW</span>
            </div>
          </div>

        </div>
      </div>

      {/* 7. Beautiful 3D Orbiting Badges System - repositioned lower to top-[82%] so orbit crosses ONLY suit/tie level and completely clears his face! */}
      {orbitBadges.map((badge, idx) => {
        const { x, y, zIndex, scale, opacity } = computedOrbit(idx);
        const IconComponent = badge.icon;
        
        return (
          <motion.div
            key={badge.key}
            style={{
              x: isHovered ? x + coords.x * 20 : x,
              y: isHovered ? y + coords.y * 20 : y,
              zIndex: zIndex,
              scale: scale,
              opacity: opacity,
              willChange: 'transform, opacity'
            }}
            transition={{
              type: "spring",
              damping: 24,
              stiffness: 160
            }}
            className="absolute top-[82%] left-1/2 -ml-[100px] -mt-[25px] w-[200px] pointer-events-none"
          >
            <div className="flex justify-center items-center">
              <div 
                style={{
                  boxShadow: `0 8px 24px -4px ${badge.shadow}`,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                className={`py-2 px-3 rounded-xl bg-[#070b1e]/92 backdrop-blur-md border border-white/10 flex items-center gap-2 max-w-full select-none transform-gpu`}
              >
                <div className={`p-1 bg-gradient-to-br ${badge.color} rounded-lg shadow-md border border-white/10 text-white flex-shrink-0`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="truncate text-left leading-none">
                  {badge.key === 'role' ? (
                    <>
                      <div className="text-[7.5px] text-white/45 font-mono uppercase tracking-wider">{t('about.role_label')}</div>
                      <div className="text-[9.5px] font-bold text-white leading-tight mt-0.5">{badge.label}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[7.5px] text-white/45 font-mono uppercase tracking-wider">COMMAND CENTER</div>
                      <div className="text-[9.5px] font-bold text-white leading-tight mt-0.5">{badge.label}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

    </div>
  );
};
