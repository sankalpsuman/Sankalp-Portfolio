import { useState, useEffect } from 'react';
import Section from './Section';
import { getCollection, getDocument, updateCollectionDocument } from '../../services/firestoreService';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Calendar, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { AIResumeModal } from './AIResumeModal';

interface AvailabilityData {
  openToWork: boolean;
  openToRemote: boolean;
  openToGermany: boolean;
  openToUSA: boolean;
  openToContract: boolean;
  openToFreelance: boolean;
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
    openToRemote: true,
    openToGermany: true,
    openToUSA: false,
    openToContract: true,
    openToFreelance: true,
    note: 'Searching for QA Automation Lead roles.',
    lastUpdated: new Date().toISOString().split('T')[0]
  });
  const [meeting, setMeeting] = useState<BookMeetingData>({
    calendlyUrl: 'https://calendly.com/your-profile',
    ctaTitle: 'Schedule a 15-Minute Sync with Me',
    ctaDescription: 'Find a time that suits you on my calendar to discuss potential contracts, consulting, or interview loops.'
  });

  useEffect(() => {
    async function load() {
      try {
        const avail = await getDocument<AvailabilityData>('settings/availability');
        if (avail) setAvailability(avail);
      } catch (e) {
        console.warn('Fallback availability data used.');
      }

      try {
        const meet = await getDocument<BookMeetingData>('settings/bookMeeting');
        if (meet) setMeeting(meet);
      } catch (e) {
        console.warn('Fallback booking data used.');
      }
    }
    load();
  }, []);

  return (
    <Section id="recruiter-lobby" title="Recruiter Lobby" subtitle="Dynamic credentials, availability badges, and interview scheduler">
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        
        {/* Availability & Booking */}
        <div className="w-full space-y-6">
          {/* Availability Block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="text-sm uppercase font-mono tracking-wider font-bold text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand" />
                Live Availability Status
              </h4>
              {availability.openToWork ? (
                <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" /> Actively Open
                </span>
              ) : (
                <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                  Fully Booked
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Work Onsite Germany', active: availability.openToGermany },
                { label: 'USA Relocation', active: availability.openToUSA },
                { label: 'Fully Remote', active: availability.openToRemote },
                { label: 'Contract Gigs', active: availability.openToContract },
                { label: 'Freelance Consulting', active: availability.openToFreelance }
              ].map((flag, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-xs ${
                    flag.active 
                      ? 'bg-green-500/5 border-green-500/10 text-green-300' 
                      : 'bg-white/[0.01] border-white/5 text-gray-500'
                  }`}
                >
                  {flag.active ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  )}
                  <span>{flag.label}</span>
                </div>
              ))}
            </div>

            {availability.note && (
              <p className="text-xs text-gray-400 bg-white/5 p-3 rounded-xl italic leading-relaxed">
                "{availability.note}"
              </p>
            )}

            <div className="text-[10px] text-gray-600 font-mono text-right">
              Last status ping: {availability.lastUpdated || 'Today'}
            </div>
          </motion.div>

          {/* Book a Meeting Block */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4"
          >
            <h4 className="text-sm uppercase font-mono tracking-wider font-bold text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Easy Schedule Synchronizer
            </h4>
            
            <div className="space-y-1.5">
              <h5 className="text-base font-bold text-white">{meeting.ctaTitle}</h5>
              <p className="text-xs text-gray-400 leading-relaxed">{meeting.ctaDescription}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {meeting.calendlyUrl && (
                <a
                  href={meeting.calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/80 text-white rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-[1.02]"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Calendly Scheduler
                </a>
              )}
              {meeting.googleCalendarUrl && (
                <a
                  href={meeting.googleCalendarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-lg transition-all hover:scale-[1.02]"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Interview Calendar
                </a>
              )}
            </div>
          </motion.div>

          {/* Credentials Hub */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-6"
          >
            <h4 className="text-sm uppercase font-mono tracking-wider font-bold text-gray-400 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              Credentials Management
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                        <CalendarCheck className="w-5 h-5" />
                     </div>
                     <span className="text-sm font-bold text-white">ATS Document</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                     Standard high-performance resume optimized for recruiter screening systems.
                  </p>
                  <a 
                    href="/resume.pdf" // This should ideally be dynamic from settings if available
                    download="Sankalp_Suman_Resume.pdf"
                    className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Download Protocol
                  </a>
               </div>

               <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 space-y-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <Sparkles className="w-5 h-5" />
                     </div>
                     <span className="text-sm font-bold text-white">AI Synthesizer</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                     Generate a real-time, context-aware resume in multiple languages using Gemini AI.
                  </p>
                  <AIResumeModal />
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
