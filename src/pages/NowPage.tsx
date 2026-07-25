import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Loader2, ArrowLeft, Coffee, MapPin, Sparkles, Code2, Rocket } from 'lucide-react';
import { getDocument } from '../services/firestoreService';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import Navbar from '../components/portfolio/Navbar';
import Footer from '../components/portfolio/Footer';
import { useLanguage } from '../hooks/useLanguage';

interface NowContent {
  content: string;
  location: string;
  status: string;
  focus: string;
  lastUpdated: string;
}

const NOW_DOC = 'now/content';

import { PageTransition } from '../components/PageTransition';

export default function NowPage() {
  const [now, setNow] = useState<NowContent | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getDocument<NowContent>(NOW_DOC);
      setNow(data);
      setLoading(false);
    }
    load();
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="bg-[#050816] min-h-[100svh] text-white">
         <Navbar />
         
         <header className="pt-40 pb-20 px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>
            
            <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-center">
               <div className="space-y-4">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
                     <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-mono text-xs uppercase tracking-widest font-bold">
                        <Clock className="w-4 h-4 animate-pulse" /> {t('now.live_status')}
                     </div>
                  </motion.div>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
                     {t('now.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 italic">{t('now.title_highlight')}</span>
                  </h1>
               </div>
               
               <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                  {t('now.nownownow_prefix')}{' '}
                  <a href="https://nownownow.com/about" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                     now page
                  </a>
                  {t('now.nownownow_suffix')}
               </p>
            </div>
         </header>

         <main className="max-w-4xl mx-auto px-4 py-20 relative">
            {loading ? (
               <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
               </div>
            ) : now ? (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-16"
               >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-4 hover:border-blue-500/20 transition-all group">
                        <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 w-fit group-hover:scale-110 transition-transform"><MapPin className="w-6 h-6" /></div>
                        <h4 className="font-bold flex items-center gap-2">{t('now.location')} </h4>
                        <p className="text-gray-400 text-sm">{resolveTranslation(now, 'location') || 'Delhi NCR, India'}</p>
                     </div>
                     <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all group">
                        <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-400 w-fit group-hover:scale-110 transition-transform"><Coffee className="w-6 h-6" /></div>
                        <h4 className="font-bold flex items-center gap-2">{t('now.status')}</h4>
                        <p className="text-gray-400 text-sm">{resolveTranslation(now, 'status') || 'Open to collaboration'}</p>
                     </div>
                     <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-4 hover:border-purple-500/20 transition-all group">
                        <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-400 w-fit group-hover:scale-110 transition-transform"><Rocket className="w-6 h-6" /></div>
                        <h4 className="font-bold flex items-center gap-2">{t('now.current_focus')}</h4>
                        <p className="text-gray-400 text-sm">{resolveTranslation(now, 'focus') || 'Scaling AI-Driven QA Platforms'}</p>
                     </div>
                  </div>

                  <div className="bg-[#0b0e1a] border border-white/10 rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
                     <Sparkles className="absolute top-12 right-12 w-32 h-32 text-blue-500/[0.03] pointer-events-none" />
                     <Code2 className="absolute bottom-12 left-12 w-32 h-32 text-purple-500/[0.03] pointer-events-none" />
                     
                     <div className="prose prose-invert prose-lg md:prose-xl max-w-none prose-headings:text-white prose-headings:tracking-tight prose-p:text-gray-400 prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-blue-400 prose-code:bg-blue-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                        <ReactMarkdown>{resolveTranslation(now, 'content')}</ReactMarkdown>
                     </div>
                     
                     <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                        <div>Delhi, India</div>
                        <div>{t('now.last_updated')}: {new Date(now.lastUpdated).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                     </div>
                  </div>
                  
                  <div className="flex justify-center">
                     <Link to="/" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold group shadow-xl">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('now.back_to_experience')}
                     </Link>
                  </div>
               </motion.div>
            ) : (
               <div className="text-center py-20 opacity-30 italic">No update posted yet. Check back soon.</div>
            )}
         </main>

         <Footer />
      </div>
    </PageTransition>
  );
}
