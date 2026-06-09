import { useState, useEffect, MouseEvent } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { ExternalLink, Github, Layers, PlayCircle, ChevronRight } from 'lucide-react';
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { t, resolveTranslation } = useLanguage();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {items.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onMouseMove={(e) => handleMouseMove(e, project.id)}
            className={cn(
              "group relative flex flex-col",
              idx === 0 && "md:col-span-2 lg:flex-row gap-8 lg:gap-16 items-center"
            )}
          >
            {/* Image Container with 3D-like hover effect & Spotlight */}
            <motion.div 
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                "relative rounded-3xl overflow-hidden border border-white/10 mb-6 group-hover:border-brand/30 transition-all shadow-2xl bg-[#02040a] cursor-pointer",
                idx === 0 ? "w-full lg:w-3/5 aspect-video" : "aspect-video w-full"
              )}
            >
              {/* Spotlight Effect */}
              <div 
                className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--brand-primary-rgb), 0.15), transparent 40%)`
                }}
              />

              <LazyImage 
                src={project.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"} 
                alt={getProjectTitle(project)}
                className="grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                wrapperClassName="w-full h-full"
              />
              
              {/* Overlay Gradient & Grain */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noiseFilter)%22%2F%3E%3C%2Fsvg%3E')] opacity-[0.03] pointer-events-none"></div>
              
              {/* Tech Badges (Floating interaction) */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-20">
                {project.techStack.map((tech, i) => (
                  <motion.span 
                    key={tech} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (i * 0.05) }}
                    className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[9px] uppercase tracking-widest font-bold text-brand group-hover:border-brand/30 transition-colors"
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              {/* View Project Button (Revealed on Hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 z-20">
                <div className="px-6 py-3 bg-brand text-white rounded-full font-bold text-sm tracking-widest uppercase flex items-center gap-2 shadow-xl shadow-brand/20">
                  <PlayCircle className="w-5 h-5" />
                  {t('projects.view_case')}
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className={cn(
               "space-y-4 px-2 flex-1",
               idx === 0 && "py-4 md:py-8"
            )}>
              <div className="flex items-center justify-between">
                <h3 className={cn(
                  "font-bold text-white group-hover:text-brand transition-colors",
                  idx === 0 ? "text-3xl md:text-5xl tracking-tight" : "text-2xl"
                )}>
                  {getProjectTitle(project)}
                </h3>
                <div className="flex items-center gap-4 text-gray-500">
                   {project.githubUrl && <a href={project.githubUrl} className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>}
                   {project.liveUrl && <a href={project.liveUrl} className="hover:text-white transition-colors"><ExternalLink className="w-5 h-5" /></a>}
                </div>
              </div>
              <p className={cn(
                "text-gray-400 leading-relaxed",
                idx === 0 ? "text-lg md:text-xl max-w-2xl" : "max-w-xl text-sm"
              )}>
                {getProjectDescription(project)}
              </p>
              <div className="flex items-center gap-2 pt-2">
                 <Layers className="w-4 h-4 text-brand" />
                 <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                   {idx === 0 ? t('projects.flagship') : t('projects.enterprise')}
                 </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* View More Call to Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 text-center"
      >
         <button className="px-8 py-4 bg-white/2 hover:bg-white/5 border border-white/10 hover:border-brand/30 rounded-2xl transition-all text-sm font-bold tracking-widest uppercase inline-flex items-center gap-3 cursor-pointer">
            {t('projects.archive_btn')}
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
               <ChevronRight className="w-4 h-4 text-brand" />
            </div>
         </button>
      </motion.div>
    </Section>
  );
}
