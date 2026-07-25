import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, Tag, ArrowRight, Loader2, FileText, ChevronLeft } from 'lucide-react';
import { getCollection } from '../services/firestoreService';
import { Link } from 'react-router-dom';
import Navbar from '../components/portfolio/Navbar';
import Footer from '../components/portfolio/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../hooks/useLanguage';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
  status: 'draft' | 'published';
}

import { PageTransition } from '../components/PageTransition';

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t, resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getCollection<BlogPost>('blogs', 'publishedAt');
      setBlogs(data.filter(b => b.status === 'published').reverse());
      setLoading(false);
    }
    load();
    window.scrollTo(0, 0);
  }, []);

  const filteredBlogs = blogs.filter(b => {
    const title = (resolveTranslation(b, 'title') || b.title).toLowerCase();
    const category = (resolveTranslation(b, 'category') || b.category).toLowerCase();
    const query = search.toLowerCase();
    return title.includes(query) || category.includes(query);
  });

  return (
    <PageTransition>
      <div className="bg-[#050816] min-h-[100svh] text-white flex flex-col">
         <SEO
           title={`${t('nav.blog')} | Sankalp Suman`}
           description="Insights on Quality Engineering, AI-driven automation, and modern software testing strategies."
         />
         <Navbar />

         <header className="pt-32 pb-16 px-4 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  {t('blog_list.badge')}
               </motion.div>
               <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                  {t('blog_list.title_prefix')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-500 animate-gradient-x">{t('blog_list.title_highlight')}</span>
               </h1>
               <p className="text-gray-400 max-w-2xl text-lg">{t('blog_list.subtitle')}</p>

               <div className="w-full max-w-xl relative mt-12 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                     type="text"
                     placeholder={t('blog_list.search_placeholder')}
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 pl-16 pr-8 outline-none focus:border-blue-500/50 transition-all font-bold text-sm tracking-wide shadow-2xl focus:bg-white/[0.05]"
                  />
               </div>
            </div>
         </header>

         <main className="flex-1 max-w-7xl mx-auto px-4 py-24 w-full">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-12 h-12" /></div>
            ) : filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 {filteredBlogs.map((blog, idx) => {
                   const tTitle = resolveTranslation(blog, 'title');
                   return (
                     <motion.article
                       key={blog.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       className="group"
                     >
                        <Link to={`/blog/${blog.slug}`} className="cursor-pointer space-y-6 block">
                           <div className="relative aspect-[16/11] rounded-[3rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10 group-hover:-translate-y-2">
                              {blog.imageUrl && (
                                 <img 
                                   src={blog.imageUrl} 
                                   alt={tTitle} 
                                   className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                 />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-[#02040a]/20 to-transparent opacity-90 group-hover:opacity-40 transition-opacity"></div>
                              
                              <div className="absolute top-6 left-6">
                                 <span className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                                    {resolveTranslation(blog, 'category')}
                                 </span>
                              </div>
                              
                              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                 <span className="px-6 py-3 bg-white text-space-950 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                                    {t('blog_list.read_article')} <ArrowRight className="w-4 h-4" />
                                 </span>
                              </div>
                           </div>

                           <div className="space-y-4 px-4">
                              <div className="flex items-center gap-4 text-[10px] font-black text-blue-500/60 uppercase tracking-widest">
                                 <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                                 <span className="w-1 h-1 bg-gray-800 rounded-full" />
                                 <span className="text-purple-400/60 uppercase">{resolveTranslation(blog, 'category')}</span>
                              </div>
                              <h3 className="text-3xl font-bold leading-[1.1] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                                 {tTitle}
                              </h3>
                              <p className="text-gray-400 line-clamp-3 leading-relaxed text-sm font-medium">
                                 {resolveTranslation(blog, 'excerpt')}
                              </p>
                           </div>
                        </Link>
                     </motion.article>
                   );
                 })}
              </div>
            ) : (
              <div className="text-center py-20 space-y-4 opacity-30">
                 <FileText className="w-16 h-16 mx-auto" />
                 <p className="font-mono text-sm uppercase tracking-widest">{t('blog_list.no_articles')}</p>
              </div>
            )}
         </main>

         <Footer />
      </div>
    </PageTransition>
  );
}
