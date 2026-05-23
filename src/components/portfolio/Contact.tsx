import Section from './Section';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Linkedin, Send, Github, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCollectionDocument, getDocument, CONTACT_DOC } from '../../services/firestoreService';

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

const inquirySchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().min(1, { message: 'Email address is required.' }).email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

interface InquiryForm {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState<ContactInfo | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema)
  });

  useEffect(() => {
    async function load() {
      const data = await getDocument<ContactInfo>(CONTACT_DOC);
      if (data) setInfo(data);
    }
    load();
  }, []);

  const onSubmit = async (data: InquiryForm) => {
    setLoading(true);
    try {
      await addCollectionDocument('messages', {
        ...data,
        createdAt: new Date().toISOString()
      });

      // Dispatch real-time portal query notification email (via SMTP)
      try {
        const response = await fetch('/api/contact/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('[SMTP EMAIL DISPATCH FAILURE DETAILS]:', result.error || 'Server error, check Vercel Function logs.');
        } else {
          console.log('[SMTP EMAIL DISPATCH SUCCESS]: Email successfully dispatched!');
        }
      } catch (e) {
        console.error('[SMTP EMAIL NETWORK ERROR]:', e);
      }

      setSent(true);
      reset();
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section id="contact" title="Start a Conversation" subtitle="Contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white">Let’s build something <span className="text-blue-400">Extraordinary.</span></h3>
            <p className="text-gray-400 text-lg">
              Whether you’re looking to transform your QA processes with AI or need a seasoned lead for your next enterprise project, I’m only a message away.
            </p>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-6 p-6 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 transition-transform group-hover:scale-110">
                   <Mail className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Email</div>
                   <a href={`mailto:${info?.email || 'sankalpsmn@gmail.com'}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors">{info?.email || 'sankalpsmn@gmail.com'}</a>
                </div>
             </div>

             <div className="flex items-center gap-6 p-6 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                <div className="p-4 rounded-xl bg-purple-500/10 text-purple-400 transition-transform group-hover:scale-110">
                   <Phone className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Phone</div>
                   <a href={`tel:${info?.phone || '+919540446448'}`} className="text-lg font-bold text-white hover:text-purple-400 transition-colors">{info?.phone || '+91 9540446448'}</a>
                </div>
             </div>

             <div className="flex items-center gap-6 p-6 bg-white/2 border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all">
                <div className="p-4 rounded-xl bg-cyan-500/10 text-cyan-400 transition-transform group-hover:scale-110">
                   <MapPin className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">Location</div>
                   <div className="text-lg font-bold text-white">{info?.location || 'Delhi NCR, India'}</div>
                </div>
             </div>
          </div>

          <div className="flex gap-4">
             <a href={info?.linkedin || "https://linkedin.com/in/sankalpsuman"} target="_blank" className="p-4 bg-white/5 hover:bg-blue-600 rounded-xl border border-white/10 transition-all"><Linkedin className="w-6 h-6" /></a>
             <a href="#" className="p-4 bg-white/5 hover:bg-gray-800 rounded-xl border border-white/10 transition-all"><Github className="w-6 h-6" /></a>
          </div>
        </div>

        {/* Form */}
        <motion.div
           initial={{ opacity: 0, x: 30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="bg-white/2 border border-white/5 rounded-[40px] p-8 lg:p-12 relative overflow-hidden flex flex-col justify-center min-h-[460px]"
        >
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full text-blue-500"></div>
           
           <AnimatePresence mode="wait">
             {sent ? (
               <motion.div
                 key="success"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
                 className="space-y-6 text-center relative z-10 py-10 flex flex-col items-center justify-center"
               >
                 <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-green-500/10">
                   <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <div className="space-y-2">
                   <h4 className="text-2xl font-bold text-white font-display">Transmission Complete!</h4>
                   <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                     Thanks for reaching out! Your message was transmitted successfully. Sankalp will reply to your inbox within the next 24 hours.
                   </p>
                 </div>
                 <button
                   onClick={() => setSent(false)}
                   className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all outline-none"
                 >
                   Send Another Message
                 </button>
               </motion.div>
             ) : (
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-1">Your Name</label>
                           <input 
                             {...register('name')} 
                             className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:border-red-500/50 focus:ring-2 ${errors.name ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-red-500/10 focus:ring-red-500/10' : 'border-white/10 focus:border-blue-500/80 focus:ring-blue-500/15'} transition-all outline-none text-white`} 
                             placeholder="John Doe" 
                           />
                            <AnimatePresence>
                               {errors.name && (
                                  <motion.div
                                     id="contact-name-error"
                                     initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                     animate={{ opacity: 1, y: 0, scale: 1 }}
                                     exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                     className="text-red-400 text-xs font-medium tracking-wide mt-1.5 pl-3 pr-4 py-1.5 flex items-center gap-2 bg-red-950/30 border border-red-500/20 rounded-xl w-fit"
                                  >
                                     <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                                     <span>{errors.name.message}</span>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                           <input 
                             {...register('email')} 
                             className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:border-red-500/50 focus:ring-2 ${errors.email ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-red-500/10 focus:ring-red-500/10' : 'border-white/10 focus:border-blue-500/80 focus:ring-blue-500/15'} transition-all outline-none text-white`} 
                             placeholder="john@company.com" 
                           />
                            <AnimatePresence>
                               {errors.email && (
                                  <motion.div
                                     id="contact-email-error"
                                     initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                     animate={{ opacity: 1, y: 0, scale: 1 }}
                                     exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                     className="text-red-400 text-xs font-medium tracking-wide mt-1.5 pl-3 pr-4 py-1.5 flex items-center gap-2 bg-red-950/30 border border-red-500/20 rounded-xl w-fit"
                                  >
                                     <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                                     <span>{errors.email.message}</span>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase tracking-widest ml-1">Message</label>
                        <textarea 
                          rows={5} 
                          {...register('message')} 
                          className={`w-full bg-white/5 border rounded-2xl px-6 py-4 focus:border-red-500/50 focus:ring-2 ${errors.message ? 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-red-500/10 focus:ring-red-500/10' : 'border-white/10 focus:border-blue-500/80 focus:ring-blue-500/15'} transition-all outline-none text-white resize-none`} 
                          placeholder="Tell me about your project..." 
                        />
                         <AnimatePresence>
                            {errors.message && (
                               <motion.div
                                  id="contact-message-error"
                                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                                  className="text-red-400 text-xs font-medium tracking-wide mt-1.5 pl-3 pr-4 py-1.5 flex items-center gap-2 bg-red-950/30 border border-red-500/20 rounded-xl w-fit"
                               >
                                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                                  <span>{errors.message.message}</span>
                               </motion.div>
                            )}
                         </AnimatePresence>
                     </div>
                  </div>

                  <button
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 overflow-hidden group relative"
                  >
                     <AnimatePresence mode="wait">
                        {loading ? (
                           <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} key="loading">
                              <Loader2 className="w-6 h-6 animate-spin" />
                           </motion.div>
                        ) : (
                           <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }} key="idle" className="flex items-center gap-2 text-sm uppercase tracking-wider font-semibold">
                              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              <span>Transmit Message</span>
                           </motion.div>
                        )}
                     </AnimatePresence>
                     
                     {/* Shiny Overlay */}
                     <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[150%] transition-all duration-1000 pointer-events-none skew-x-[-20deg]"></div>
                  </button>
               </form>
             )}
           </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
}
