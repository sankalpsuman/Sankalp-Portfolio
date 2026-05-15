import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone, ChevronRight, MapPin, Calendar, Award, Building2, ExternalLink } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

interface TimelineMilestone {
  id: string;
  title: string;
  company: string;
  date: string;
  description: string;
  icon: string;
  color: string;
  logoUrl?: string;
}

export default function CareerTimeline() {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCollection<TimelineMilestone>('timeline', 'order');
      setMilestones(data);
      if (data.length > 0) setActiveId(data[0].id);
    }
    load();
  }, []);

  if (milestones.length === 0) return null;

  return (
    <section id="career-journey" className="py-24 bg-[#02040a] relative overflow-hidden">
       {/* Background Text */}
       <div className="absolute top-0 right-0 text-[20rem] font-bold text-white/[0.02] leading-none select-none pointer-events-none translate-x-1/4 -translate-y-1/4">JOURNEY</div>
       
       <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
             <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-blue-500 font-mono text-sm uppercase tracking-widest mb-4">Evolution of Excellence</motion.div>
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Career Timeline</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
             {/* Timeline Steps */}
             <div className="lg:col-span-5 space-y-4">
                {milestones.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                     <button
                       onClick={() => setActiveId(item.id)}
                       className={cn(
                         "w-full text-left p-6 rounded-2xl border transition-all relative group overflow-hidden",
                         activeId === item.id 
                           ? "bg-white/5 border-white/20 shadow-xl" 
                           : "border-transparent hover:bg-white/[0.02] grayscale hover:grayscale-0"
                       )}
                     >
                        <div className="flex items-center gap-6 relative z-10">
                           <div className="flex flex-col items-center gap-2">
                             <div 
                               className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                                 activeId === item.id ? "shadow-lg" : "filter brightness-50"
                               )}
                               style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}40` }}
                             >
                                <Milestone className="w-6 h-6" style={{ color: item.color }} />
                             </div>
                             <div className="w-px h-8 bg-white/5 last:hidden"></div>
                           </div>
                           
                           <div className="flex-1">
                              <div className="text-[10px] font-mono mb-1 uppercase tracking-widest" style={{ color: item.color }}>{item.date}</div>
                              <h4 className={cn("font-bold transition-colors", activeId === item.id ? "text-white" : "text-gray-500")}>{item.title}</h4>
                              <p className="text-xs text-gray-500 font-medium">{item.company}</p>
                           </div>

                           <ChevronRight className={cn(
                             "w-5 h-5 transition-all",
                             activeId === item.id ? "text-white translate-x-0 opacity-100" : "text-gray-700 -translate-x-4 opacity-0"
                           )} />
                        </div>
                        
                        {activeId === item.id && (
                          <motion.div 
                            layoutId="timeline-bg"
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-600/[0.03] to-transparent pointer-events-none"
                          />
                        )}
                     </button>
                  </motion.div>
                ))}
             </div>

             {/* Detail Viewer */}
             <div className="lg:col-span-7 sticky top-32">
                <AnimatePresence mode="wait">
                  {activeId && (
                    <motion.div
                      key={activeId}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="bg-[#050816] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl"
                    >
                       {/* Background Logo Watermark */}
                       {milestones.find(m => m.id === activeId)?.logoUrl && (
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-[0.03] pointer-events-none grayscale invert">
                            <img src={milestones.find(m => m.id === activeId)?.logoUrl} alt="Watermark" className="w-full h-full object-contain" />
                         </div>
                       )}

                       <div className="relative z-10 space-y-8">
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                             <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                   <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                      <Building2 className="w-6 h-6 text-blue-400" />
                                   </div>
                                   <div>
                                      <h3 className="text-3xl font-bold text-white">{milestones.find(m => m.id === activeId)?.company}</h3>
                                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                         <MapPin className="w-3 h-3 text-blue-500" /> Delhi NCR, India 
                                         <span className="mx-2 opacity-20">•</span>
                                         <Calendar className="w-3 h-3 text-blue-500" /> {milestones.find(m => m.id === activeId)?.date}
                                      </div>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white">
                                   <ExternalLink className="w-5 h-5" />
                                </button>
                             </div>
                          </div>

                          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                          <div className="space-y-6">
                             <div className="space-y-2">
                                <h4 className="text-xl font-bold text-blue-400">{milestones.find(m => m.id === activeId)?.title}</h4>
                                <p className="text-gray-400 leading-relaxed text-lg">
                                   {milestones.find(m => m.id === activeId)?.description}
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-gray-300">
                                {[
                                  "Spearheaded end-to-end QA strategy",
                                  "Implemented robust automation framework",
                                  "Optimized CI/CD release cycles",
                                  "Managed stakeholders & test reporting"
                                ].map((bullet, i) => (
                                  <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-colors group/bullet">
                                     <div className="mt-1">
                                        <Award className="w-4 h-4 text-blue-500 group-hover/bullet:scale-110 transition-transform" />
                                     </div>
                                     <span className="text-sm font-medium leading-normal">{bullet}</span>
                                  </div>
                                ))}
                             </div>
                          </div>
                          
                          <div className="pt-8 flex justify-center lg:justify-start">
                             <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                                <Award className="w-4 h-4" /> Professional Recognition
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
       </div>
    </section>
  );
}
