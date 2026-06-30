import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Cpu, Terminal, Shield, Workflow } from 'lucide-react';
import { AutoTranslate } from './TranslationComponents';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  containerClassName?: string;
  title?: string;
  subtitle?: string;
}

// Map of unique tech line-art vectors representing QA and Agile for decorative backgrounds
const getSectionDecoration = (id?: string) => {
  if (!id) return null;
  
  if (id.includes('skills') || id.includes('ai')) {
    return (
      <div className="absolute right-6 top-12 opacity-[0.03] text-brand pointer-events-none hidden lg:block select-none">
        <Cpu className="w-48 h-48 stroke-[0.5]" />
      </div>
    );
  }
  if (id.includes('experience') || id.includes('career')) {
    return (
      <div className="absolute left-6 bottom-12 opacity-[0.03] text-purple-400 pointer-events-none hidden lg:block select-none">
        <Workflow className="w-56 h-56 stroke-[0.5]" />
      </div>
    );
  }
  if (id.includes('qa') || id.includes('test') || id.includes('projects')) {
    return (
      <div className="absolute right-12 bottom-6 opacity-[0.03] text-cyan-400 pointer-events-none hidden lg:block select-none">
        <Shield className="w-48 h-48 stroke-[0.6]" />
      </div>
    );
  }
  return null;
};

export default function Section({ 
  children, 
  id, 
  className, 
  containerClassName,
  title,
  subtitle 
}: SectionProps) {
  const decor = getSectionDecoration(id);

  return (
    <section 
      id={id} 
      className={cn("py-20 lg:py-32 relative overflow-hidden bg-[#050816]", className)}
    >
      {/* 2026 Cyber Grid Overlay & Dot Array Blueprint */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.08) 1px, transparent 0),
            linear-gradient(to right, rgba(255, 255, 255, 0.003) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.003) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 100px 100px, 100px 100px'
        }}
      />

      {/* Floating Abstract Cyber Gradient Blobs */}
      <div className="absolute top-1/4 left-1/12 w-[35rem] h-[35rem] bg-brand/3 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '14s' }}></div>
      <div className="absolute bottom-1/4 right-1/12 w-[40rem] h-[40rem] bg-purple-500/3 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '22s' }}></div>
      <div className="absolute top-1/2 left-1/3 w-[25rem] h-[25rem] bg-cyan-500/2 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '18s' }}></div>

      {/* Subtle Premium Angled Glass Light Reflex Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Vector Line Art Decoration */}
      {decor}

      <div className={cn("max-w-7xl mx-auto px-6 lg:px-8 relative z-10", containerClassName)}>
        {(title || subtitle) && (
          <div className="mb-16 lg:mb-24 space-y-5 text-center relative">
            
            {/* Tech tag micro ID index marker */}
            {id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.4, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full text-[9px] font-mono text-gray-500 tracking-[0.25em] uppercase mx-auto select-none hover:opacity-80 transition-opacity"
              >
                <Terminal className="w-2.5 h-2.5 text-brand" />
                // SYSTEM_MODULE::{id.replace('-', '_').toUpperCase()}
              </motion.div>
            )}

            {subtitle && (
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="text-brand font-mono text-xs tracking-widest uppercase block font-semibold will-change-[transform,opacity]"
              >
                <AutoTranslate text={subtitle} />
              </motion.span>
            )}
            
            {title && (
              <div className="relative inline-block">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display will-change-[transform,opacity]"
                >
                  <AutoTranslate text={title} />
                </motion.h2>
                
                {/* Visual Accent Glow bar beneath core headers */}
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: "40px", opacity: 0.8 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="h-[2.5px] bg-brand mx-auto mt-4 rounded-full shadow-[0_0_8px_#3b82f6]"
                />
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
