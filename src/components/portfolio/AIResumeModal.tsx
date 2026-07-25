import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Download, FileText, Globe, Loader2, CheckCircle2, ChevronRight, AlertCircle, FileJson, Printer, Minimize2, Maximize2 } from 'lucide-react';
import { getDocument, HERO_DOC, ABOUT_DOC, CONTACT_DOC, getCollection } from '../../services/firestoreService';
import { useLanguage } from '../../hooks/useLanguage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Tooltip } from './Tooltip';
import { RESUME_CONFIG, RESUME_STYLES } from '../../constants/resumeStyles';

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    languages: string[];
    linkedin?: string;
    website?: string;
  };
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    bullets: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects: {
    name: string;
    description: string;
    techStack: string[];
    role: string;
    link?: string;
  }[];
  education: {
    school: string;
    degree: string;
    period: string;
  }[];
  additionalSections?: {
    title: string;
    bullets: string[];
  }[];
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
];

export const AIResumeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const resumeRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // 1. Fetch current portfolio data for context
      const [hero, about, contact, experience, projects, skills, certifications, blogs, achievements, qaMetrics, aiTools, impactStories, timeline] = (await Promise.all([
        getDocument(HERO_DOC),
        getDocument(ABOUT_DOC),
        getDocument(CONTACT_DOC),
        getCollection('experience'),
        getCollection('projects'),
        getCollection('skills'),
        getCollection('certifications'),
        getCollection('blogs'),
        getCollection('achievements'),
        getCollection('qaMetrics'),
        getCollection('aiTools'),
        getCollection('impactStories'),
        getCollection('timeline')
      ])) as any[];

      const portfolioData = {
        personalInfo: {
          ...hero,
          email: contact?.email || '',
          phone: contact?.phone || '',
          location: contact?.location || hero?.location || '',
          linkedin: contact?.linkedin || hero?.linkedinUrl || '',
          website: window.location.origin
        },
        about,
        contact,
        experience,
        projects,
        skills,
        certifications,
        blogs,
        achievements,
        qaMetrics,
        aiTools,
        impactStories,
        timeline,
        portfolioUrl: window.location.origin
      };

      // 2. Call AI Generation API
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetLanguage: selectedLang,
          portfolioData
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate resume: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedResume(data);
    } catch (err: any) {
      console.error('Resume generation error:', err);
      setError(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    try {
      await document.fonts.ready;
      
      const container = resumeRef.current;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginMm = 15;
      const contentWidthMm = pdfWidth - (2 * marginMm);
      const pxToMm = contentWidthMm / RESUME_CONFIG.WIDTH;

      // Identify blocks for capturing
      const blocks: HTMLElement[] = [];
      Array.from(container.children).forEach(child => {
        const htmlChild = child as HTMLElement;
        if (htmlChild.classList.contains('print:hidden')) return;

        // If it's a list container, we want its items as separate blocks
        const listContainer = htmlChild.querySelector('.space-y-6, .space-y-4');
        if (listContainer) {
          const title = htmlChild.querySelector('h2');
          if (title) blocks.push(title.parentElement || title);
          
          Array.from(listContainer.children).forEach(item => {
            blocks.push(item as HTMLElement);
          });
        } else {
          blocks.push(htmlChild);
        }
      });

      let currentYMm = marginMm;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        
        // Capture block at design width to preserve layout
        const canvas = await html2canvas(block, {
          scale: 4, // High resolution
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: RESUME_CONFIG.WIDTH,
          onclone: (clonedDoc) => {
            // Find the block in the cloned doc
            // Since we captured 'block', the clone will represent that element
            const clonedBlock = clonedDoc.body.firstChild as HTMLElement;
            if (clonedBlock) {
              clonedBlock.style.width = `${RESUME_CONFIG.WIDTH}px`;
              clonedBlock.style.paddingLeft = '64px';
              clonedBlock.style.paddingRight = '64px';
              clonedBlock.style.margin = '0';
              clonedBlock.style.boxSizing = 'border-box';
              
              // Ensure fonts are applied in the clone
              clonedBlock.style.fontFamily = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
              const sansElements = clonedBlock.querySelectorAll('.font-sans');
              sansElements.forEach(el => {
                (el as HTMLElement).style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
              });
            }
          }
        });

        const imgHeightMm = (canvas.height * pxToMm) / 4;

        // Check for page break
        if (currentYMm + imgHeightMm > pdfHeight - marginMm && i > 0) {
          pdf.addPage();
          currentYMm = marginMm;
        }

        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', marginMm, currentYMm, contentWidthMm, imgHeightMm, undefined, 'FAST');
        
        // Add spacing after blocks (matching mb-8, space-y-6, space-y-4)
        const isHeader = i === 0;
        const isSectionTitle = block.tagName === 'H2' || block.querySelector('h2');
        const spacingPx = isHeader ? 32 : (isSectionTitle ? 8 : 16);
        currentYMm += imgHeightMm + (spacingPx * pxToMm);
      }

      pdf.save(`Sankalp_Suman_Resume_${selectedLang.toUpperCase()}.pdf`);
    } catch (err) {
      console.error('PDF Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Tooltip content="AI Resume">
        <button
          onClick={() => setIsOpen(true)}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-xl border border-brand/20 transition-all flex items-center justify-center group shadow-lg shadow-brand/5 select-none cursor-pointer shrink-0"
          aria-label="Generate AI Resume"
          id="generate-ai-resume-btn"
        >
          <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 text-brand group-hover:text-white animate-pulse" />
        </button>
      </Tooltip>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden pointer-events-none`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isMinimized ? 0 : 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isGenerating && setIsOpen(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer pointer-events-auto"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={isMinimized ? { 
                  opacity: 1, 
                  scale: 0.8, 
                  x: 'calc(50vw - 180px)', 
                  y: 'calc(50vh - 100px)',
                  width: '320px',
                } : { 
                  opacity: 1, 
                  scale: 1, 
                  x: 0, 
                  y: 0,
                  width: '100%',
                }}
                whileHover={isMinimized ? { scale: 0.82 } : {}}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300, bounce: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMinimized) setIsMinimized(false);
                }}
                className={`relative w-full max-w-4xl max-h-[92vh] bg-[#0d122b] border border-white/20 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col z-[1000] ring-1 ring-white/10 pointer-events-auto ${isMinimized ? 'cursor-pointer' : ''}`}
              >
              {/* Header */}
              <div className={`p-5 sm:p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.03] ${isMinimized ? 'border-none h-full' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/40 to-brand/10 flex items-center justify-center text-brand shadow-lg shadow-brand/20 border border-brand/20 ${isMinimized ? 'w-10 h-10' : ''}`}>
                    <Sparkles className={isMinimized ? "w-6 h-6" : "w-7 h-7"} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">AI Resume Synthesizer</h3>
                    {!isMinimized && <p className="text-sm text-gray-400">Precision-engineered CV powered by Gemini AI</p>}
                    {isMinimized && isGenerating && (
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin text-brand" />
                        <span className="text-[10px] text-brand font-bold uppercase tracking-widest">Synthesizing...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(!isMinimized);
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title={isMinimized ? "Maximize" : "Minimize"}
                  >
                    {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                  </button>
                  {!isMinimized && (
                    <button
                      onClick={() => setIsOpen(false)}
                      disabled={isGenerating}
                      className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              {!isMinimized && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {!generatedResume ? (
                  <div className="max-w-md mx-auto space-y-8 py-8 text-center">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-brand">Select Language</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang.code)}
                            className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group ${
                              selectedLang === lang.code
                                ? 'bg-brand/20 border-brand text-white shadow-[0_0_20px_rgba(var(--brand-rgb),0.2)]'
                                : 'bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.08] hover:border-white/20'
                            }`}
                          >
                            {selectedLang === lang.code && (
                              <motion.div 
                                layoutId="active-lang"
                                className="absolute inset-0 bg-brand/5 pointer-events-none"
                              />
                            )}
                            <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{lang.flag}</span>
                            <span className="text-xs font-bold uppercase tracking-widest">{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Synthesizing Document...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span>Generate ATS Resume</span>
                        </>
                      )}
                    </button>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm text-left">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                      <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Resume Generated Successfully!</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setGeneratedResume(null)}
                          className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                        >
                          Start Over
                        </button>
                        <button
                          onClick={handleExportPDF}
                          disabled={isExporting}
                          className="px-6 py-2 bg-brand text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                        >
                          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Export PDF
                        </button>
                      </div>
                    </div>

                    {/* Resume Preview */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 overflow-x-auto">
                      <div 
                        ref={resumeRef}
                        id="resume-content"
                        className={`${RESUME_STYLES.container} ${RESUME_STYLES.pagePadding} mx-auto print:p-0`}
                        style={{ minHeight: `${RESUME_CONFIG.MIN_HEIGHT}px`, width: `${RESUME_CONFIG.WIDTH}px`, maxWidth: '100%' }}
                      >
                        {/* Header */}
                        <div className={RESUME_STYLES.header.wrapper}>
                          <h1 className={RESUME_STYLES.header.name}>{generatedResume.personalInfo.name}</h1>
                          <p className={RESUME_STYLES.header.title}>{generatedResume.personalInfo.title}</p>
                          <div className={RESUME_STYLES.header.contactRow}>
                            <span>{generatedResume.personalInfo.email}</span>
                            <span>{generatedResume.personalInfo.phone}</span>
                            <span>{generatedResume.personalInfo.location}</span>
                            {generatedResume.personalInfo.languages?.length > 0 && (
                              <span className={RESUME_STYLES.header.languageTag}>
                                • {generatedResume.personalInfo.languages.join(', ')}
                              </span>
                            )}
                          </div>
                          <div className={RESUME_STYLES.header.linksRow}>
                            {generatedResume.personalInfo.linkedin && <a href={generatedResume.personalInfo.linkedin} className={RESUME_STYLES.header.link}>LinkedIn</a>}
                            {generatedResume.personalInfo.website && <a href={generatedResume.personalInfo.website} className={RESUME_STYLES.header.link}>Portfolio</a>}
                          </div>
                        </div>

                        {/* Summary */}
                        <div className={`${RESUME_STYLES.sectionMargin} ${RESUME_STYLES.pageBreakAvoid}`}>
                          <h2 className={RESUME_STYLES.section.title}>Professional Summary</h2>
                          <p className={RESUME_STYLES.section.paragraph}>{generatedResume.personalInfo.summary}</p>
                        </div>

                        {/* Experience */}
                        <div className={RESUME_STYLES.sectionMargin}>
                          <h2 className={RESUME_STYLES.section.title}>Work Experience</h2>
                          <div className="space-y-6">
                            {generatedResume.experience.map((exp, i) => (
                              <div key={i} className={RESUME_STYLES.experience.item}>
                                <div className={RESUME_STYLES.experience.roleRow}>
                                  <span>{exp.role}</span>
                                  <span>{exp.period}</span>
                                </div>
                                <div className={RESUME_STYLES.experience.companyRow}>
                                  <span>{exp.company}</span>
                                  <span>{exp.location}</span>
                                </div>
                                <div className={RESUME_STYLES.experience.bullets}>
                                  {exp.bullets.map((bullet, j) => (
                                    <div key={j} className={RESUME_STYLES.experience.bulletItem}>
                                      <span className={RESUME_STYLES.experience.bulletDot} />
                                      <span className="flex-1">{bullet}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className={`${RESUME_STYLES.sectionMargin} ${RESUME_STYLES.pageBreakAvoid}`}>
                          <h2 className={RESUME_STYLES.section.title}>Technical Skills</h2>
                          <div className={RESUME_STYLES.skills.container}>
                            {generatedResume.skills.map((skill, i) => (
                              <div key={i} className={RESUME_STYLES.skills.item}>
                                <span className={RESUME_STYLES.skills.category}>{skill.category}: </span>
                                <span>{skill.items.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Projects */}
                        <div className={RESUME_STYLES.sectionMargin}>
                          <h2 className={RESUME_STYLES.section.title}>Key Projects</h2>
                          <div className="space-y-4">
                            {generatedResume.projects.map((proj, i) => (
                              <div key={i} className={RESUME_STYLES.projects.item}>
                                <div className={RESUME_STYLES.projects.nameRow}>
                                  <span>{proj.name}</span>
                                  {proj.link && <span className={RESUME_STYLES.projects.link}>{proj.link}</span>}
                                </div>
                                <p className={RESUME_STYLES.projects.role}>{proj.role}</p>
                                <p className={RESUME_STYLES.projects.description}>{proj.description}</p>
                                <div className={RESUME_STYLES.projects.stack}>
                                  <span className={RESUME_STYLES.projects.stackLabel}>Stack: </span>{proj.techStack.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Education */}
                        <div className={`${RESUME_STYLES.sectionMargin} ${RESUME_STYLES.pageBreakAvoid}`}>
                          <h2 className={RESUME_STYLES.section.title}>Education</h2>
                          <div className="space-y-3">
                            {generatedResume.education.map((edu, i) => (
                              <div key={i} className={RESUME_STYLES.education.item}>
                                <div>
                                  <span className={RESUME_STYLES.education.school}>{edu.school}</span>
                                  <span className={RESUME_STYLES.education.separator}>•</span>
                                  <span className={RESUME_STYLES.education.degree}>{edu.degree}</span>
                                </div>
                                <span className={RESUME_STYLES.education.period}>{edu.period}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Sections */}
                        {generatedResume.additionalSections?.map((section, i) => (
                          <div key={i} className={RESUME_STYLES.sectionMargin}>
                            <h2 className={RESUME_STYLES.section.title}>{section.title}</h2>
                            <div className={RESUME_STYLES.experience.bullets}>
                              {section.bullets.map((bullet, j) => (
                                <div key={j} className={RESUME_STYLES.experience.bulletItem}>
                                  <span className={RESUME_STYLES.experience.bulletDot} />
                                  <span className="flex-1">{bullet}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {/* Footer Diagnostics (Optional/Hidden for Print) */}
                        <div className={RESUME_STYLES.footer}>
                          Generated by Sankalp Suman's AI Resume Synthesizer • {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};
