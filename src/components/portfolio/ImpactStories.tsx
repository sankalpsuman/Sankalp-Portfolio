import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowRight, Zap, TrendingUp, ShieldCheck, Box, Layers, Globe } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

interface ImpactStory {
  id: string;
  title: string;
  problem: string;
  solution: string;
  impact: string;
  tools: string[];
  metrics: string[];
  order: number;
}

export default function ImpactStories() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCollection<ImpactStory>('impactStories', 'order');
      setStories(data);
    }
    load();
  }, []);

  if (stories.length === 0) return null;

  return (
    <section id="impact-stories" className="py-24 bg-[#050816] relative overflow-hidden">
       {/* Decorative Elements */}
       <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full"></div>
       <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full"></div>

       <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
                   <Target className="w-3 h-3" /> Case Studies
                </div>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Solving <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Complex Puzzles</span></h2>
                <p className="text-gray-500 max-w-xl text-lg">Detailed narratives of how I bridged business goals with technical excellence through strategic QA intervention.</p>
             </div>
             <div>
                <motion.button 
                  whileHover={{ x: 5 }}
                  className="group flex items-center gap-3 text-white font-bold py-4 px-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                   Explore Full Archive 
                   <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center -mr-2 group-hover:scale-110 transition-transform">
                      <ArrowRight className="w-4 h-4" />
                   </div>
                </motion.button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {stories.map((story, idx) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredId(story.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative"
                >
                   <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 scale-95"></div>
                   
                   <div className="h-full bg-[#0b0e1a] border border-white/5 rounded-[2.5rem] p-8 space-y-8 flex flex-col transition-all duration-500 group-hover:border-emerald-500/30 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="flex items-center justify-between">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Box className="w-7 h-7 text-emerald-400 group-hover:rotate-12 transition-transform" />
                         </div>
                         <div className="flex gap-1.5">
                            {[1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10"></div>)}
                         </div>
                      </div>

                      <div className="space-y-4 flex-1">
                         <h4 className="text-2xl font-bold leading-tight group-hover:text-emerald-400 transition-colors">{story.title}</h4>
                         <div className="flex flex-wrap gap-2">
                            {story.metrics?.slice(0, 2).map((m, i) => (
                              <span key={i} className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/10">
                                {m}
                              </span>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-white/5">
                         <div className="space-y-2">
                            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-1">The Pivot</div>
                            <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                               {story.impact}
                            </p>
                         </div>
                         
                         <button className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest group/btn">
                            Read Deep Dive 
                            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                         </button>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>

          <div className="mt-20 p-12 rounded-[3.5rem] bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-white/5 flex flex-col items-center text-center gap-8 relative overflow-hidden">
             <Globe className="absolute -top-12 -right-12 w-64 h-64 text-blue-500/5" />
             <div className="max-w-2xl space-y-4">
                <h3 className="text-3xl font-bold">Have a <span className="text-blue-500">Quality Challenge</span>?</h3>
                <p className="text-gray-400">Let's discuss how data-driven QA can transform your deployment cycles and software reliability.</p>
             </div>
             <button className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                Book a Strategy Session
             </button>
          </div>
       </div>
    </section>
  );
}
