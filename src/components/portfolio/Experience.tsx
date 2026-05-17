import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { Briefcase, Calendar, ChevronRight } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  tags?: string[];
  order: number;
}

const DEFAULT_EXPERIENCE: Experience[] = [
  {
    id: '1',
    company: 'AMDOCS',
    role: 'Software Test Specialist & Scrum Master',
    period: 'Dec 2021 – Present',
    description: 'Leading QA delivery for enterprise-scale telecom platforms. Implementing AI-assisted testing workflows and managing Agile sprints as Scrum Master.',
    order: 1
  },
  {
    id: '2',
    company: 'HEXAVIEW (Adobe Client)',
    role: 'Senior Quality Engineer',
    period: 'Jun 2019 – Dec 2021',
    description: 'Focused on complex software validation for Adobe products. Built automation frameworks and optimized regression suites.',
    order: 2
  },
  {
    id: '3',
    company: 'OPKEY',
    role: 'Quality Engineer',
    period: 'Aug 2018 – May 2019',
    description: 'Manual and automated testing for cloud platforms. Contributed to early-stage test case generation logic.',
    order: 3
  }
];

export default function Experience() {
  const [items, setItems] = useState<Experience[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Experience>('experience', 'order');
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEFAULT_EXPERIENCE);
        }
      } catch (err) {
        console.warn("Experience data load failed, using fallbacks:", err);
        setItems(DEFAULT_EXPERIENCE);
      }
    }
    load();
  }, []);

  return (
    <Section id="experience" title="Career Journey" subtitle="Experience">
      <div className="relative space-y-16 lg:space-y-24 after:absolute after:inset-y-0 after:left-4 lg:after:left-1/2 after:w-px after:bg-gradient-to-b after:from-brand/50 after:via-white/5 after:to-transparent after:-translate-x-1/2">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`relative flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start lg:items-center gap-8 group`}
          >
            {/* Timeline Node */}
            <div className="absolute left-4 lg:left-1/2 -translate-x-1/2 z-10">
               <div className="w-10 h-10 rounded-full bg-[#030014] border border-brand/30 flex items-center justify-center group-hover:scale-110 group-hover:border-brand transition-all duration-500 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.15)] group-hover:shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.4)]">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></div>
               </div>
            </div>
 
            {/* Content Side */}
             <div className={`w-full lg:w-1/2 pl-12 lg:pl-0 ${idx % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
              <div className={`p-8 bg-[#050816]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] hover:border-brand/30 transition-all duration-500 flex flex-col items-start hover:bg-white/[0.04] relative overflow-hidden shadow-2xl`}>
                {/* Visual Polish: Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Accent Line */}
                <div className={`absolute top-0 ${idx % 2 === 0 ? 'right-0' : 'left-0'} w-40 h-[2px] bg-gradient-to-r ${idx % 2 === 0 ? 'from-transparent via-brand/50 to-brand' : 'from-brand via-brand/50 to-transparent'} opacity-20 group-hover:opacity-100 transition-all duration-500`}></div>
                
                <div className="flex items-center gap-3 text-brand mb-4 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                  {item.period}
                </div>
                
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-brand transition-colors duration-300">
                  {item.company}
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-brand/10 to-purple-500/10 border border-white/5 rounded-xl">
                    <Briefcase className="w-3.5 h-3.5 text-brand" />
                    <span className="text-sm font-bold text-gray-200 tracking-wide">{item.role}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {item.description.split('\n').map((line, i) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={i} className="h-2" />;
                    
                    const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
                    
                    return (
                      <div key={i} className="flex items-start gap-3 group-hover:text-gray-300 transition-colors">
                        {isBullet && (
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-brand/50 flex-shrink-0" />
                        )}
                        <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 text-left">
                          {isBullet ? trimmedLine.replace(/^[•\-*]\s*/, '') : trimmedLine}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[10px] uppercase tracking-wider font-bold text-gray-500 group-hover:border-brand/20 group-hover:text-gray-300 hover:bg-brand/10 transition-all duration-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
 
            {/* Date Indicator on other side for desktop */}
            <div className={`hidden lg:flex w-1/2 ${idx % 2 === 0 ? 'justify-start' : 'justify-end'} items-center`}>
               <span className="text-8xl font-black text-white/[0.015] select-none tracking-tighter group-hover:text-brand/[0.03] transition-colors duration-700">
                 {item.period.split(/[–-]/)[1]?.trim() || 'Current'}
               </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
