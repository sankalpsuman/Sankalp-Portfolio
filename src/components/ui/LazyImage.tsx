import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number | string;
  height?: number | string;
}

export default function LazyImage({ src, alt, className, wrapperClassName, width, height }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden bg-white/5", wrapperClassName)}>
      <AnimatePresence>
        {!isLoaded && !error && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="w-full h-full bg-blue-900/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-white/5 text-gray-500 text-xs font-mono">
          Failed to load image
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt || "Sankalp Suman Portfolio Visual"}
          width={width}
          height={height}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.05 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn("w-full h-full object-cover", className)}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}
