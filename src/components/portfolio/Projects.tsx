import { useState, useEffect, MouseEvent } from 'react';
import Section from './Section';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { ExternalLink, Github, Layers, PlayCircle, ChevronRight, Sparkles, X, Check, Award, ArrowUpRight } from 'lucide-react';
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
  challenge?: string;
  goal?: string;
  solution?: string;
  testingStrategy?: string;
  architecture?: string;
  toolsUsed?: string[];
  metrics?: string[];
  businessImpact?: string;
  screenshots?: string[];
  lessonsLearned?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'AI Test Case Generator',
    description: 'Autonomous QA agent that extracts test scenarios from natural language documentation with 95% accuracy.',
    techStack: ['Python', 'Gemini API', 'Selenium', 'React'],
    order: 1,
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
    challenge: 'Legacy testing suites were written manually, taking up to 4 Sprints to cover critical validation targets for Telecom billing apps.',
    goal: 'Create an automatic prompt-routed exploratory model to analyze requirements and generate reliable Selenium scripts instantly.',
    solution: 'Designed an intelligent parser utilizing the Gemini model chain to read user journeys and export automated integration flows in real-time.',
    testingStrategy: 'Continuous boundary and regression runs scheduled via Jenkins pipelines with custom reporting structures.',
    architecture: 'Microservices setup featuring an Express orchestration proxy, an isolated scraping VM container, and clean React control frames.',
    toolsUsed: ['Python', 'Gemini API', 'Selenium', 'React', 'Docker'],
    metrics: ['95% scenario coverage precision', '80% speed increase in script authoring', 'Zero critical regressions leaked'],
    businessImpact: 'Freed up 2 engineering positions to dedicate efforts to advanced exploratory and secure load setups.',
    lessonsLearned: 'Strict temperature tuning is required in NLP outputs to prevent duplicate locators from breaking assertion points.'
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
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<Project | null>(null);
  const { t, resolveTranslation } = useLanguage();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
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
    <Section 
      id="projects" 
      title={t('projects.title')} 
      subtitle={t('projects.subtitle')}
      className="bg-space-950/50"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((project, idx) => {
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setSelectedCaseStudy(project)}
              className="group relative glass-card rounded-[2.5rem] overflow-hidden cursor-pointer aspect-[4/5] md:aspect-auto md:h-[500px]"
            >
              {/* Spotlight Effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                style={{
                  background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.15), transparent 80%)`
                } as any}
              />

              {/* Project Image */}
              <div className="absolute inset-0 z-0">
                <LazyImage 
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/60 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                <div className="space-y-4 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map(tech => (
                      <span key={tech} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-emerald-400 transition-all duration-300">
                      {getProjectTitle(project)}
                    </h3>
                    <p className="text-slate-300 line-clamp-2 transition-all duration-500 group-hover:text-white">
                      {getProjectDescription(project)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <span className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                      View Case Study <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reusing Modal logic but with redesigned UI */}
      <AnimatePresence>
        {selectedCaseStudy && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCaseStudy(null)}
              className="fixed inset-0 bg-space-950/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl glass-card rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col z-[120]"
            >
              <button 
                onClick={() => setSelectedCaseStudy(null)}
                className="absolute top-6 right-6 z-30 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="overflow-y-auto custom-scrollbar p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" /> Flagship Project
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {getProjectTitle(selectedCaseStudy)}
                      </h2>
                      <p className="text-xl text-slate-400 leading-relaxed font-serif italic">
                        {getProjectDescription(selectedCaseStudy)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedCaseStudy.metrics?.map((metric, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                          <Check className="w-5 h-5 text-green-400 mb-2" />
                          <p className="text-sm font-medium text-slate-200">{metric}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-6">
                      {selectedCaseStudy.liveUrl && (
                        <a href={selectedCaseStudy.liveUrl} target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-white text-space-950 font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                          Launch Demo <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {selectedCaseStudy.githubUrl && (
                        <a href={selectedCaseStudy.githubUrl} target="_blank" rel="noreferrer" className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2">
                          Repository <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="rounded-3xl overflow-hidden border border-white/10 aspect-video shadow-2xl">
                      <img src={selectedCaseStudy.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">The Challenge</h4>
                        <p className="text-slate-300 leading-relaxed">{selectedCaseStudy.challenge}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">The Solution</h4>
                        <p className="text-slate-300 leading-relaxed">{selectedCaseStudy.solution}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
}
