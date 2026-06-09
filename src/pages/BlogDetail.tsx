import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Calendar, Tag, Share2, ArrowLeft, Loader2, Bookmark, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCollection, addCollectionDocument } from '../services/firestoreService';
import { z } from 'zod';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/portfolio/Navbar';
import Footer from '../components/portfolio/Footer';
import SEO from '../components/SEO';
import { useLanguage } from '../hooks/useLanguage';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  imageUrl: string;
}

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const [subEmail, setSubEmail] = useState('');
  const [subError, setSubError] = useState('');
  const [submitting, setSubSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { t, resolveTranslation } = useLanguage();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError('');
    
    const result = z.string()
      .min(1, { message: t('contact.email_required') || 'Email address is required.' })
      .email({ message: t('contact.email_invalid') || 'Please enter a valid email address.' })
      .safeParse(subEmail);

    if (!result.success) {
      setSubError(result.error.issues[0]?.message || 'Please enter a valid email address.');
      return;
    }

    setSubSubmitting(true);
    try {
      await addCollectionDocument('subscribers', {
        email: subEmail,
        subscribedAt: new Date().toISOString()
      });
      setSubscribed(true);
      setSubEmail('');
    } catch (error) {
      setSubError(t('blog_detail.sub_failed') || 'Failed to subscribe. Please try again later.');
    } finally {
      setSubSubmitting(false);
    }
  };

  useEffect(() => {
    async function load() {
      const data = await getCollection<BlogPost>('blogs');
      const found = data.find(b => b.slug === slug);
      if (found) {
        setBlog(found);
      } else {
        navigate('/blog');
      }
      setLoading(false);
    }
    load();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!blog) return null;

  const tTitle = resolveTranslation(blog, 'title');
  const tContent = resolveTranslation(blog, 'content');
  const tExcerpt = resolveTranslation(blog, 'excerpt');
  const tCategory = resolveTranslation(blog, 'category');

  return (
    <div className="bg-[#050816] min-h-screen text-white">
       <SEO 
         title={tTitle}
         description={tExcerpt}
         image={blog.imageUrl}
         url={window.location.href}
         type="article"
       />
       <Navbar />

       <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
             <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-12 text-sm font-medium group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                   <ChevronLeft className="w-4 h-4" />
                </div>
                {t('blog_detail.back_to_archive')}
             </Link>

             <article className="space-y-12">
                <header className="space-y-8">
                   <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                         <span className="px-3 py-1 bg-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">{tCategory}</span>
                         <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 border border-white/5">
                            <Clock className="w-3 h-3" /> {t('blog_detail.read_time')}
                         </span>
                      </div>
                      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]">{tTitle}</h1>
                      <div className="flex items-center gap-6 text-gray-500 text-sm border-b border-white/5 pb-8 font-medium">
                         <div className="flex items-center gap-2">
                            <img src="https://ui-avatars.com/api/?name=Sankalp+Suman&background=2563eb&color=fff" className="w-8 h-8 rounded-full" alt="Author" />
                            <span>Sankalp Suman</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Calendar className="w-4 h-4" />
                           {new Date(blog.publishedAt).toLocaleDateString()}
                         </div>
                      </div>
                   </div>
                   
                   {blog.imageUrl && (
                      <div className="aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative group">
                        <img src={blog.imageUrl} alt={tTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/40 to-transparent"></div>
                      </div>
                   )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                   <div className="lg:col-span-8">
                      <div className="markdown-body max-w-none">
                         <ReactMarkdown>{tContent}</ReactMarkdown>
                      </div>

                      <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 space-y-6">
                         <h3 className="text-2xl font-bold">{t('blog_detail.newsletter_title')}</h3>
                         <p className="text-gray-400">{t('blog_detail.newsletter_subtitle')}</p>
                         
                         <AnimatePresence mode="wait">
                            {subscribed ? (
                               <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-3 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 font-medium"
                               >
                                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                  <div>
                                     <p className="font-bold text-white">{t('blog_detail.sub_success_title')}</p>
                                     <p className="text-sm text-gray-400 mt-0.5">{t('blog_detail.sub_success_desc')}</p>
                                  </div>
                               </motion.div>
                            ) : (
                               <form onSubmit={handleSubscribe} className="space-y-3" id="newsletter-subscription-form">
                                  <div className="flex flex-col sm:flex-row gap-4">
                                     <div className="flex-1">
                                        <input 
                                           id="newsletter-email-input"
                                           type="text" 
                                           value={subEmail}
                                           onChange={(e) => {
                                              setSubEmail(e.target.value);
                                              if (subError) setSubError('');
                                           }}
                                           placeholder={t('contact.email_placeholder')} 
                                           className={`w-full bg-[#02040a] border rounded-2xl px-6 py-4 outline-none focus:border-blue-500 transition-all font-medium text-white ${subError ? 'border-red-500/55' : 'border-white/10'}`}
                                        />
                                     </div>
                                     <button 
                                        id="newsletter-subscribe-button"
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                                     >
                                        {submitting ? (
                                           <>
                                              <Loader2 className="w-[#14px] h-[#14px] animate-spin" />
                                              {t('blog_detail.subscribing_btn')}
                                           </>
                                        ) : t('blog_detail.subscribe_btn')}
                                     </button>
                                  </div>
                                  <AnimatePresence>
                                     {subError && (
                                        <motion.p
                                           id="newsletter-email-error"
                                           initial={{ opacity: 0, y: -5 }}
                                           animate={{ opacity: 1, y: 0 }}
                                           exit={{ opacity: 0, y: -5 }}
                                           className="text-red-400 text-xs font-mono tracking-wide mt-1 pl-1 flex items-center gap-1.5"
                                        >
                                           <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                           {subError}
                                        </motion.p>
                                     )}
                                  </AnimatePresence>
                               </form>
                            )}
                         </AnimatePresence>
                      </div>
                   </div>

                   <aside className="lg:col-span-4 space-y-12">
                      <div className="sticky top-32 space-y-8">
                         <div className="p-8 rounded-[2rem] bg-white/2 border border-white/5 space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                               <Bookmark className="w-4 h-4" /> {t('blog_detail.share_article')}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                               <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2 group">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Share2 className="w-5 h-5 text-white" /></div>
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-white transition-colors">{t('blog_detail.copy_link')}</span>
                                </button>
                               <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-2 group">
                                  <div className="w-10 h-10 rounded-full bg-[#1da1f2] flex items-center justify-center group-hover:scale-110 transition-transform"><Tag className="w-5 h-5 text-white" /></div>
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-white transition-colors">{t('blog_detail.twitter')}</span>
                                </button>
                            </div>
                         </div>
                      </div>
                   </aside>
                </div>
             </article>
          </div>
       </main>

       <Footer />
    </div>
  );
}
