import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Minus,
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

const cleanDisplayUrl = (url: string): string => {
  if (!url) return '';
  let clean = url.replace(/^https?:\/\/(www\.)?/, '');
  clean = clean.split(/[?#]/)[0];
  clean = clean.replace(/\/$/, '');
  
  if (clean.length > 35) {
    try {
      let urlObjStr = url;
      if (!/^https?:\/\//i.test(url)) urlObjStr = 'https://' + url;
      const parsed = new URL(urlObjStr);
      const host = parsed.hostname.replace(/^www\./, '');
      const pathWithDots = parsed.pathname.length > 15 
        ? parsed.pathname.substring(0, 15) + '...'
        : parsed.pathname;
      const result = host + (pathWithDots !== '/' ? pathWithDots : '');
      return result.replace(/\/$/, '');
    } catch {
      return clean.substring(0, 32) + '...';
    }
  }
  return clean;
};

export const AIResumeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string>('');
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
      setShowLimitPopup(false);
      setLoading(true);
      setIsOpen(true);
      setIsMinimized(false);
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
        achievements,
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
        getCollection<any>('achievements', 'order').catch(() => []),
        getCollection<any>('testimonials', 'order').catch(() => []),
        getCollection<any>('impactStories', 'order').catch(() => []),
        getCollection<any>('qaMetrics', 'order').catch(() => []),
        getCollection<any>('aiTools', 'order').catch(() => []),
        getDocument<any>(NOW_DOC).catch(() => null),
        getCollection<any>('blogs').catch(() => [])
      ]);

      setStatus(`Synthesizing & Translating into ${currentLanguageName}...`);

      // Clean up heavy properties to keep payload sizes and model inference times well beneath Vercel limits
      const sanitizedBlogs = (blogs || []).slice(0, 2).map((b: any) => ({
        title: b.title || '',
        category: b.category || '',
        publishedAt: b.publishedAt || b.date || '',
        excerpt: b.excerpt || ''
      }));

      const sanitizedTestimonials = (testimonials || []).slice(0, 1).map((t: any) => ({
        author: t.author || '',
        role: t.role || '',
        company: t.company || '',
        text: (t.text || '').substring(0, 150) // Keep client text brief for resume generator AI
      }));

      const sanitizedExperience = (experience || []).slice(0, 15).map((e: any) => ({
        role: e.role || '',
        company: e.company || '',
        period: e.period || '',
        location: e.location || '',
        bullets: Array.isArray(e.bullets) ? e.bullets.slice(0, 10) : (e.description ? [e.description.substring(0, 500)] : [])
      }));

      const sanitizedProjects = (projects || [])
        .slice(0, 25)
        .map((p: any) => ({
          name: p.title || p.name || '',
          description: (p.description || '').substring(0, 500),
          techStack: (p.techStack || p.tags || []).slice(0, 15),
          link: p.liveUrl || p.githubUrl || p.link || p.github || '',
          role: p.role || ''
        }));

      // Group skills by category properly since Firestore collection is flat
      const groupedSkillsMap: Record<string, string[]> = {};
      (skills || []).forEach((s: any) => {
        const cat = s.category || 'Other';
        if (!groupedSkillsMap[cat]) groupedSkillsMap[cat] = [];
        groupedSkillsMap[cat].push(s.name);
      });

      const sanitizedSkills = Object.entries(groupedSkillsMap).map(([category, items]) => ({
        category,
        items: items.slice(0, 30)
      })).slice(0, 15);

      const sanitizedTimeline = (timeline || []).slice(0, 15).map((t: any) => ({
        role: t.role || '',
        company: t.company || '',
        period: t.period || '',
        milestones: Array.isArray(t.milestones) ? t.milestones.slice(0, 10) : []
      }));

      const sanitizedCertifications = (certifications || []).slice(0, 20).map((c: any) => ({
        name: c.name || '',
        issuer: c.issuer || '',
        date: c.date || '',
        link: c.link || ''
      }));

      const sanitizedAchievements = (achievements && achievements.length > 0 ? achievements : [
        { title: 'Transform Collaboration Partner', organization: 'Amdocs ActixOne', date: '2023', description: 'Awarded for exceptional collaboration and teamwork on the ActixOne project.' },
        { title: 'Individual Contributor', organization: 'Amdocs ActixOne North Star', date: '2022', description: 'Recognized for outstanding individual contributions to project milestones and deliverables.' },
        { title: 'Employee of the Year', organization: 'Adobe Acrobat - Liquid Mode', date: '2020', description: "Honored as Employee of the Year for outstanding quality assurance and testing efforts on Adobe's AI framework features." }
      ]).slice(0, 15).map((a: any) => ({
        title: a.title || '',
        organization: a.organization || '',
        date: a.date || '',
        description: a.description || ''
      }));

      const portfolioPayload = {
        hero,
        about: about ? { bio: about.bio || '', title: about.title || '', summary: about.summary || '' } : null,
        settings,
        contact: contact ? { email: contact.email || '', phone: contact.phone || '', location: contact.location || '', linkedin: contact.linkedin || '', github: contact.github || '' } : null,
        experience: sanitizedExperience,
        projects: sanitizedProjects,
        skills: sanitizedSkills,
        timeline: sanitizedTimeline,
        certifications: sanitizedCertifications,
        achievements: sanitizedAchievements,
        testimonials: sanitizedTestimonials,
        impactStories: (impactStories || []).slice(0, 10),
        qaMetrics: (qaMetrics || []).slice(0, 15),
        aiTools: (aiTools || []).slice(0, 15),
        now,
        blogs: sanitizedBlogs,
        portfolioUrl: window.location.origin
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
        let errMessage = '';
        try {
          const text = await response.text();
          console.log('[AIResumeModal] Raw error response text from server:', text);
          try {
            const errPayload = JSON.parse(text);
            if (errPayload && errPayload.error) {
              errMessage = typeof errPayload.error === 'object'
                ? (errPayload.error.message || JSON.stringify(errPayload.error))
                : String(errPayload.error);
            } else if (errPayload && errPayload.details) {
              errMessage = String(errPayload.details);
            } else if (errPayload && errPayload.message) {
              errMessage = String(errPayload.message);
            } else {
              errMessage = text;
            }
          } catch {
            // Not valid JSON, output text (trimmed) or status fallback
            if (text && text.length > 0) {
              errMessage = text.length > 250 ? text.substring(0, 250) + '...' : text;
            } else {
              errMessage = `HTTP ${response.status} ${response.statusText || 'Error'}`;
            }
          }
        } catch (readErr) {
          errMessage = `HTTP ${response.status} ${response.statusText || 'Error'}`;
        }
        throw new Error(errMessage);
      }

      const parsedResume = await response.json();
      console.log('[AIResumeModal] Successfully received resume JSON:', parsedResume);
      setResumeData(parsedResume);
      setIsMinimized(false);
      setStatus('');
    } catch (error: any) {
      console.error('Failed to generate resume client-side:', error);
      
      let displayError = 'An unexpected error occurred during resume generation.';
      if (error && typeof error === 'object') {
        if (error.message) {
          displayError = error.message;
        } else {
          try {
            displayError = JSON.stringify(error);
          } catch {
            displayError = String(error);
          }
        }
      } else if (error) {
        displayError = String(error);
      }
      
      // Avoid showing Error {} or Error [object Object]
      if (!displayError || displayError === '{}' || displayError === '[object Object]') {
        displayError = 'The server returned an empty or un-serializable response. This typically points to a standard Vercel serverless function memory timeout or gateway termination. Please try again or simplify your active portfolio fields.';
      }
      
      setStatus(`Error: ${displayError}`);
      setIsMinimized(false);
      setShowLimitPopup(true);
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

    const formatBullet = (bullet: string) => {
      const cleaned = bullet.replace(/^[\s*•-]+\s*/, '');
      return `<li>${cleaned}</li>`;
    };

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
              margin: 0 auto;
              max-width: 850px;
              padding: 40px 50px;
              font-size: 11px;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .header {
              text-align: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 2px solid #1e3a8a;
            }
            
            .name {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 6px 0;
              letter-spacing: -0.02em;
              text-transform: uppercase;
            }
            
            .headline {
              font-size: 14px;
              font-weight: 600;
              color: #1e3a8a;
              margin: 0 0 12px 0;
              letter-spacing: 0.05em;
              text-transform: uppercase;
            }
            
            .contact-info {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 16px;
              font-size: 10px;
              color: #475569;
              font-weight: 500;
            }
            
            .contact-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }
            
            .contact-item a {
              color: #1e3a8a;
              text-decoration: none;
              font-weight: 600;
            }
            
            .summary {
              font-size: 11.5px;
              color: #334155;
              text-align: justify;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            
            .section {
              margin-bottom: 22px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 13px;
              font-weight: 700;
              color: #1e3a8a;
              text-transform: uppercase;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 4px;
              margin: 0 0 12px 0;
              letter-spacing: 0.05em;
            }
            
            .item {
              margin-bottom: 16px;
              page-break-inside: avoid;
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              font-weight: 700;
              font-size: 12px;
              color: #0f172a;
              margin-bottom: 2px;
            }
            
            .item-subheader {
              display: flex;
              justify-content: space-between;
              font-size: 10.5px;
              color: #475569;
              margin-bottom: 6px;
              font-style: italic;
            }
            
            .bullets {
              margin: 0;
              padding-left: 18px;
              list-style-type: disc;
            }
            
            .bullets li {
              margin-bottom: 4px;
              color: #334155;
              text-align: justify;
            }
            
            .bullets li:last-child {
              margin-bottom: 0;
            }
            
            .skills-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 8px;
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
            
            @media print {
              @page {
                margin: 0.5in;
                size: letter portrait;
              }
              body {
                padding: 0;
                max-width: 100%;
                font-size: 11px;
                background-color: transparent;
              }
              .section, .item {
                page-break-inside: avoid;
              }
              h2.section-title {
                page-break-after: avoid;
              }
              .item-header {
                page-break-after: avoid;
              }
              .item-subheader {
                page-break-after: avoid;
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
              ${info.yearsOfExperience ? `<div class="contact-item">⏱ ${info.yearsOfExperience}</div>` : ''}
              ${info.languages && info.languages.length > 0 ? `<div class="contact-item">💬 ${info.languages.join(', ')}</div>` : ''}
              ${info.linkedin ? `<div class="contact-item">🔗 <a href="${info.linkedin}" target="_blank">${info.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a></div>` : ''}
              ${info.github ? `<div class="contact-item">⚙ <a href="${info.github}" target="_blank">${info.github.replace(/^https?:\/\/(www\.)?/, '')}</a></div>` : ''}
              ${info.website ? `<div class="contact-item">🌐 <a href="${info.website}" target="_blank">${info.website.replace(/^https?:\/\/(www\.)?/, '')}</a></div>` : ''}
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
                  <span style="font-weight: 700;">${proj.name}</span>
                  ${proj.link ? `<span style="font-size: 9px;"><a href="${proj.link}" target="_blank" style="color: #4338ca; text-decoration: underline;">${cleanDisplayUrl(proj.link)} ↗</a></span>` : ''}
                </div>
                <div class="item-subheader">
                  <span>${proj.role || 'Contributor'}</span>
                  <span>${proj.techStack ? proj.techStack.join(' | ') : ''}</span>
                </div>
                ${proj.description.includes('\n') || proj.description.includes('•') ? 
                  `<ul class="bullets">
                    ${proj.description.split('\n').filter((l: string) => l.trim().length > 0).map(formatBullet).join('')}
                   </ul>` : 
                  `<p style="margin: 4px 0 0 0; color: #334155; text-align: justify;">${proj.description}</p>`
                }
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
    console.log('[PDF Generation] Start download procedure initiated.');
    setPdfGenerating(true);
    setPdfStatus('Preparing layout for high-fidelity compile...');

    let measureHost: HTMLDivElement | null = null;
    const originalGetComputedStyle = window.getComputedStyle;

    try {
      // Step 1: Element Verification
      console.log('[PDF Generation] Step 1: Verifying resume-pdf-render-root presence...');
      const element = document.getElementById('resume-pdf-render-root');
      if (!element) {
        throw new Error('Could not find the "resume-pdf-render-root" element in the DOM.');
      }
      console.log('[PDF Generation] Step 1 Success: Found root render element.');

      // Step 2: Create a sandboxed measurement container to determine perfect element heights
      setPdfStatus('Measuring layout blocks inside 820px sandbox...');
      measureHost = document.createElement('div');
      measureHost.id = 'resume-pdf-measure-sandbox';
      measureHost.style.position = 'absolute';
      measureHost.style.top = '-9999px';
      measureHost.style.left = '-9999px';
      measureHost.style.width = '820px';
      measureHost.style.padding = '0';
      measureHost.style.boxSizing = 'border-box';
      measureHost.style.backgroundColor = '#ffffff';
      measureHost.style.color = '#1e293b';
      
      const renderRootClone = element.cloneNode(true) as HTMLElement;
      
      // Force padding on renderRootClone to be exactly the same as PADDING_PX (48px) to match page rendering
      renderRootClone.style.padding = '48px';
      renderRootClone.style.width = '820px';
      renderRootClone.style.maxWidth = '820px';
      renderRootClone.style.boxSizing = 'border-box';
      // Remove responsive template padding classes to prevent width shifts on mobile layouts
      renderRootClone.className = renderRootClone.className
        .replace(/\bp-\d+/g, '')
        .replace(/\bmd:p-\d+/g, '');

      measureHost.appendChild(renderRootClone);
      document.body.appendChild(measureHost);

      // Restore color styling overrides for OKLCH in Tailwind v4
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
        const toSRGB = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
        const r = Math.max(0, Math.min(255, Math.round(toSRGB(r_lin) * 255)));
        const g = Math.max(0, Math.min(255, Math.round(toSRGB(g_lin) * 255)));
        const b = Math.max(0, Math.min(255, Math.round(toSRGB(b_lin) * 255)));
        return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
      };

      const parseAndConvertOklch = (colorString: string): string => {
        if (!colorString || typeof colorString !== 'string' || !colorString.includes('oklch')) return colorString;
        try {
          const oklchRegex = /oklch\s*\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/i;
          const match = colorString.match(oklchRegex);
          if (!match) return colorString;
          const l = match[1].endsWith('%') ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
          const c = parseFloat(match[2]);
          const h = parseFloat(match[3]);
          const a = match[4] ? (match[4].endsWith('%') ? parseFloat(match[4]) / 100 : parseFloat(match[4])) : 1;
          return oklchToRgb(l, c, h, a);
        } catch { return colorString; }
      };

      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = Reflect.get(target, prop);
            if (typeof val === 'string' && val.includes('oklch')) {
              return val.replace(/oklch\s*\(\s*[^)]+\)/gi, parseAndConvertOklch);
            }
            return typeof val === 'function' ? val.bind(target) : val;
          }
        });
      };

      // Retrieve all blocks with data-pdf-block attribute from the measured sandbox
      const sandboxBlocks = Array.from(renderRootClone.querySelectorAll('[data-pdf-block]')) as HTMLElement[];
      console.log(`[PDF Generation] Found ${sandboxBlocks.length} tagged layout blocks for packaging.`);

      // Step 3: Packing layout blocks into pages of safe content height budget
      const PAGE_WIDTH_PX = 820;
      const PAGE_HEIGHT_PX = 1160;
      const PADDING_PX = 48;
      const MAX_CONTENT_HEIGHT_PX = 1000;

      const pages: HTMLDivElement[] = [];
      let currentPage = document.createElement('div');
      
      const stylePage = (el: HTMLDivElement) => {
        el.style.width = `${PAGE_WIDTH_PX}px`;
        el.style.height = `${PAGE_HEIGHT_PX}px`;
        el.style.padding = `${PADDING_PX}px`;
        el.style.boxSizing = 'border-box';
        el.style.backgroundColor = '#ffffff';
        el.style.color = '#1e293b';
        el.style.position = 'absolute';
        el.style.top = `${window.scrollY}px`;
        el.style.left = `${window.scrollX}px`;
        el.style.zIndex = '-99999';
        el.style.pointerEvents = 'none';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.className = 'bg-white text-slate-800 antialiased leading-relaxed';
        el.style.fontFamily = 'Inter, sans-serif';
        el.style.fontSize = '11px';
      };

      stylePage(currentPage);
      let currentHeight = 0;

      // Pack blocks into pages
      for (const block of sandboxBlocks) {
        const blockHeight = block.offsetHeight;
        const style = window.getComputedStyle(block);
        const marginBot = parseFloat(style.marginBottom || '0');
        const totalBlockHeight = blockHeight + marginBot;

        console.log(`[PDF Generation] Packaging block:`, block.tagName, `Height: ${blockHeight}px + Margin: ${marginBot}px = ${totalBlockHeight}px. Current accumulated page height: ${currentHeight}px`);

        if (currentHeight + totalBlockHeight > MAX_CONTENT_HEIGHT_PX && currentHeight > 0) {
          // Commit current completed page
          pages.push(currentPage);

          // Spawn new page
          currentPage = document.createElement('div');
          stylePage(currentPage);
          currentHeight = 0;
        }

        // Clone and transfer block to current page container
        const cloneBlock = block.cloneNode(true) as HTMLElement;
        cloneBlock.style.marginBottom = `${marginBot}px`;
        currentPage.appendChild(cloneBlock);
        currentHeight += totalBlockHeight;
      }

      // Commit the final page
      if (currentPage.childNodes.length > 0) {
        pages.push(currentPage);
      }

      console.log(`[PDF Generation] High-fidelity layout packaging complete! Produced ${pages.length} pages.`);

      // Step 4: Render packed pages to canvases and build the PDF
      const pdf = new jspdf('p', 'mm', 'a4');
      const nameSuffix = language === 'en' ? 'en' : language;

      for (let i = 0; i < pages.length; i++) {
        setPdfStatus(`Compiling page ${i + 1} of ${pages.length}...`);
        const pageEl = pages[i];

        // Attach temporarily to document.body so html2canvas renders accurately with styles
        document.body.appendChild(pageEl);

        const canvas = await html2canvas(pageEl, {
          scale: 2.2, // Boost quality slightly for crispy vector look
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: PAGE_WIDTH_PX,
          height: PAGE_HEIGHT_PX,
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          windowWidth: document.documentElement.clientWidth || PAGE_WIDTH_PX,
          windowHeight: document.documentElement.clientHeight || PAGE_HEIGHT_PX
        });

        // Tidy up DOM immediately
        document.body.removeChild(pageEl);

        const pageImgData = canvas.toDataURL('image/png');

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(pageImgData, 'PNG', 0, 0, 210, 297);
        console.log(`[PDF Generation] Completed rendering canvas for page #${i + 1}`);
      }

      setPdfStatus('Initiating file download...');
      pdf.save(`Sankalp_Suman_Resume_${nameSuffix}.pdf`);
      setPdfStatus('');
      console.log('[PDF Generation] Success: Dispatch file download sequence.');

    } catch (err: any) {
      console.error('[PDF Generation ERROR] Pipeline process exception:', err);
      setPdfStatus(`Direct compilation failed. Use "Print Selection-Text PDF" for best results.`);
    } finally {
      // Step 5: Clean up measured sandboxes
      if (measureHost && document.body.contains(measureHost)) {
        document.body.removeChild(measureHost);
      }
      window.getComputedStyle = originalGetComputedStyle;
      setPdfGenerating(false);
    }
  };

  return (
    <>
      {/* Prime user interface trigger button */}
      <button
        onClick={handleGenerateResume}
        className="w-9 h-9 sm:w-11 sm:h-11 bg-brand/10 hover:bg-brand text-brand hover:text-white rounded border border-brand/20 transition-all flex items-center justify-center group shadow-lg shadow-brand/5 select-none cursor-pointer shrink-0"
        aria-label="Generate AI Resume"
        id="generate-ai-resume-btn"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-brand group-hover:text-white animate-pulse" />
      </button>

      {/* Primary Accessible Modal Layer */}
      <AnimatePresence>
        {isOpen && (
          !isMinimized ? (
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsOpen(false);
                  setIsMinimized(false);
                  setLoading(false);
                  setStatus('');
                }
              }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-4 bg-[#050816]/90 backdrop-blur-sm overflow-y-auto text-white no-print cursor-pointer" 
              key="maximized-modal"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1440px] bg-[#0a0e23] md:border md:border-white/10 rounded-none md:rounded-2xl flex flex-col h-full md:h-[90vh] max-h-screen md:max-h-[calc(100vh-2rem)] relative shadow-2xl overflow-hidden cursor-default"
                role="dialog"
                aria-modal="true"
                aria-labelledby="resume-modal-title"
              >
                {/* Decorative side lights */}
                <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                {/* Modal Header */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between z-10 shrink-0 bg-[#0c1433]/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 id="resume-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                        {language === 'en' ? 'Personalized AI Resume Assistant' : language === 'hi' ? 'व्यक्तिगत एआई बायोडाटा सहायक' : language === 'fr' ? 'Assistant de CV IA personnalisé' : 'Personalisierter KI-Lebenslauf-Assistent'}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">
                        {language === 'en' ? `Formulating resume in your active locale: ${currentLanguageName}` : language === 'hi' ? `आपकी सक्रिय भाषा में जैव-डेटा: ${currentLanguageName}` : language === 'fr' ? `Formulation du CV en locale active: ${currentLanguageName}` : `Lebenslauf-Erstellung auf: ${currentLanguageName}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Minimize Button */}
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold select-none group"
                      title={language === 'en' ? 'Minimize' : language === 'hi' ? 'छोटा करें' : 'Minimiser'}
                      aria-label="Minimize"
                    >
                      <Minus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="hidden sm:inline">
                        {language === 'en' ? 'Minimize' : language === 'hi' ? 'छोटा करें' : 'Minimiser'}
                      </span>
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setIsMinimized(false);
                        setLoading(false);
                        setStatus('');
                      }}
                      className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg text-rose-400 hover:text-rose-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold select-none group"
                      aria-label="Close dialog"
                    >
                      <X className="w-4 h-4 text-rose-400 group-hover:text-rose-300 transition-colors" />
                      <span>
                        {language === 'en' ? 'Close' : language === 'hi' ? 'बंद करें' : 'Fermer'}
                      </span>
                    </button>
                  </div>
                </div>

              {/* Loader / Content Splitter */}
              <div className="flex-1 overflow-y-auto md:overflow-hidden p-6 md:p-8 flex flex-col min-h-0 bg-[#06091c]">
                {loading || (status && !status.startsWith('Error:')) ? (
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
                    
                    {/* Explicit exit actions directly on the loading screen */}
                    <div className="flex flex-wrap items-center gap-3 justify-center pt-2 select-none z-20">
                      <button
                        onClick={() => setIsMinimized(true)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-400" />
                        {language === 'en' ? 'Minimize Window' : language === 'hi' ? 'छोटा करें' : 'Minimiser'}
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setIsMinimized(false);
                          setLoading(false);
                          setStatus('');
                        }}
                        className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <X className="w-3.5 h-3.5 text-rose-400" />
                        {language === 'en' ? 'Cancel & Close' : language === 'hi' ? 'रद्द करें और बंद करें' : 'Annuler'}
                      </button>
                    </div>
                  </div>
                ) : resumeData ? (
                  <div className="flex flex-col md:flex-row gap-6 h-full min-h-0 overflow-y-auto md:overflow-hidden">
                    
                    {/* Lateral Controls Panel */}
                    <div className="md:w-64 space-y-5 shrink-0 flex flex-col md:justify-start justify-between md:overflow-y-auto md:max-h-full pr-1 md:pb-4">
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
                            disabled={pdfGenerating}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
                            aria-label="Directly print or save the selectable-text vector PDF"
                          >
                            <Printer className="w-4 h-4" />
                            {language === 'en' ? 'Print / Save Vector PDF' : language === 'hi' ? 'प्रिंट / सेव वेक्टर पीडीएफ' : language === 'fr' ? 'Imprimer / Sauvegarder PDF' : 'Drucken / Vektor-PDF speichern'}
                          </button>

                          <button
                            onClick={handleDownloadPDF}
                            disabled={pdfGenerating}
                            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/15 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                            aria-label="Download the resume instantly"
                          >
                            {pdfGenerating ? (
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            {pdfGenerating 
                              ? (language === 'hi' ? 'तैयार किया जा रहा है...' : 'Generating PDF...') 
                              : (language === 'en' ? 'Direct PDF Download' : language === 'hi' ? 'सीधा पीडीएफ डाउनलोड' : language === 'fr' ? 'Téléchargement PDF direct' : 'Direkter PDF-Download')
                            }
                          </button>

                          {pdfStatus && (
                            <div className="text-[10px] text-indigo-400 font-semibold animate-pulse text-center mt-1">
                              {pdfStatus}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              setIsOpen(false);
                              setIsMinimized(false);
                            }}
                            className="w-full py-2.5 px-4 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                            aria-label="Close resume assistant"
                          >
                            <X className="w-4 h-4 text-rose-400" />
                            {language === 'en' ? 'Close Assistant' : language === 'hi' ? 'सहायक बंद करें' : language === 'fr' ? 'Fermer l\'assistant' : 'Assistent schließen'}
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
                    <div className="flex-1 overflow-y-auto bg-[#03050c]/85 text-slate-800 rounded-xl p-3 md:p-6 border border-white/5 shadow-2xl flex flex-col items-center" style={{ maxHeight: '100%' }}>
                      <div id="resume-pdf-render-root" className="bg-white text-slate-800 antialiased leading-relaxed max-w-[820px] w-full shadow-2xl rounded-xl border border-slate-100 p-6 md:p-12 shrink-0 my-2 h-auto" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', minHeight: '297mm' }}>
                        
                        {/* Header Area */}
                        <div id="resume-header-block" className="text-center pb-5 mb-5 border-b-2 border-blue-900" data-pdf-block="true">
                          <h1 className="text-2xl font-black text-blue-900 tracking-tight uppercase m-0 leading-tight">
                            {resumeData.personalInfo?.name || 'Sankalp Suman'}
                          </h1>
                          <div className="text-xs font-semibold text-gray-600 uppercase tracking-widest mt-1">
                            {resumeData.personalInfo?.title || 'QA Lead & Scrum Master'}
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-3 text-[10px] text-indigo-700 font-medium mt-3">
                            {resumeData.personalInfo?.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${resumeData.personalInfo.email}`} className="underline text-indigo-700 hover:text-indigo-900">{resumeData.personalInfo.email}</a></span>}
                            {resumeData.personalInfo?.phone && <span className="flex items-center gap-1">☎ {resumeData.personalInfo.phone}</span>}
                            {resumeData.personalInfo?.location && <span className="flex items-center gap-1">📍 {resumeData.personalInfo.location}</span>}
                            {resumeData.personalInfo?.yearsOfExperience && <span className="flex items-center gap-1">⏱ {resumeData.personalInfo.yearsOfExperience}</span>}
                            {resumeData.personalInfo?.languages && resumeData.personalInfo.languages.length > 0 && (
                              <span className="flex items-center gap-1">💬 {resumeData.personalInfo.languages.join(', ')}</span>
                            )}
                            {resumeData.personalInfo?.linkedin && (
                              <span className="flex items-center gap-1">
                                🔗 <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-900">{resumeData.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>
                              </span>
                            )}
                            {resumeData.personalInfo?.github && (
                              <span className="flex items-center gap-1">
                                ⚙ <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-900">{resumeData.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a>
                              </span>
                            )}
                            {resumeData.personalInfo?.website && (
                              <span className="flex items-center gap-1">
                                🌐 <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-900">{resumeData.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</a>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Summary Block */}
                        {resumeData.personalInfo?.summary && (
                          <div id="resume-summary-block" className="mb-5 text-justify italic text-slate-700 text-[10.5px] leading-relaxed" data-pdf-block="true">
                            {resumeData.personalInfo.summary}
                          </div>
                        )}

                        {/* Technical Competencies Category */}
                        {resumeData.skills && resumeData.skills.length > 0 && (
                          <div id="resume-skills-block" className="mb-5" data-pdf-block="true">
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
                            <div className="mb-2" data-pdf-block="true">
                              <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 uppercase tracking-wide">
                                {language === 'en' ? 'Professional Experience' : language === 'hi' ? 'व्यावसायिक अनुभव' : language === 'fr' ? 'Expérience professionnelle' : 'Berufserfahrung'}
                              </h2>
                            </div>
                            <div className="space-y-4">
                              {resumeData.experience.map((exp: any, index: number) => (
                                <div key={index} className="space-y-1 mb-4" data-pdf-block="true">
                                  <div className="flex justify-between items-start gap-4 font-bold text-[11px] text-slate-900 w-full">
                                    <span>{exp.role}</span>
                                    <span className="text-right shrink-0">{exp.company}</span>
                                  </div>
                                  <div className="flex justify-between text-[9.5px] text-slate-500 italic w-full">
                                    <span>{exp.period}</span>
                                    <span className="text-right shrink-0">{exp.location || ''}</span>
                                  </div>
                                  <div className="space-y-1 mt-1 text-[10px] text-slate-600 font-normal">
                                    {exp.bullets.map((bullet: string, bIdx: number) => {
                                      const cleaned = bullet.replace(/^[\s*•-]+\s*/, '');
                                      return (
                                        <table key={bIdx} className="w-full border-collapse border-none m-0 p-0 table-fixed" style={{ borderCollapse: 'collapse', border: 'none' }}>
                                          <tbody>
                                            <tr style={{ verticalAlign: 'top', border: 'none' }}>
                                              <td style={{ width: '12px', verticalAlign: 'top', padding: '1px 2px 0 0', margin: 0 }} className="text-blue-900 font-bold shrink-0 select-none text-[11px] leading-tight">•</td>
                                              <td style={{ verticalAlign: 'top', padding: 0, margin: 0 }} className="leading-normal text-justify text-slate-600 text-[10px]">{cleaned}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Highlighted Case Studies & Projects */}
                        {resumeData.projects && resumeData.projects.length > 0 && (
                          <div className="mb-5">
                            <div className="mb-2" data-pdf-block="true">
                              <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 uppercase tracking-wide">
                                {language === 'en' ? 'Projects & Showcases' : language === 'hi' ? 'प्रमुख परियोजनाएं' : language === 'fr' ? 'Projets' : 'Ausgewählte Projekte'}
                              </h2>
                            </div>
                            <div className="space-y-3.5">
                              {resumeData.projects.map((proj: any, index: number) => {
                                const hasValidLink = proj.link && proj.link.trim() !== '' && proj.link.trim().toLowerCase() !== 'n/a';
                                return (
                                  <div key={index} className="space-y-1 mb-3.5" data-pdf-block="true">
                                    <div className="flex justify-between items-baseline gap-4 font-bold text-[11px] text-slate-900 w-full">
                                      <span className="text-slate-900 font-bold">{proj.name}</span>
                                      {hasValidLink && (
                                        <span className="text-[9.5px] text-indigo-700 font-medium underline hover:text-indigo-950 shrink-0 max-w-[45%] truncate text-right whitespace-nowrap">
                                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-900">
                                            {cleanDisplayUrl(proj.link)}
                                          </a>
                                          <span className="ml-1 select-none">↗</span>
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-start gap-4 text-[9px] text-slate-500 italic w-full">
                                      <span>{proj.role || 'Contributor'}</span>
                                      <span className="text-right shrink-0 max-w-[60%] truncate">{proj.techStack ? proj.techStack.join(' | ') : ''}</span>
                                    </div>
                                      <div className="space-y-1 mt-1 text-[10px] text-slate-600 font-normal">
                                        {proj.description.split('\n').map((line: string, lIdx: number) => {
                                          const cleaned = line.replace(/^[\s*•-]+\s*/, '').trim();
                                          if (!cleaned) return null;
                                          // If original text wasn't bulleted and is just a single paragraph, don't force a bullet unless it had one
                                          const isBulleted = proj.description.includes('•') || proj.description.includes('- ') || proj.description.split('\n').length > 1;
                                          return isBulleted ? (
                                            <table key={lIdx} className="w-full border-collapse border-none m-0 p-0 table-fixed" style={{ borderCollapse: 'collapse', border: 'none' }}>
                                              <tbody>
                                                <tr style={{ verticalAlign: 'top', border: 'none' }}>
                                                  <td style={{ width: '12px', verticalAlign: 'top', padding: '1px 2px 0 0', margin: 0 }} className="text-blue-900 font-bold shrink-0 select-none text-[11px] leading-tight">•</td>
                                                  <td style={{ verticalAlign: 'top', padding: 0, margin: 0 }} className="leading-normal text-justify text-slate-600 text-[10px]">{cleaned}</td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          ) : (
                                            <p key={lIdx} className="text-[10px] m-0 text-slate-600 text-justify leading-relaxed">
                                              {cleaned}
                                            </p>
                                          );
                                        })}
                                      </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Education Details */}
                        {resumeData.education && resumeData.education.length > 0 && (
                          <div className="mb-5">
                            <div className="mb-2" data-pdf-block="true">
                              <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 uppercase tracking-wide">
                                {language === 'en' ? 'Education' : language === 'hi' ? 'शिक्षा' : language === 'fr' ? 'Éducation' : 'Ausbildung'}
                              </h2>
                            </div>
                            <div className="space-y-2.5">
                              {resumeData.education.map((edu: any, index: number) => (
                                <div key={index} className="flex justify-between items-start gap-4 text-[10px] text-slate-750 mb-2.5 w-full" data-pdf-block="true">
                                  <div>
                                    <span className="font-bold text-slate-900">{edu.degree}</span> • <span className="italic text-slate-600">{edu.institution}</span>
                                  </div>
                                  <div className="text-right shrink-0 text-slate-500 font-mono text-[9px] pt-0.5">
                                    {edu.period} {edu.grade ? `(${edu.grade})` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Certifications Block */}
                        {resumeData.certifications && resumeData.certifications.length > 0 && (
                          <div id="resume-certifications-block" className="mb-5" data-pdf-block="true">
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
                          <div id="resume-achievements-block" className="mb-5" data-pdf-block="true">
                            <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                              {language === 'en' ? 'Key Achievements & Impact' : language === 'hi' ? 'प्रमुख उपलब्धियां' : language === 'fr' ? 'Réalisations clés' : 'Wichtigste Erfolge'}
                            </h2>
                            <div className="space-y-1 mt-1 text-[10px] text-slate-600 font-normal">
                              {resumeData.achievements.map((ach: string, index: number) => {
                                const cleaned = ach.replace(/^[\s*•-]+\s*/, '');
                                return (
                                  <table key={index} className="w-full border-collapse border-none m-0 p-0 table-fixed" style={{ borderCollapse: 'collapse', border: 'none' }}>
                                    <tbody>
                                      <tr style={{ verticalAlign: 'top', border: 'none' }}>
                                        <td style={{ width: '12px', verticalAlign: 'top', padding: '1px 2px 0 0', margin: 0 }} className="text-blue-900 font-bold shrink-0 select-none text-[11px] leading-tight">•</td>
                                        <td style={{ verticalAlign: 'top', padding: 0, margin: 0 }} className="leading-normal text-justify text-slate-600 text-[10px]">{cleaned}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Endorsements & Recommendations */}
                        {resumeData.testimonials && resumeData.testimonials.length > 0 && (
                          <div id="resume-testimonials-block" className="mb-5" data-pdf-block="true">
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
                              <div key={index} className="mb-5" data-pdf-block="true">
                                <h2 className="text-xs font-bold text-blue-900 border-b border-slate-300 pb-0.5 mb-2 uppercase tracking-wide">
                                  {sec.title}
                                </h2>
                                <div className="space-y-1 mt-1 text-[10px] text-slate-600 font-normal">
                                  {sec.bullets.map((bullet: string, bIdx: number) => {
                                    const cleaned = bullet.replace(/^[\s*•-]+\s*/, '');
                                    return (
                                      <table key={bIdx} className="w-full border-collapse border-none m-0 p-0 table-fixed" style={{ borderCollapse: 'collapse', border: 'none' }}>
                                        <tbody>
                                          <tr style={{ verticalAlign: 'top', border: 'none' }}>
                                            <td style={{ width: '12px', verticalAlign: 'top', padding: '1px 2px 0 0', margin: 0 }} className="text-blue-900 font-bold shrink-0 select-none text-[11px] leading-tight">•</td>
                                            <td style={{ verticalAlign: 'top', padding: 0, margin: 0 }} className="leading-normal text-justify text-slate-600 text-[10px]">{cleaned}</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                    <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce shrink-0" />
                    <div className="space-y-2 max-w-md">
                      <h4 className="text-sm font-bold text-white">{language === 'en' ? 'Resume Generation Failed' : 'बायोडाटा जनरेशन विफल रहा'}</h4>
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <p className="text-[11px] font-mono text-rose-300 leading-relaxed text-left break-all select-all">
                          {status ? status.replace(/^Error:\s*/i, '') : 'Unknown Server Error occurred.'}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {language === 'en' 
                          ? "Vercel's Serverless Hobby tier enforces a strict 10-second limit. If you updated environment keys in your settings, click 'Redeploy' on your Vercel Dashboard to apply changes, as Vercel does not automatically inject variables into older deployments."
                          : "वर्सेल (Vercel) के मुफ़्त टियर पर १० सेकंड की समय सीमा होती है। यदि आपने सेटिंग्स में चाबियां अपडेट की हैं, तो बदलाव लागू करने के लिए वर्सेल डैशबोर्ड पर 'Redeploy' पर क्लिक करें।"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                      <button
                        onClick={handleGenerateResume}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all select-none cursor-pointer shadow-md shadow-blue-500/20"
                      >
                        {language === 'en' ? 'Retry Generation' : 'पुनः प्रयास करें'}
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setIsMinimized(false);
                          setStatus('');
                        }}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-350 hover:text-white text-xs font-bold rounded-xl transition-all select-none cursor-pointer border border-white/10"
                      >
                        {language === 'en' ? 'Close Window' : 'विंडो बंद करें'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          ) : (
            /* Floating minimized round widget (FAB) at bottom-left */
            <motion.div
              key="minimized-widget"
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.8 }}
              onClick={() => setIsMinimized(false)}
              className="fixed bottom-6 left-6 z-[130] w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#0c1433] to-[#070b1e] border-2 border-blue-500/40 hover:border-blue-400 shadow-2xl rounded-full flex items-center justify-center text-white no-print cursor-pointer group hover:scale-105 transition-all outline-none"
              title={language === 'en' ? 'AI Resume Creator (Click to restore)' : 'एआई बायोडाटा सहायक (खोलने के लिए क्लिक करें)'}
            >
              {/* Dismiss / Close Badge Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="absolute -top-1 -right-1 p-1 bg-[#0f172a] hover:bg-slate-800 border border-white/10 rounded-full text-gray-400 hover:text-white shadow-lg transition-transform hover:scale-110 z-10 cursor-pointer w-5 h-5 flex items-center justify-center"
                title={language === 'en' ? 'Dismiss' : 'बंद करें'}
                aria-label="Dismiss resume assistant"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Loader / Ready State Icon */}
              <div className="relative w-10 h-10 flex items-center justify-center select-none">
                {loading ? (
                  <>
                    <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-indigo-500 rounded-full animate-spin"></div>
                    <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                    <FileText className="w-5 h-5 text-green-400 animate-bounce" />
                  </>
                )}
              </div>

              {/* Interactive Tooltip Badge (visible on hover / slide in) */}
              <div className="absolute left-16 sm:left-20 bg-[#0a0e23] border border-blue-500/30 rounded-xl py-1.5 px-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden xs:block whitespace-nowrap">
                <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                  {loading ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>{language === 'en' ? 'Formulating Resume...' : 'बायोडाटा तैयार किया जा रहा है...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-400">{language === 'en' ? 'AI Resume Ready! Click to download' : 'बायोडाटा तैयार है! डाउनलोड करें'}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Limit Exceeded / Retry Popup Modal */}
      <AnimatePresence>
        {showLimitPopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#02040a]/85 backdrop-blur-md" key="limit-popup">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0b0f19] border border-red-500/30 rounded-3xl p-6 sm:p-8 relative shadow-[0_0_50px_rgba(239,68,68,0.15)] text-white"
            >
              {/* Top corner accents */}
              <div className="absolute top-4 left-4 border-t border-l border-red-500/20 w-4 h-4"></div>
              <div className="absolute top-4 right-4 border-t border-r border-red-500/20 w-4 h-4"></div>

              <div className="flex flex-col items-center text-center space-y-5">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 animate-pulse">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {language === 'en' ? 'Gemini API Limit Exceeded' : 'जेमिनी एपीआई सीमा पार हो गई'}
                  </h3>
                  <p className="text-[10px] font-mono text-red-400 font-semibold tracking-wider">
                    ALL 10 GEMINI MODELS EXHAUSTED
                  </p>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed text-center">
                  We automatically attempted execution across all 10 available Gemini models from highest tier to lightest fallback, but each returned rate limit restrictions (429) or timed out due to high free-tier API demand.
                </p>

                {/* Model pipeline visualization */}
                <div className="w-full bg-[#070b13] border border-white/5 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  <p className="text-[10px] font-mono font-bold text-gray-400 text-left uppercase tracking-wider">
                    Model Trial Sequence Status:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-left">
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-3.5-pro</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-3.5-flash</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-3.1-pro</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-3.1-flash</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-3.1-flash-lite</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-2.5-pro</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-2.5-flash</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-2.5-flash-lite</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-2.5-flash-image</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 line-through">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                      <span>gemini-nano</span>
                    </div>
                  </div>
                </div>

                <div className="w-full flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowLimitPopup(false);
                      handleGenerateResume();
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    {language === 'en' ? 'Retry Generation' : 'पुनः प्रयास करें'}
                  </button>
                  <button
                    onClick={() => setShowLimitPopup(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer border border-white/5"
                  >
                    {language === 'en' ? 'Dismiss' : 'बंद करें'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
