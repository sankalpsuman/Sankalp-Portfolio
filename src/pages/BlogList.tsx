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
    <div className="bg-[#050816] min-h-screen text-white flex flex-col">
       <SEO 
         title={`${t('nav.blog')} | Sankalp Suman`} 
         description="Insights on Quality Engineering, AI-driven automation, and modern software testing strategies."
       />
       <Navbar />
       
       <header className="pt-32 pb-16 px-4 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-blue-500 font-mono text-sm uppercase tracking-widest">
                {t('blog_list.badge')}
             </motion.div>
             <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                {t('blog_list.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">{t('blog_list.title_highlight')}</span>
             </h1>
             <p className="text-gray-400 max-w-2xl text-lg">{t('blog_list.subtitle')}</p>
             
             <div className="w-full max-w-xl relative mt-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={t('blog_list.search_placeholder')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 transition-all font-medium"
                />
             </div>
          </div>
       </header>

       <main className="flex-1 max-w-7xl mx-auto px-4 py-20 w-full">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
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
                         <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                            {blog.imageUrl && (
                               <img 
                                 src={blog.imageUrl} 
                                 alt={tTitle} 
                                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                               />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                            <div className="absolute top-4 left-4">
                               <span className="px-4 py-1.5 bg-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-600/20">
                                  {resolveTranslation(blog, 'category')}
                               </span>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <span className="text-xs font-bold text-white flex items-center gap-2">
                                 {t('blog_list.read_article')} <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                         </div>

                         <div className="space-y-4 px-2">
                            <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                               <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-2xl font-bold leading-tight group-hover:text-blue-400 transition-colors">
                               {tTitle}
                            </h3>
                            <p className="text-gray-400 line-clamp-3 leading-relaxed text-sm">
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
  );
}
