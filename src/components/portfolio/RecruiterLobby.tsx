import { useState, useEffect } from 'react';
import Section from './Section';
import { getCollection, getDocument, updateCollectionDocument } from '../../services/firestoreService';
import { FileText, CalendarCheck, CheckCircle2, XCircle, Clock, Calendar, Briefcase, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Resume {
  id: string;
  title: string;
  description?: string;
  category: string;
  version: string;
  pdfUrl?: string;
  previewUrl?: string;
  isFeatured: boolean;
  downloadsCount: number;
}

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
  const [resumes, setResumes] = useState<Resume[]>([]);
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

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const resumeList = await getCollection<Resume>('resumes', 'version');
        setResumes(resumeList);
      } catch (e) {
        console.warn('Fallback resumes listing used:', e);
      }

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

  const handleDownload = async (resume: Resume) => {
    setDownloadingId(resume.id);
    try {
      const updatedCount = (resume.downloadsCount || 0) + 1;
      // Increment download counter securely
      await updateCollectionDocument('resumes', resume.id, {
        downloadsCount: updatedCount
      });
      
      // Update local state increment
      setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, downloadsCount: updatedCount } : r));
      
      // Open the URL
      if (resume.pdfUrl) {
        window.open(resume.pdfUrl, '_blank');
      }
    } catch (e) {
      console.error('Download update error, fallback link opened:', e);
      if (resume.pdfUrl) {
        window.open(resume.pdfUrl, '_blank');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Section id="recruiter-lobby" title="Recruiter Lobby" subtitle="Dynamic credentials, availability badges, and interview scheduler">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Availability & Booking */}
        <div className="lg:col-span-5 space-y-6">
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
        </div>

        {/* Right Side: Resume Center List */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4 h-auto self-stretch flex flex-col">
          <div className="pb-2 border-b border-white/5">
            <h4 className="text-sm uppercase font-mono tracking-wider font-bold text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Resume Center: Active Document Assets
            </h4>
            <p className="text-xs text-gray-500 mt-1">Select and track-download your preferred format or approved resume version below.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1 flex-1">
            {resumes.map((resume, i) => (
              <div 
                key={resume.id || i}
                className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-brand/30 transition-all rounded-xl flex items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-all flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-brand transition-all flex items-center gap-2">
                      {resume.title}
                      {resume.isFeatured && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 font-bold tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 rounded">
                          Featured
                        </span>
                      )}
                    </h5>
                    {resume.description && (
                      <p className="text-xs text-gray-400 leading-relaxed mt-1">{resume.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500 font-mono">
                      <span>Ver: {resume.version}</span>
                      <span>•</span>
                      <span>Format: {resume.category}</span>
                      <span>•</span>
                      <span>Downloads: {resume.downloadsCount ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {resume.previewUrl && (
                    <a
                      href={resume.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-white/5 hover:bg-white/15 hover:text-white rounded-lg text-gray-400 transition-colors text-xs"
                      title="Preview Online Document"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {resume.pdfUrl && (
                    <button
                      onClick={() => handleDownload(resume)}
                      disabled={downloadingId === resume.id}
                      className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-300 transition-all rounded-lg text-xs font-semibold"
                    >
                      {downloadingId === resume.id ? 'Tracking...' : 'Download'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {resumes.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-white/5 rounded-xl">
                📄 No active resume documents published in the Resume Center yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
