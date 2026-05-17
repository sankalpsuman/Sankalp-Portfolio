import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  title?: string;
  subtitle?: string;
}

export default function Section({ 
  children, 
  id, 
  className, 
  containerClassName,
  title,
  subtitle 
}: SectionProps) {
  return (
    <section 
      id={id} 
      className={cn("py-20 lg:py-32 relative overflow-hidden", className)}
    >
      <div className={cn("max-w-7xl mx-auto px-6 lg:px-8", containerClassName)}>
        {(title || subtitle) && (
          <div className="mb-16 lg:mb-24 space-y-4 text-center">
            {subtitle && (
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="text-blue-400 font-mono text-sm tracking-widest uppercase block will-change-[transform,opacity]"
              >
                {subtitle}
              </motion.span>
            )}
            {title && (
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl lg:text-5xl font-bold tracking-tight text-white will-change-[transform,opacity]"
              >
                {title}
              </motion.h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
