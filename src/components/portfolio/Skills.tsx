import { useState, useEffect, useRef, useMemo } from 'react';
import Section from './Section';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Workflow, 
  Users,
  Terminal,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { SkillLogo } from './SkillLogo';
import { cn } from '../../lib/utils';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const DEFAULT_SKILLS: Skill[] = [
  { id: 'functional', name: 'Functional Testing', category: 'Testing', level: 95 },
  { id: 'regression', name: 'Regression & Smoke', category: 'Testing', level: 95 },
  { id: 'ai_tools', name: 'ChatGPT, Copilot, Gemini', category: 'AI in QA', level: 95 },
  { id: 'prompt_eng', name: 'Prompt Engineering', category: 'AI in QA', level: 90 },
  { id: 'postman', name: 'Postman & REST API', category: 'API & Data', level: 92 },
  { id: 'sql_db', name: 'SQL & Database Testing', category: 'API & Data', level: 88 },
  { id: 'cicd', name: 'Jenkins & CI/CD', category: 'Automation & DevOps', level: 85 },
  { id: 'scrum_agile', name: 'Agile & Scrum Master', category: 'Leadership', level: 95 },
];

const CATEGORIES = [
  { id: 'testing', name: 'Testing', icon: ShieldCheck, color: 'from-blue-500 to-cyan-500' },
  { id: 'api_data', name: 'API & Data', icon: Database, color: 'from-purple-500 to-indigo-500' },
  { id: 'ai_qa', name: 'AI in QA', icon: Cpu, color: 'from-cyan-400 to-blue-500' },
  { id: 'automation', name: 'Automation', icon: Workflow, color: 'from-emerald-400 to-cyan-500' },
  { id: 'leadership', name: 'Leadership', icon: Users, color: 'from-orange-400 to-red-500' },
];

export default function Skills() {
  const [items, setItems] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].name);
  const { t, resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Skill>('skills');
        setItems(data && data.length > 0 ? data : DEFAULT_SKILLS);
      } catch (err) {
        setItems(DEFAULT_SKILLS);
      }
    }
    load();
  }, []);

  const filteredSkills = useMemo(() => {
    return items.filter(s => {
      const sCat = s.category.toLowerCase().trim();
      const active = activeCategory.toLowerCase().trim();
      return sCat === active || 
             (active.includes('api') && sCat.includes('api')) ||
             (active.includes('ai') && sCat.includes('ai')) ||
             (active.includes('automation') && sCat.includes('automation'));
    });
  }, [items, activeCategory]);

  return (
    <Section 
      id="skills" 
      title={t('skills.title') || "Knowledge Universe"} 
      subtitle={t('skills.subtitle')}
    >
      <div className="max-w-6xl mx-auto">
        {/* Category Navigation (Planetary Selector) */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 md:mb-16 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "group relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-500 overflow-hidden",
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <div className="relative z-10 flex items-center gap-2">
                  <cat.icon className={cn("w-3.5 h-3.5 sm:w-4 h-4 transition-transform duration-500", isActive && "scale-110")} />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                    {cat.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="active-cat-bg"
                    className={cn("absolute inset-0 bg-gradient-to-r -z-10", cat.color)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Constellation View */}
        <div className="relative min-h-[350px] md:min-h-[400px] flex items-center justify-center p-4 sm:p-8 glass-card rounded-[2rem] md:rounded-[3rem] overflow-hidden">
          {/* Orbital Paths Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] border border-slate-700 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
            <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] border border-slate-800 rounded-full animate-spin-slow" style={{ animationDuration: '60s', animationDirection: 'reverse' }} />
            <div className="absolute w-[600px] h-[600px] md:w-[700px] md:h-[700px] border border-slate-900 rounded-full animate-spin-slow" style={{ animationDuration: '90s' }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl mx-auto"
            >
              {filteredSkills.map((skill, idx) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                >
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors shadow-inner">
                      <SkillLogo name={skill.name} className="w-6 h-6 sm:w-8 sm:h-8 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                    {/* Pulsing indicator for high skill level */}
                    {skill.level >= 90 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                        <Sparkles className="w-1.5 h-1.5 sm:w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center w-full">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 sm:mb-2 line-clamp-1">
                      {skill.name}
                    </h3>
                    <div className="w-full max-w-[80px] sm:max-w-[96px] mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Floating Stardust Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -100],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '0',
                }}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full blur-[1px]"
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center items-center gap-8 opacity-40">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Expert Authority</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-700 rounded-full" />
              <span className="text-[10px] uppercase tracking-widest font-bold">In-Orbit Specialization</span>
           </div>
        </div>
      </div>
    </Section>
  );
}
