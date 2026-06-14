import { useState, useEffect, MouseEvent } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { ExternalLink, Github, Layers, PlayCircle, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import LazyImage from '../ui/LazyImage';
import { useLanguage } from '../../hooks/useLanguage';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  order: number;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'AI Test Case Generator',
    description: 'Autonomous QA agent that extracts test scenarios from natural language documentation with 95% accuracy.',
    techStack: ['Python', 'Gemini API', 'Selenium', 'React'],
    order: 1,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Resume Morph AI',
    description: 'Dynamic portfolio application that adapts its content based on the target job description using prompt engineering.',
    techStack: ['Next.js', 'OpenAI', 'Tailwind', 'Firebase'],
    order: 2,
    imageUrl: 'https://images.unsplash.com/photo-1664575196412-37c177ed055d?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'QA Copilot Dashboard',
    description: 'Real-time monitoring dashboard for automated test execution with AI defect analysis and root cause detection.',
    techStack: ['Node.js', 'D3.js', 'MongoDB', 'LangChain'],
    order: 3,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop'
  }
];

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePosMap, setMousePosMap] = useState<Record<string, { x: number; y: number }>>({});
  const { t, resolveTranslation } = useLanguage();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosMap(prev => ({
      ...prev,
      [id]: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }));
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Project>('projects', 'order');
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEFAULT_PROJECTS);
        }
      } catch (err) {
        console.warn("Projects data load failed, using fallbacks:", err);
        setItems(DEFAULT_PROJECTS);
      }
    }
    load();
  }, []);

  const getProjectTitle = (p: Project) => {
    if (p.id === '1') return t('projects.p1_title');
    if (p.id === '2') return t('projects.p2_title');
    if (p.id === '3') return t('projects.p3_title');
    return resolveTranslation(p, 'title');
  };

  const getProjectDescription = (p: Project) => {
    if (p.id === '1') return t('projects.p1_description');
    if (p.id === '2') return t('projects.p2_description');
    if (p.id === '3') return t('projects.p3_description');
    return resolveTranslation(p, 'description');
  };

  return (
    <Section id="projects" title={t('projects.title')} subtitle={t('projects.subtitle')}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
        {items.map((project, idx) => {
          const isFlagship = idx === 0;
          const pos = mousePosMap[project.id] || { x: 0, y: 0 };
          const isHovered = hoveredId === project.id;

          const handleProjectClick = () => {
            const url = project.liveUrl || project.githubUrl;
            if (url) {
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: isFlagship ? 0 : (idx - 1) * 0.1 }}
              onMouseMove={(e) => handleMouseMove(e, project.id)}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={handleProjectClick}
              className={cn(
                "group relative flex flex-col bg-gradient-to-b from-[#0b0f2a] to-[#040616] border border-white/[0.06] rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#6366f1]/10",
                isFlagship 
                  ? "md:col-span-2 lg:flex-row gap-8 lg:gap-12 p-8 lg:p-10 border-white/[0.08] hover:border-[#6366f1]/30" 
                  : "p-6 border-white/[0.05] hover:border-[#6366f1]/20 hover:y-[-6px]"
              )}
              style={isFlagship ? {
                boxShadow: isHovered ? '0 0 50px -12px rgba(99, 102, 241, 0.15)' : 'none'
              } : undefined}
            >
              {/* Radial background glow following cursor */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                  background: `radial-gradient(400px circle at ${pos.x}px ${pos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`
                }}
              />

              {/* Decorative side accent tag line for flagship */}
              {isFlagship && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6366f1]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              {/* Image Showcase Frame with Spotlight */}
              <div 
                className={cn(
                  "relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#02030d] w-full z-10 select-none group-hover:border-white/[0.15] transition-all duration-500 shadow-inner",
                  isFlagship ? "lg:w-[55%] aspect-[16/10]" : "aspect-[16/10] mb-6"
                )}
              >
                <LazyImage 
                  src={project.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"} 
                  alt={getProjectTitle(project)}
                  className="grayscale-[0.25] group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-[1.05]"
                  wrapperClassName="w-full h-full"
                />
                
                {/* Visual Glass overlays for realistic screens depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#02030d]/80 via-transparent to-transparent opacity-90 group-hover:opacity-50 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_45%)]" />
                
                {/* Tech Badges floating beautifully in image */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-20">
                  {project.techStack.slice(0, 4).map((tech, i) => (
                    <span 
                      key={tech} 
                      className="px-2.5 py-1 bg-[#050616]/95 backdrop-blur-md border border-white/[0.08] rounded-lg text-[9px] uppercase tracking-wider font-semibold text-slate-300 group-hover:text-[#6366f1] group-hover:border-[#6366f1]/30 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[8px] tracking-wider font-bold text-slate-400">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {/* View Case / Button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 z-20 bg-black/40 backdrop-blur-[2px]">
                  <div className="px-5 py-2.5 bg-white text-[#040616] rounded-xl font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 active:scale-95">
                    <PlayCircle className="w-4 h-4 text-[#6366f1]" />
                    {t('projects.view_case')}
                  </div>
                </div>
              </div>

              {/* Description & Metrics Container */}
              <div className={cn(
                "flex flex-col justify-between space-y-4 z-10 flex-1",
                isFlagship ? "lg:py-2" : "pt-2"
              )}>
                <div className="space-y-4">
                  
                  {/* Category Pill Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5",
                      isFlagship 
                        ? "bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/20 animate-pulse" 
                        : "bg-white/[0.04] text-slate-400 border border-white/[0.06]"
                    )}>
                      {isFlagship ? <Sparkles className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                      {isFlagship ? t('projects.flagship') : t('projects.enterprise')}
                    </div>
                  </div>

                  {/* Project Title */}
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={cn(
                      "font-bold text-white group-hover:text-[#6366f1] transition-colors duration-400",
                      isFlagship ? "text-2xl md:text-4xl tracking-tight leading-tight" : "text-xl md:text-2xl leading-snug"
                    )}>
                      {getProjectTitle(project)}
                    </h3>
                  </div>

                  {/* Body description */}
                  <p className={cn(
                    "text-slate-400 leading-relaxed font-normal",
                    isFlagship ? "text-base md:text-lg max-w-2xl" : "text-sm max-w-xl"
                  )}>
                    {getProjectDescription(project)}
                  </p>
                </div>

                {/* Footer Interaction elements with fine link items */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.length > 0 && (
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden group-hover:inline-block transition-all animate-fadeIn">
                        {project.techStack.join(' • ')}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 group-hover:hidden transition-all">
                      Click to explore case study
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/[0.03] hover:bg-[#6366f1]/10 border border-white/10 hover:border-[#6366f1]/30 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                        title="GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/[0.03] hover:bg-[#6366f1]/10 border border-white/10 hover:border-[#6366f1]/30 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* View More Call to Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
         <button className="px-8 py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#6366f1]/30 rounded-xl transition-all text-xs font-bold tracking-widest uppercase inline-flex items-center gap-3 cursor-pointer group/btn shadow-inner">
            {t('projects.archive_btn')}
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] group-hover/btn:bg-[#6366f1]/20 flex items-center justify-center transition-colors">
               <ChevronRight className="w-4 h-4 text-slate-300 group-hover/btn:text-[#6366f1]" />
            </div>
         </button>
      </motion.div>
    </Section>
  );
}
