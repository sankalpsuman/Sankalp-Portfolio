import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowUpRight, Calendar, Tag, ChevronRight } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import LazyImage from '../ui/LazyImage';
import { useLanguage } from '../../hooks/useLanguage';

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

export default function BlogPreview() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const { t, resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      const data = await getCollection<BlogPost>('blogs', 'publishedAt', 6);
      const published = data.filter(b => b.status === 'published').reverse().slice(0, 3);
      setBlogs(published);
    }
    load();
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section id="blog" className="py-24 bg-[#050816] relative">
       <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
                   <FileText className="w-3 h-3" /> {t('blog.badge')}
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{t('blog.title_prefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-500 animate-gradient-x">{t('blog.title_highlight')}</span></h2>
                <p className="text-gray-400 max-w-xl font-medium">{t('blog.subtitle')}</p>
             </div>
             <Link to="/blog" className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-bold uppercase tracking-widest text-xs group">
                {t('blog.browse_library')} <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {blogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                   <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 bg-white/5 border border-white/10 shadow-2xl group-hover:border-blue-500/50 transition-colors duration-500">
                      {blog.imageUrl && (
                        <LazyImage 
                          src={blog.imageUrl} 
                          alt={resolveTranslation(blog, 'title')} 
                          className="transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" 
                          wrapperClassName="w-full h-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-4 left-4">
                         <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20">
                            {resolveTranslation(blog, 'category')}
                         </span>
                      </div>
                   </div>

                   <div className="space-y-4 px-2">
                      <div className="flex items-center gap-4 text-[10px] font-black text-blue-500/60 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                         <span className="w-1 h-1 bg-gray-800 rounded-full" />
                         <span className="text-purple-400/60">{resolveTranslation(blog, 'category')}</span>
                      </div>
                      <h3 className="text-2xl font-bold leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 h-16 line-clamp-2">
                        {resolveTranslation(blog, 'title')}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium">
                        {resolveTranslation(blog, 'excerpt')}
                      </p>
                      <div className="pt-2">
                         <Link to={`/blog/${blog.slug}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all">
                            <span className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-blue-500 transition-all" />
                            {t('blog.read_analysis')}
                         </Link>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
}
