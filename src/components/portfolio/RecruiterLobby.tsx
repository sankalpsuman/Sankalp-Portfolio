import { useState, useEffect } from 'react';
import Section from './Section';
import { getCollection, getDocument, updateCollectionDocument } from '../../services/firestoreService';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { AIResumeModal } from './AIResumeModal';
import { cn } from '../../lib/utils';

interface AvailabilityData {
  openToWork: boolean;
  globalOpportunities: boolean;
  openAcrossIndia: boolean;
  remoteFriendly: boolean;
  hybrid: boolean;
  onsite: boolean;
  relocationAvailable: boolean;
  contractConsulting: boolean;
  fullTimeRoles: boolean;
  note?: string;
  lastUpdated?: string;
}

interface BookMeetingData {
  calendlyUrl: string;
  googleCalendarUrl?: string;
  ctaTitle: string;
  ctaDescription: string;
}

export default function RecruiterLobby() {
  const [availability, setAvailability] = useState<AvailabilityData>({
    openToWork: true,
    globalOpportunities: true,
    openAcrossIndia: true,
    remoteFriendly: true,
    hybrid: true,
    onsite: true,
    relocationAvailable: true,
    contractConsulting: true,
    fullTimeRoles: true,
    note: 'Actively exploring leadership roles in QA, Test Automation, and AI-driven Quality Engineering.',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [heroData, setHeroData] = useState<any>(null);
  const [meeting, setMeeting] = useState<BookMeetingData>({
    calendlyUrl: 'https://calendly.com/your-profile',
    ctaTitle: 'Schedule a 15-Minute Sync with Me',
    ctaDescription: 'Find a time that suits you on my calendar to discuss potential contracts, consulting, or interview loops.'
  });

  useEffect(() => {
    async function load() {
      try {
        const avail = await getDocument<any>('settings/availability');
        if (avail) {
          // Map old fields to new ones if they exist, or use defaults
          setAvailability({
            openToWork: avail.openToWork ?? true,
            globalOpportunities: avail.globalOpportunities ?? true,
            openAcrossIndia: avail.openAcrossIndia ?? true,
            remoteFriendly: avail.remoteFriendly ?? avail.openToRemote ?? true,
            hybrid: avail.hybrid ?? true,
            onsite: avail.onsite ?? true,
            relocationAvailable: avail.relocationAvailable ?? avail.openToUSA ?? true,
            contractConsulting: avail.contractConsulting ?? avail.openToContract ?? true,
            fullTimeRoles: avail.fullTimeRoles ?? true,
            note: avail.note || 'Actively exploring leadership roles in QA, Test Automation, and AI-driven Quality Engineering.',
            lastUpdated: avail.lastUpdated
          });
        }
      } catch (e) {
        console.warn('Fallback availability data used.');
      }

      try {
        const meet = await getDocument<BookMeetingData>('settings/bookMeeting');
        if (meet) setMeeting(meet);
      } catch (e) {
        console.warn('Fallback booking data used.');
      }

      try {
        const hero = await getDocument<any>('hero/content');
        if (hero) setHeroData(hero);
      } catch (e) {
        console.warn('Fallback hero data used.');
      }
    }
    load();
  }, []);

  const badges = [
    { label: 'Global Opportunities', active: availability.globalOpportunities },
    { label: 'Open Across India', active: availability.openAcrossIndia },
    { label: 'Remote Friendly', active: availability.remoteFriendly },
    { label: 'Hybrid', active: availability.hybrid },
    { label: 'Onsite', active: availability.onsite },
    { label: 'Relocation Available', active: availability.relocationAvailable },
    { label: 'Contract / Consulting', active: availability.contractConsulting },
    { label: 'Full-Time Roles', active: availability.fullTimeRoles }
  ];

  return (
    <Section id="recruiter-lobby" title="Recruiter Hub" subtitle="Dynamic credentials, global availability, and professional synchronizer">
      <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-4 sm:px-6">
        
        {/* Availability & Booking */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Availability Block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
            
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h4 className="text-[11px] md:text-xs uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Live Availability
              </h4>
              {availability.openToWork ? (
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> 
                  Active
                </span>
              ) : (
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Booked
                </span>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed font-serif italic">
                "I am a specialized Quality Engineering leader actively exploring opportunities in <strong>QA Strategy, Test Automation Architecture, AI-Powered Testing,</strong> and <strong>Test Leadership</strong> worldwide. Committed to delivering mission-critical stability through agentic testing frameworks."
              </p>
              
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      badge.active 
                        ? 'bg-blue-500/5 border-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.05)]' 
                        : 'bg-white/[0.01] border-white/5 text-slate-600 opacity-50'
                    )}
                  >
                    {badge.active ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                    )}
                    {badge.label}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-[9px] font-mono uppercase tracking-widest text-slate-600">
              <span>Status Verifier: Active</span>
              <span>Updated: {availability.lastUpdated || '2024-Q3'}</span>
            </div>
          </motion.div>

          {/* Booking & Credentials Hub */}
          <div className="space-y-6">
            {/* Book a Meeting Block */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full" />
              
              <h4 className="text-[11px] md:text-xs uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                Interview Synchronizer
              </h4>
              
              <div className="space-y-2">
                <h5 className="text-lg font-bold text-white tracking-tight">{meeting.ctaTitle}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{meeting.ctaDescription}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {meeting.calendlyUrl && (
                  <a
                    href={meeting.calendlyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex justify-center items-center gap-3 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Book Session
                  </a>
                )}
              </div>
            </motion.div>

            {/* Resume Download */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] border border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6"
            >
              <h4 className="text-[11px] md:text-xs uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Professional Credentials
              </h4>

              <div className="grid grid-cols-1 gap-4">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <div>
                          <span className="block text-sm font-bold text-white tracking-tight">Standard ATS Resume</span>
                          <span className="text-[10px] text-slate-500 font-mono">PDF • 142KB</span>
                       </div>
                    </div>
                    <a 
                      href={heroData?.resumeUrl || "/resume.pdf"}
                      download="Sankalp_Suman_Resume.pdf"
                      className="px-4 py-2 bg-white/5 hover:bg-white text-slate-400 hover:text-slate-900 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Download
                    </a>
                 </div>

                 <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 flex items-center justify-between group hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-5 h-5" />
                       </div>
                       <div>
                          <span className="block text-sm font-bold text-white tracking-tight">AI Generated CV</span>
                          <span className="text-[10px] text-slate-500 font-mono">Dynamic • Live</span>
                       </div>
                    </div>
                    <div className="[&>button]:px-4 [&>button]:py-2 [&>button]:bg-purple-600 [&>button]:hover:bg-purple-700 [&>button]:text-white [&>button]:rounded-xl [&>button]:text-[9px] [&>button]:font-black [&>button]:uppercase [&>button]:tracking-widest">
                      <AIResumeModal />
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}
