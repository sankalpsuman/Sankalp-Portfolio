import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Printer, 
  Download, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  Briefcase, 
  FolderGit2, 
  Wrench, 
  GraduationCap, 
  Award, 
  Quote, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { getDocument, getCollection, HERO_DOC, ABOUT_DOC, SETTINGS_DOC, CONTACT_DOC, NOW_DOC } from '../../services/firestoreService';
import { useLanguage } from '../../hooks/useLanguage';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

export const AIResumeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [resumeData, setResumeData] = useState<any>(null);
  const { language, t } = useLanguage();

  // Mapping browser language code to target friendly language name
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'hi': return 'Hindi';
      case 'fr': return 'French';
      case 'de': return 'German';
      default: return 'English';
    }
  };

  const currentLanguageName = getLanguageName(language);

  // Fetch all portfolio data and generate CV using Gemini
  const handleGenerateResume = async () => {
    try {
      setLoading(true);
      setIsOpen(true);
      setStatus('Gathering portfolio statistics and details...');

      // Read all portfolio collections & docs parallel
      const [
        hero,
        about,
        settings,
        contact,
        experience,
        projects,
        skills,
        timeline,
        certifications,
        testimonials,
        impactStories,
        qaMetrics,
        aiTools,
        now,
        blogs
      ] = await Promise.all([
        getDocument<any>(HERO_DOC).catch(() => null),
        getDocument<any>(ABOUT_DOC).catch(() => null),
        getDocument<any>(SETTINGS_DOC).catch(() => null),
        getDocument<any>(CONTACT_DOC).catch(() => null),
        getCollection<any>('experience', 'order').catch(() => []),
        getCollection<any>('projects', 'order').catch(() => []),
        getCollection<any>('skills').catch(() => []),
        getCollection<any>('timeline', 'order').catch(() => []),
        getCollection<any>('certifications', 'order').catch(() => []),
        getCollection<any>('testimonials', 'order').catch(() => []),
        getCollection<any>('impactStories', 'order').catch(() => []),
        getCollection<any>('qaMetrics', 'order').catch(() => []),
        getCollection<any>('aiTools', 'order').catch(() => []),
        getDocument<any>(NOW_DOC).catch(() => null),
        getCollection<any>('blogs').catch(() => [])
      ]);

      setStatus(`Synthesizing & Translating into ${currentLanguageName}...`);

      const portfolioPayload = {
        hero,
        about,
        settings,
        contact,
        experience,
        projects,
        skills,
        timeline,
        certifications,
        testimonials,
        impactStories,
        qaMetrics,
        aiTools,
        now,
        blogs
      };

      // Call our secure backend endpoint
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetLanguage: currentLanguageName,
          portfolioData: portfolioPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate resume: ${response.statusText}`);
      }

      const parsedResume = await response.json();
      setResumeData(parsedResume);
      setStatus('');
    } catch (error: any) {
      console.error('Failed to generate resume:', error);
      setStatus(`Error: ${error.message || 'Check your Gemini configurations'}`);
    } finally {
      setLoading(false);
    }
  };

  // 100% Vector Text Selectable Print PDF Generation 
  const handlePrintResume = () => {
    if (!resumeData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is preventing resume generation. Please allow popups for this site.');
      return;
    }

    // Build the beautifully structured high precision print content
    const info = resumeData.personalInfo;
    const skillsList = resumeData.skills || [];
    const experienceList = resumeData.experience || [];
    const projectList = resumeData.projects || [];
    const certs = resumeData.certifications || [];
    const educationList = resumeData.education || [];
    const achievementsList = resumeData.achievements || [];
    const testimonialsList = resumeData.testimonials || [];
    const additionalSectionsList = resumeData.additionalSections || [];

    const formatBullet = (bullet: string) => `<li>${bullet}</li>`;

    // Construct the printable page structure
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${info.name || 'Sankalp Suman'} - Resume (${currentLanguageName})</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
            
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              font-size: 11px;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header {
              text-align: center;
              margin-bottom: 22px;
              padding-bottom: 14px;
              border-bottom: 2.5px solid #1e3a8a;
            }
            
            .name {
              font-size: 26px;
              font-weight: 800;
              color: #1e3a8a;
              margin: 0 0 4px 0;
              letter-spacing: -0.025em;
              text-transform: uppercase;
            }
            
            .headline {
              font-size: 13.5px;
              font-weight: 600;
              color: #475569;
              margin: 0 0 10px 0;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            
            .contact-info {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 16px;
              font-size: 9.5px;
              color: #4f46e5;
              font-weight: 500;
            }
            
            .contact-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            
            .contact-item a {
              color: #4f46e5;
              text-decoration: none;
            }
            
            .summary {
              font-size: 11px;
              color: #334155;
              text-align: justify;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 12.5px;
              font-weight: 700;
              color: #1e3a8a;
              text-transform: uppercase;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 3px;
              margin: 0 0 10px 0;
              letter-spacing: 0.04em;
            }
            
            .item {
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              font-size: 11.5px;
              color: #0f172a;
              margin-bottom: 2px;
            }
            
            .item-subheader {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #475569;
              margin-bottom: 5px;
              font-style: italic;
            }
            
            .bullets {
              margin: 0;
              padding-left: 16px;
              list-style-type: disc;
            }
            
            .bullets li {
              margin-bottom: 3.5px;
              color: #334155;
              text-align: justify;
            }
            
            .bullets li:last-child {
              margin-bottom: 0;
            }
            
            .skills-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 6px;
            }
            
            @media (min-width: 600px) {
              .skills-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            
            .skill-category {
              font-weight: 700;
              color: #1e3a8a;
            }
            
            .skill-items {
              color: #334155;
            }
            
            .badges {
              display: flex;
              flex-wrap: wrap;
              gap: 5px;
              margin-top: 5px;
            }
            
            .badge {
              background-color: #f1f5f9;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              padding: 2px 6px;
              font-size: 9.5px;
              font-weight: 500;
              color: #334155;
            }
            
            @media print {
              body {
                padding: 10px 20px;
                font-size: 10px;
              }
              .section {
                page-break-inside: avoid;
              }
              .item {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${info.name || 'Sankalp Suman'}</h1>
            <div class="headline">${info.title || 'QA Automation Lead & Scrum Master'}</div>
            <div class="contact-info">
              ${info.email ? `<div class="contact-item">✉ ${info.email}</div>` : ''}
              ${info.phone ? `<div class="contact-item">☎ ${info.phone}</div>` : ''}
              ${info.location ? `<div class="contact-item">📍 ${info.location}</div>` : ''}
              ${info.linkedin ? `<div class="contact-item">🔗 <a href="${info.linkedin}" target="_blank">LinkedIn</a></div>` : ''}
              ${info.github ? `<div class="contact-item">⚙ <a href="${info.github}" target="_blank">GitHub</a></div>` : ''}
              ${info.website ? `<div class="contact-item">🌐 <a href="${info.website}" target="_blank">Portfolio</a></div>` : ''}
            </div>
          </div>
          
          <div class="summary">
            ${info.summary}
          </div>
          
          <div class="section">
            <h2 class="section-title">${language === 'en' ? 'Core Expertise' : language === 'hi' ? 'मुख्य विशेषज्ञता' : language === 'fr' ? 'Expertise clé' : 'Fachgebiete'}</h2>
            <div class="skills-grid">
              ${skillsList.map((sc: any) => `
                <div style="margin-bottom: 4px;">
                  <span class="skill-category">${sc.category}:</span>
                  <span class="skill-items">${sc.items.join(', ')}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">${language === 'en' ? 'Professional Experience' : language === 'hi' ? 'व्यावसायिक अनुभव' : language === 'fr' ? 'Expérience professionnelle' : 'Berufserfahrung'}</h2>
            ${experienceList.map((exp: any) => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.role}</span>
                  <span>${exp.company}</span>
                </div>
                <div class="item-subheader">
                  <span>${exp.period}</span>
                  <span>${exp.location || ''}</span>
                </div>
                <ul class="bullets">
                  ${exp.bullets.map(formatBullet).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2 class="section-title">${language === 'en' ? 'Projects & Showcases' : language === 'hi' ? 'प्रमुख परियोजनाएं' : language === 'fr' ? 'Projets et vitrines' : 'Projekte & Case Studies'}</h2>
            ${projectList.map((proj: any) => `
              <div class="item">
                <div class="item-header">
                  <span>${proj.name}</span>
                  ${proj.link ? `<span><a href="${proj.link}" target="_blank">${language === 'en' ? 'Live View' : language === 'hi' ? 'लाइव देखें' : language === 'fr' ? 'Voir en direct' : 'Live-Ansicht'} ↗</a></span>` : ''}
                </div>
                <div class="item-subheader">
                  <span>${proj.role || 'Contributor'}</span>
                  <span>${proj.techStack ? proj.techStack.join(' | ') : ''}</span>
                </div>
                <p style="margin: 4px 0 0 0; color: #334155; text-align: justify;">${proj.description}</p>
              </div>
            `).join('')}
          </div>
          
          ${educationList.length > 0 ? `
            <div class="section">
              <h2 class="section-title">${language === 'en' ? 'Education' : language === 'hi' ? 'शिक्षा' : language === 'fr' ? 'Éducation' : 'Ausbildung'}</h2>
              ${educationList.map((edu: any) => `
                <div class="item">
                  <div class="item-header">
                    <span>${edu.degree}</span>
                    <span>${edu.institution}</span>
                  </div>
                  <div class="item-subheader">
                    <span>${edu.period}</span>
                    <span>${edu.grade || ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${certs.length > 0 ? `
            <div class="section">
              <h2 class="section-title">${language === 'en' ? 'Professional Certifications' : language === 'hi' ? 'व्यावसायिक प्रमाणपत्र' : language === 'fr' ? 'Certifications professionnelles' : 'Zertifizierungen'}</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                ${certs.map((c: any) => `
                  <div style="margin-bottom: 4px;">
                    <strong>${c.name}</strong><br/>
                    <span style="color: #64748b; font-size: 9.5px;">${c.issuer} ${c.date ? `• ${c.date}` : ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${achievementsList.length > 0 ? `
            <div class="section">
              <h2 class="section-title">${language === 'en' ? 'Key Achievements & Impact' : language === 'hi' ? 'प्रमुख उपलब्धियां' : language === 'fr' ? 'Réalisations clés' : 'Wichtigste Erfolge'}</h2>
              <ul class="bullets">
                ${achievementsList.map(formatBullet).join('')}
              </ul>
            </div>
          ` : ''}

          ${additionalSectionsList.map((sec: any) => `
            <div class="section">
              <h2 class="section-title">${sec.title}</h2>
              <ul class="bullets">
                ${sec.bullets.map(formatBullet).join('')}
              </ul>
            </div>
          `).join('')}

          ${testimonialsList.length > 0 ? `
            <div class="section" style="page-break-inside: avoid;">
              <h2 class="section-title">${language === 'en' ? 'Endorsements & Recommendations' : language === 'hi' ? 'सिफारिशें और प्रशंसापत्र' : language === 'fr' ? 'Recommandations' : 'Referenzen'}</h2>
              ${testimonialsList.slice(0, 2).map((t: any) => `
                <div style="margin-bottom: 10px; font-style: italic; color: #475569; position: relative;">
                  "${t.text}"
                  <div style="text-align: right; font-weight: 700; color: #0f172a; font-size: 9.5px; font-style: normal; margin-top: 3px;">
                    — ${t.author}, ${t.role} ${t.company ? `@ ${t.company}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Direct PNG-to-PDF click-to-download implementation
  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-pdf-render-root');
    if (!element) return;

    const originalGetComputedStyle = window.getComputedStyle;

    // 1. Save original styles to perfectly restore them after capture
    const originalWidth = element.style.width || '';
    const originalMaxWidth = element.style.maxWidth || '';
    const originalPadding = element.style.padding || '';
    const originalBoxSizing = element.style.boxSizing || '';

    try {
      setLoading(true);
      setStatus('Composing high resolution layout rendering canvas...');

      // 2. Force A4 proportional desktop canvas dimensions for pristine text-wrapping and scaling
      element.style.width = '820px';
      element.style.maxWidth = '820px';
      element.style.padding = '40px';
      element.style.boxSizing = 'border-box';

      // Dynamic math tools to convert oklch colors into classical rgb representation, 
      // which completely circumvents color-parsing library crashes on Tailwind v4 elements.
      const oklchToRgb = (l: number, c: number, h: number, a: number = 1): string => {
        const hRad = (h * Math.PI) / 180;
        const a_lab = c * Math.cos(hRad);
        const b_lab = c * Math.sin(hRad);
        
        const l_lms = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
        const m_lms = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
        const s_lms = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab;
        
        const l3 = l_lms * l_lms * l_lms;
        const m3 = m_lms * m_lms * m_lms;
        const s3 = s_lms * s_lms * s_lms;
        
        const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
        const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
        const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
        
        const toSRGB = (x: number) => {
          return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
        };
        
        const r = Math.max(0, Math.min(255, Math.round(toSRGB(r_lin) * 255)));
        const g = Math.max(0, Math.min(255, Math.round(toSRGB(g_lin) * 255)));
        const b = Math.max(0, Math.min(255, Math.round(toSRGB(b_lin) * 255)));
        
        return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
      };

      const parseAndConvertOklch = (colorString: string): string => {
        if (!colorString || typeof colorString !== 'string') return colorString;
        if (!colorString.includes('oklch')) return colorString;

        try {
          const oklchRegex = /oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/i;
          const match = colorString.match(oklchRegex);
          if (!match) return colorString;

          const lVal = match[1];
          const cVal = match[2];
          const hVal = match[3];
          const aVal = match[4];

          const l = lVal.endsWith('%') ? parseFloat(lVal) / 100 : parseFloat(lVal);
          const c = parseFloat(cVal);
          const h = parseFloat(hVal);
          let a = 1;
          if (aVal) {
            a = aVal.endsWith('%') ? parseFloat(aVal) / 100 : parseFloat(aVal);
          }

          return oklchToRgb(l, c, h, a);
        } catch (err) {
          return colorString;
        }
      };

      const convertAllOklchInString = (str: string): string => {
        if (!str || typeof str !== 'string' || !str.includes('oklch')) return str;
        
        const regex = /oklch\s*\(\s*[^)]+\)/gi;
        return str.replace(regex, (match) => {
          return parseAndConvertOklch(match);
        });
      };

      // Wrap window.getComputedStyle to translate oklch to rgb representation on-the-fly
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = Reflect.get(target, prop);
            if (typeof val === 'string' && val.includes('oklch')) {
              return convertAllOklchInString(val);
            }
            if (typeof val === 'function') {
              return val.bind(target);
            }
            return val;
          }
        });
      };

      // Capture element using html2canvas with optimal settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 820,
        windowWidth: 820
      });

      setStatus('Compiling PDF file...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');
      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 295; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Create extra pages if content overflows standard single page A4
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      setStatus('Initiating file download...');
      pdf.save(`Sankalp_Suman_Resume_${language === 'en' ? 'en' : language}.pdf`);
      setStatus('');
    } catch (err: any) {
      console.error(err);
      setStatus(`Direct compilation failed. Use "Print Selection-Text PDF" for best results.`);
    } finally {
      // 3. Restore original styles perfectly
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.padding = originalPadding;
      element.style.boxSizing = originalBoxSizing;

      // Restore standard browser getComputedStyle implementation
      window.getComputedStyle = originalGetComputedStyle;
      setLoading(false);
    }
  };

  return (
    <>
      {/* Prime user interface trigger button */}
      <button
        onClick={handleGenerateResume}
        className="h-10 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-brand hover:brightness-110 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-md shadow-brand/10 select-none cursor-pointer border border-transparent w-full sm:w-auto max-w-xs sm:max-w-none"
        aria-label="Generate an AI-powered resume in the current active language"
        id="generate-ai-resume-btn"
      >
        <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
        <span>{language === 'en' ? 'Generate AI Resume' : language === 'hi' ? 'एआई बायोडाटा जनरेट करें' : language === 'fr' ? 'Générer un CV IA' : 'KI-Lebenslauf erstellen'}</span>
      </button>

      {/* Primary Accessible Modal Layer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#050816]/90 backdrop-blur-sm overflow-hidden text-white no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-[#0a0e23] border border-white/10 rounded-2xl flex flex-col h-[90vh] md:h-[85vh] relative shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="resume-modal-title"
            >
              {/* Decorative side lights */}
              <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between z-10 shrink-0 bg-[#0c1433]/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="resume-modal-title" className="text-base font-bold text-white leading-tight">
                      {language === 'en' ? 'Personalized AI Resume Assistant' : language === 'hi' ? 'व्यक्तिगत एआई बायोडाटा सहायक' : language === 'fr' ? 'Assistant de CV IA personnalisé' : 'Personalisierter KI-Lebenslauf-Assistent'}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {language === 'en' ? `Formulating resume in your active locale: ${currentLanguageName}` : language === 'hi' ? `आपकी सक्रिय भाषा में जैव-डेटा: ${currentLanguageName}` : language === 'fr' ? `Formulation du CV en locale active: ${currentLanguageName}` : `Lebenslauf-Erstellung auf: ${currentLanguageName}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Loader / Content Splitter */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col min-h-0 bg-[#06091c]">
                {loading || status ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <Sparkles className="absolute w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm">
                      <p className="text-sm font-semibold tracking-wide text-gray-200">{status || 'Analyzing dynamic records...'}</p>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Our AI processes experience timelines, certifications, and project links. We translate sections, improve readability, and organize items for ATS screening.
                      </p>
                    </div>
                  </div>
                ) : resumeData ? (
                  <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
                    
                    {/* Lateral Controls Panel */}
                    <div className="md:w-64 space-y-5 shrink-0 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl space-y-2.5">
                          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            ATS Optimized
                          </h4>
                          <p className="text-[10px] text-gray-300 leading-relaxed">
                            This document is rewritten with executive active-verbs, highlights, and clear section dividers designed for automated parser scans as well as recruiter evaluation.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={handlePrintResume}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
                            aria-label="Directly print or save the selectable-text vector PDF"
                          >
                            <Printer className="w-4 h-4" />
                            {language === 'en' ? 'Print / Save Vector PDF' : language === 'hi' ? 'प्रिंट / सेव वेक्टर पीडीएफ' : language === 'fr' ? 'Imprimer / Sauvegarder PDF' : 'Drucken / Vektor-PDF speichern'}
                          </button>

                          <button
                            onClick={handleDownloadPDF}
                            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                            aria-label="Download the resume instantly"
                          >
                            <Download className="w-4 h-4" />
                            {language === 'en' ? 'Direct PDF Download' : language === 'hi' ? 'सीधा पीडीएफ डाउनलोड' : language === 'fr' ? 'Téléchargement PDF direct' : 'Direkter PDF-Download'}
                          </button>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[9.5px] text-gray-400 leading-relaxed">
                          <strong>Unicode Notice:</strong> Hindi/special characters are highly preserved. For perfect selectable vector text rendering, please use the <strong>Print / Save Vector PDF</strong> button next.
                        </div>
                      </div>

                    </div>

                    {/* Styled Dynamic Live Resume Document Preview Canvas - A4 Simulation */}
                    <div className="flex-1 overflow-y-auto bg-white text-slate-800 rounded-xl p-6 md:p-8 border border-white/10 shadow-sm" style={{ maxHeight: '100%' }}>
                      <div id="resume-pdf-render-root" className="bg-white text-slate-800 antialiased leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', minHeight: '297mm' }}>
                        
                        {/* Header Area */}
                        <div className="text-center pb-5 mb-5 border-b-2 border-blue-900">
                          <h1 className="text-2xl font-black text-blue-900 tracking-tight uppercase m-0 leading-tight">
                            {resumeData.personalInfo?.name || 'Sankalp Suman'}
                          </h1>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">
                            {resumeData.personalInfo?.title || 'QA Lead & Scrum Master'}
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-3 text-[10px] text-indigo-700 font-medium mt-3">
                            {resumeData.personalInfo?.email && <span className="flex items-center gap-1">✉ {resumeData.personalInfo.email}</span>}
                            {resumeData.personalInfo?.phone && <span className="flex items-center gap-1">☎ {resumeData.personalInfo.phone}</span>}
                            {resumeData.personalInfo?.location && <span className="flex items-center gap-1">📍 {resumeData.personalInfo.location}</span>}
                            {resumeData.personalInfo?.linkedin && <span className="flex items-center gap-1">🔗 LinkedIn</span>}
                            {resumeData.personalInfo?.github && <span className="flex items-center gap-1">⚙ GitHub</span>}
                          </div>
                        </div>

                        {/* Summary Block */}
                        {resumeData.personalInfo?.summary && (
                          <div className="mb-5 text-justify italic text-slate-700 text-[10.5px] leading-relaxed">
                            {resumeData.personalInfo.summary}
                          </div>
                        )}

                        {/* Technical Competencies Category */}
                        {resumeData.skills && resumeData.skills.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Core Expertise' : language === 'hi' ? 'मुख्य विशेषज्ञता' : language === 'fr' ? 'Expertise' : 'Spezialgebiete'}
                            </h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                              {resumeData.skills.map((sc: any, index: number) => (
                                <div key={index} className="text-[10px] leading-normal">
                                  <span className="font-bold text-slate-800">{sc.category}: </span>
                                  <span className="text-slate-600">{sc.items.join(', ')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Experience Timeline */}
                        {resumeData.experience && resumeData.experience.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Professional Experience' : language === 'hi' ? 'व्यावसायिक अनुभव' : language === 'fr' ? 'Expérience professionnelle' : 'Berufserfahrung'}
                            </h2>
                            <div className="space-y-4">
                              {resumeData.experience.map((exp: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between font-bold text-[11px] text-slate-900">
                                    <span>{exp.role}</span>
                                    <span>{exp.company}</span>
                                  </div>
                                  <div className="flex justify-between text-[9.5px] text-slate-500 italic">
                                    <span>{exp.period}</span>
                                    <span>{exp.location || ''}</span>
                                  </div>
                                  <ul className="list-disc pl-4 space-y-1 mt-1 text-[10px] text-slate-600 text-justify">
                                    {exp.bullets.map((bullet: string, bIdx: number) => (
                                      <li key={bIdx}>{bullet}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Highlighted Case Studies & Projects */}
                        {resumeData.projects && resumeData.projects.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Projects & Showcases' : language === 'hi' ? 'प्रमुख परियोजनाएं' : language === 'fr' ? 'Projets' : 'Ausgewählte Projekte'}
                            </h2>
                            <div className="space-y-3.5">
                              {resumeData.projects.map((proj: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between font-bold text-[11px] text-slate-900">
                                    <span>{proj.name}</span>
                                    {proj.link && <span className="text-[10px] text-blue-600 font-semibold underline">{language === 'en' ? 'Live View' : language === 'hi' ? 'लाइव' : language === 'fr' ? 'En direct' : 'Live-Ansicht'} ↗</span>}
                                  </div>
                                  <div className="flex justify-between text-[9px] text-slate-500 italic">
                                    <span>{proj.role || 'Contributor'}</span>
                                    <span>{proj.techStack ? proj.techStack.join(' | ') : ''}</span>
                                  </div>
                                  <p className="text-[10px] m-0 text-slate-600 text-justify leading-relaxed">
                                    {proj.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education Details */}
                        {resumeData.education && resumeData.education.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Education' : language === 'hi' ? 'शिक्षा' : language === 'fr' ? 'Éducation' : 'Ausbildung'}
                            </h2>
                            <div className="space-y-2.5">
                              {resumeData.education.map((edu: any, index: number) => (
                                <div key={index} className="flex justify-between text-[10px] text-slate-750">
                                  <div>
                                    <span className="font-bold text-slate-900">{edu.degree}</span> • <span className="italic text-slate-600">{edu.institution}</span>
                                  </div>
                                  <div className="text-right shrink-0 text-slate-500 font-mono text-[9px]">
                                    {edu.period} {edu.grade ? `(${edu.grade})` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications Block */}
                        {resumeData.certifications && resumeData.certifications.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Professional Certifications' : language === 'hi' ? 'व्यावसायिक प्रमाणपत्र' : language === 'fr' ? 'Certifications professionnelles' : 'Zertifizierungen'}
                            </h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                              {resumeData.certifications.map((c: any, index: number) => (
                                <div key={index} className="text-[10px] leading-normal">
                                  <span className="font-bold text-slate-800">{c.name}</span>
                                  <span className="text-slate-500 text-[9.5px]"> — {c.issuer} {c.date ? `• ${c.date}` : ''}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Key Achievements & Impact */}
                        {resumeData.achievements && resumeData.achievements.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Key Achievements & Impact' : language === 'hi' ? 'प्रमुख उपलब्धियां' : language === 'fr' ? 'Réalisations clés' : 'Wichtigste Erfolge'}
                            </h2>
                            <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-600">
                              {resumeData.achievements.map((ach: string, index: number) => (
                                <li key={index}>{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Endorsements & Recommendations */}
                        {resumeData.testimonials && resumeData.testimonials.length > 0 && (
                          <div className="mb-5">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Endorsements & Recommendations' : language === 'hi' ? 'सिफारिशें और प्रशंसापत्र' : language === 'fr' ? 'Recommandations' : 'Referenzen'}
                            </h2>
                            <div className="space-y-2.5">
                              {resumeData.testimonials.slice(0, 2).map((t: any, index: number) => (
                                <div key={index} className="text-[10px] leading-relaxed italic text-slate-600">
                                  "{t.text}"
                                  <div className="text-right font-bold text-slate-800 text-[9.5px] not-italic mt-0.5">
                                    — {t.author}, {t.role} {t.company ? `@ ${t.company}` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dynamic custom additional sections (Future-proof architecture) */}
                        {resumeData.additionalSections && resumeData.additionalSections.length > 0 && (
                          <>
                            {resumeData.additionalSections.map((sec: any, index: number) => (
                              <div key={index} className="mb-5">
                                <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                                  {sec.title}
                                </h2>
                                <ul className="list-disc pl-4 space-y-1 text-[10px] text-slate-600">
                                  {sec.bullets.map((bullet: string, bIdx: number) => (
                                    <li key={bIdx}>{bullet}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </>
                        )}

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <AlertCircle className="w-12 h-12 text-amber-500 animate-bounce" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Temporary failure during generation</h4>
                      <p className="text-xs text-gray-400 max-w-sm">
                        Please try clicking the button again, or ensure the Gemini API key is configured correctly in settings.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateResume}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all select-none cursor-pointer"
                    >
                      Retry Generation
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
