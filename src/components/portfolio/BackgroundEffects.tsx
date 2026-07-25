import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const BackgroundEffects: React.FC<{ active?: boolean }> = memo(({ active = true }) => {
  const [isMobile, setIsMobile] = useState(true);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number; opacity: number }>>([]);
  
  // Spring-smoothed mouse trackers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 50, stiffness: 150, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (!active) {
      setStars([]);
      return;
    }

    let resizeTimer: NodeJS.Timeout;
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      const count = mobile ? 50 : 150;
      const arr = Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * -20,
        duration: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3
      }));
      setStars(arr);
    };

    const throttledResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 250);
    };

    checkMobile();
    window.addEventListener('resize', throttledResize);

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position for parallax
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 40);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 40);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(resizeTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617]">
      
      {/* 1. Deep Space Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />

      {/* 2. Static Distant Star Layer */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      {/* 3. Parallax Nebula Glows */}
      <motion.div 
        style={{ x: smoothX, y: smoothY }}
        className="absolute inset-0 overflow-hidden transform-gpu"
      >
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-indigo-600/5 blur-[150px] mix-blend-screen" />
      </motion.div>

      {/* 4. Twinkling Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          />
        ))}
      </div>

      {/* 5. Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
});
