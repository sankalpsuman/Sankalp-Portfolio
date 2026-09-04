import React, { useEffect, useState, memo } from 'react';

export const BackgroundEffects: React.FC<{ active?: boolean }> = memo(({ active = true }) => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number; opacity: number }>>([]);

  useEffect(() => {
    if (!active) {
      setStars([]);
      return;
    }

    const mobile = window.innerWidth < 768;
    const count = mobile ? 20 : 40;
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * -10,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setStars(arr);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020617] transform-gpu">
      {/* 1. Deep Space Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />

      {/* 2. Pure CSS Subtle Ambient Glows */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-blue-600/10 blur-[80px] md:blur-[120px] pointer-events-none transform-gpu translate-z-0 will-change-transform" />
        <div className="absolute bottom-[20%] right-[10%] w-[250px] h-[250px] md:w-[450px] md:h-[450px] rounded-full bg-purple-600/10 blur-[60px] md:blur-[100px] pointer-events-none transform-gpu translate-z-0 will-change-transform" />
      </div>

      {/* 3. Twinkling Stars via Lightweight CSS */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `pulse ${star.duration}s infinite ease-in-out ${star.delay}s`,
            }}
            className="absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
          />
        ))}
      </div>

      {/* 4. Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
});
