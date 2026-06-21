import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const BackgroundEffects: React.FC<{ active?: boolean }> = ({ active = true }) => {
  const [isMobile, setIsMobile] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number }>>([]);
  
  // Spring-smoothed mouse trackers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 40, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Detect mobile
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Initialize sparse premium cyber sparks
      const count = mobile ? 8 : 24;
      const arr = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * -20,
        duration: Math.random() * 15 + 15,
      }));
      setParticles(arr);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Passive mouse move listener for the tracking light
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 150); // Offset by half the glow sphere width (300px)
      mouseY.set(e.clientY - 150);
    };

    if (window.innerWidth >= 768) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      
      {/* 1. Mouse Follow Light Lens Glow Flare (Desktop Only) */}
      {!isMobile && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            width: '300px',
            height: '300px',
            willChange: 'transform',
            transform: 'translate3d(0,0,0)'
          }}
          className="fixed top-0 left-0 rounded-full bg-gradient-to-tr from-brand/8 via-purple-500/3 to-cyan-500/6 blur-[110px] pointer-events-none z-10 opacity-70 transform-gpu"
        />
      )}

      {/* 2. Slow-Floating Cyber Spark Elements */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: `${particle.x}%`, 
              y: '105%', 
              opacity: 0,
              scale: Math.random() * 0.4 + 0.8
            }}
            animate={{
              y: ['105%', '-5%'],
              opacity: [0, 0.45, 0.45, 0],
              x: [
                `${particle.x}%`, 
                `${particle.x + (Math.random() > 0.5 ? 8 : -8)}%`
              ]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'linear',
            }}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              willChange: "transform, opacity",
              transform: "translate3d(0,0,0)"
            }}
            className="absolute rounded-full bg-cyan-400/40 shadow-[0_0_6px_#22d3ee] transform-gpu"
          />
        ))}
      </div>

      {/* 3. Tech Blueprint Vector Icons Floating discretely */}
      <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden z-0 max-w-7xl mx-auto opacity-35 px-8">
        {/* Decorative corner target grid line-art 1 */}
        <div className="absolute top-[18%] left-4 w-28 h-28 border border-dashed border-white/5 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '40s' }}>
          <div className="w-20 h-20 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-brand/35 rounded-full"></div>
          </div>
        </div>

        {/* Decorative corner target grid line-art 2 */}
        <div className="absolute top-[48%] right-4 w-32 h-32 border border-dashed border-white/5 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '60s' }}>
          <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-purple-500/20 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Decorative corner target grid line-art 3 */}
        <div className="absolute top-[78%] left-8 w-24 h-24 border border-dashed border-white/5 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '50s' }}>
          <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-500/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
