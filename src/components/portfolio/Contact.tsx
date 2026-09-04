import Section from './Section';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Linkedin, Send, Github, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addCollectionDocument, getDocument, CONTACT_DOC } from '../../services/firestoreService';
import { useLanguage } from '../../hooks/useLanguage';
import { cn } from '../../lib/utils';

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

const inquirySchema = z.object({
  name: z.string().min(2, { message: 'contact.validation_name_min' }),
  email: z.string().min(1, { message: 'contact.validation_email_req' }).email({ message: 'contact.validation_email_invalid' }),
  message: z.string().min(10, { message: 'contact.validation_msg_min' }),
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
  const { t, resolveTranslation } = useLanguage();
  
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
      setSent(true);
      reset();
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const CONTACT_ITEMS = [
    { 
      label: t('contact.label_email_info'), 
      value: info?.email || 'sankalpsmn@gmail.com', 
      icon: Mail, 
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    { 
      label: t('contact.label_phone_info'), 
      value: info?.phone || '+91 9540446448', 
      icon: Phone, 
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    { 
      label: t('contact.label_location_info'), 
      value: resolveTranslation(info, 'location') || info?.location || t('contact.loc_val'), 
      icon: MapPin, 
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    }
  ];

  return (
    <Section 
      id="contact" 
      title={t('contact.title')} 
      subtitle={t('contact.subtitle')}
      className="relative overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Contact Info Readouts */}
        <div className="lg:col-span-5 space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
          >
            <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight font-display">
              Initiate <br/>
              <span className="text-blue-500 font-serif italic font-normal">Direct Protocol</span>
            </h3>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
              {t('contact.description')}
            </p>
          </motion.div>

          <div className="space-y-3 md:space-y-4">
            {CONTACT_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-4 md:p-6 glass-card rounded-2xl md:rounded-3xl border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl transition-all group-hover:scale-110 flex-shrink-0", item.bg, item.color)}>
                    <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">
                      {item.label}
                    </div>
                    <div className="text-base md:text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {item.value}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-4 justify-center lg:justify-start pt-2">
            <a href={info?.linkedin || "https://linkedin.com/in/sankalpsuman"} target="_blank" className="p-4 md:p-5 glass-card hover:bg-blue-600 rounded-2xl transition-all group">
              <Linkedin className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-white" />
            </a>
            <a href="https://github.com/sankalpsuman" target="_blank" className="p-4 md:p-5 glass-card hover:bg-slate-800 rounded-2xl transition-all group">
              <Github className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Form: Mission Command Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7 relative"
        >
          <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 md:w-[400px] md:h-[400px] bg-blue-600/10 blur-[50px] md:blur-[100px] rounded-full pointer-events-none transform-gpu translate-z-0 will-change-transform" />
            
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 md:py-20 space-y-6 text-center"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-400 animate-pulse">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl md:text-3xl font-bold text-white">Transmission Received</h4>
                    <p className="text-slate-400 text-sm md:text-base max-w-xs mx-auto">Your inquiry has been successfully injected into the priority queue.</p>
                  </div>
                  <button onClick={() => setSent(false)} className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                    Establish New Connection
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 relative z-10">
                  <div className="space-y-5 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Subject Name</label>
                        <input 
                          {...register('name')}
                          placeholder="Identify yourself"
                          className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-white placeholder:text-slate-600 text-sm md:text-base"
                        />
                        {errors.name && <p className="text-[9px] md:text-[10px] text-red-400 ml-4 mt-1">Missing identity credentials</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Encryption Channel (Email)</label>
                        <input 
                          {...register('email')}
                          placeholder="your@intel.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-3.5 md:py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-white placeholder:text-slate-600 text-sm md:text-base"
                        />
                        {errors.email && <p className="text-[9px] md:text-[10px] text-red-400 ml-4 mt-1">Invalid routing address</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-4">Intelligence Briefing</label>
                      <textarea 
                        {...register('message')}
                        rows={5}
                        placeholder="Detail your requirements..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-5 md:px-6 py-3.5 md:py-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-white resize-none placeholder:text-slate-600 text-sm md:text-base"
                      />
                      {errors.message && <p className="text-[9px] md:text-[10px] text-red-400 ml-4 mt-1">Insufficient data depth</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative py-4 md:py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-3 overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <span className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em]">Execute Deployment</span>
                          <Send className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
          
          {/* Decorative Corner Accents */}
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-blue-500/30 rounded-tl-3xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-blue-500/30 rounded-br-3xl pointer-events-none" />
        </motion.div>
      </div>
    </Section>
  );
}
