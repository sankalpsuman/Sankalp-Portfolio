import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowUpRight, Calendar, Tag, ChevronRight } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import LazyImage from '../ui/LazyImage';

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

  useEffect(() => {
    async function load() {
      const data = await getCollection<BlogPost>('blogs', 'publishedAt');
      // Filter for published only and take latest 3
      setBlogs(data.filter(b => b.status === 'published').reverse().slice(0, 3));
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
                   <FileText className="w-3 h-3" /> QA Intelligence
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-500">Thinking Engine</span></h2>
                <p className="text-gray-500 max-w-xl">Deep dives into quality engineering, automation architecture, and AI integration in modern software testing.</p>
             </div>
             <Link to="/blog" className="flex items-center gap-2 text-white font-bold group">
                Browse Library <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                   <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 bg-white/5 border border-white/10">
                      {blog.imageUrl && (
                        <LazyImage 
                          src={blog.imageUrl} 
                          alt={blog.title} 
                          className="transition-transform duration-700 group-hover:scale-110" 
                          wrapperClassName="w-full h-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xl shadow-blue-600/20">
                            {blog.category}
                         </span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(blog.publishedAt).toLocaleDateString()}</span>
                         <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> {blog.category}</span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight group-hover:text-blue-400 transition-colors h-14 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                      <div className="pt-2">
                         <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-b border-white/20 pb-1 group-hover:border-blue-400 transition-all">
                            Read Analysis <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                         </button>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>
    </section>
  );
}
