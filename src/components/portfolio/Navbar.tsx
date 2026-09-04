import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Sparkles, Globe, Linkedin, Github, ArrowUp, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDocument } from '../../services/firestoreService';
import { throttle } from '../../lib/performance';
import { useLanguage } from '../../hooks/useLanguage';
import { AIResumeModal } from './AIResumeModal';
import { InstallPWAButton } from '../pwa/InstallPWAButton';

const NAV_LINKS = [
  { label: 'ABOUT', href: '/#about', type: 'anchor', key: 'about' },
  { label: 'JOURNEY', href: '/#career-journey', type: 'anchor', key: 'journey' },
  { label: 'TOOLKIT', href: '/#skills', type: 'anchor', key: 'toolkit' },
  { label: 'AI QA', href: '/#ai-playground', type: 'anchor', key: 'ai_qa' },
  { label: 'PROJECTS', href: '/#projects', type: 'anchor', key: 'projects' },
  { label: 'BLOG', href: '/blog', type: 'link', key: 'blog' },
  { label: 'NOW', href: '/now', type: 'link', key: 'now' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'HI' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'de', label: 'Deutsch', short: 'DE' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSettings() {
      const settings = await getDocument<any>('settings/global');
      if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrolled(window.scrollY > 20);
    }, 100);

    // Set scroll status immediately on mount
    setScrolled(window.scrollY > 20);

    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -40% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isNavigating) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (location.pathname === '/' || location.pathname === `/${language}`) {
      const sections = ['hero', 'about', 'career-journey', 'skills', 'ai-playground', 'projects', 'contact'];
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [location.pathname, isNavigating, language]);

  const scrollToAnchor = useCallback((e: React.MouseEvent, href: string) => {
    const targetId = href.includes('#') ? href.split('#')[1] : '';
    if (!targetId) return;

    if (location.pathname === '/' || location.pathname === `/${language}`) {
      e.preventDefault();
      
      // Dispatch event to force LazySection to mount immediately before scrolling
      window.dispatchEvent(new CustomEvent('force-section-visible', { detail: targetId }));

      // Use a short timeout to allow React to mount the section if it was lazy
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          setIsNavigating(true);
          setActiveSection(targetId);
          
          // Calculate exact position with offset for fixed navbar
          const navHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - navHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          window.history.pushState(null, '', href);
          setTimeout(() => setIsNavigating(false), 1000);
        }
      }, 50);

      setMobileMenuOpen(false);
    } else {
      e.preventDefault();
      navigate(href);
      setMobileMenuOpen(false);
    }
  }, [location.pathname, language, navigate]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <nav 
        className={cn(
          "fixed top-0 left-0 w-full z-[100] transition-all duration-300 py-2.5 sm:py-3 px-3 sm:px-6"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="w-full flex items-center justify-between px-3 sm:px-4 py-2 rounded-full border border-white/10 bg-[#0b0f19]/85 backdrop-blur-2xl shadow-2xl shadow-black/60 transition-all duration-300 gap-2"
          >
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group relative shrink-0 py-0.5"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(37,99,235,0.4)] overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <div className="hidden min-[380px]:flex flex-col leading-none">
                <span className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">Sankalp</span>
                <span className="text-[8px] font-mono text-blue-400 uppercase tracking-[0.2em] mt-0.5">QA & AI Lead</span>
              </div>
            </Link>

            {/* 1. DESKTOP LAYOUT (lg+: Full horizontally distributed link list) */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 mx-auto">
              {NAV_LINKS.map((link) => {
                const isActive = link.type === 'anchor' 
                  ? activeSection === link.href.split('#')[1] && (location.pathname === '/' || location.pathname === `/${language}`)
                  : location.pathname === link.href || location.pathname === `/${language}${link.href}`;

                return (
                  <Link 
                    key={link.key}
                    to={link.href}
                    onClick={(e) => link.type === 'anchor' ? scrollToAnchor(e, link.href) : undefined}
                    className={cn(
                      "relative px-3 xl:px-4 py-1.5 text-[10px] xl:text-[11px] font-bold transition-all uppercase tracking-wider rounded-full flex items-center justify-center group whitespace-nowrap shrink-0",
                      isActive ? "text-white font-extrabold" : "text-slate-400 hover:text-white"
                    )}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-bg"
                          className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-full -z-10 shadow-sm shadow-blue-500/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{t(`nav.${link.key}`)}</span>
                    {isActive && (
                      <motion.span 
                        layoutId="active-nav-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* 2. TABLET LAYOUT (md to lg: Compact centered pill navigation strip) */}
            <div className="hidden md:flex lg:hidden items-center justify-center gap-0.5 bg-white/5 border border-white/10 rounded-full px-2 py-1 mx-auto max-w-fit shadow-inner">
              {NAV_LINKS.map((link) => {
                const isActive = link.type === 'anchor' 
                  ? activeSection === link.href.split('#')[1] && (location.pathname === '/' || location.pathname === `/${language}`)
                  : location.pathname === link.href || location.pathname === `/${language}${link.href}`;

                return (
                  <Link 
                    key={link.key}
                    to={link.href}
                    onClick={(e) => link.type === 'anchor' ? scrollToAnchor(e, link.href) : undefined}
                    className={cn(
                      "px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full transition-all whitespace-nowrap shrink-0",
                      isActive 
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-600/40 font-extrabold" 
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Quick Scroll To Top Trigger in Header when Scrolled */}
              <AnimatePresence>
                {scrolled && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-blue-600/40 border border-blue-400/30 transition-all group cursor-pointer"
                    title="Scroll to Top"
                    aria-label="Scroll to Top"
                  >
                    <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform shrink-0 stroke-[2.5]" />
                    <span className="text-[10px] font-extrabold tracking-wider">TOP</span>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Social Icons & Resume (Desktop XL) */}
              <div className="hidden xl:flex items-center gap-1 border-r border-white/10 pr-2">
                {logoUrl && <AIResumeModal />}
                <a 
                  href="https://linkedin.com/in/sankalpsuman" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                  title="LinkedIn Profile"
                >
                   <Linkedin className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="https://github.com/sankalpsuman" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                  title="GitHub Profile"
                >
                   <Github className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Language Selector */}
              <div className="hidden sm:block relative">
                <button 
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-white/10 rounded-full transition-all text-[10px] font-bold uppercase tracking-wider text-slate-300 group whitespace-nowrap"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <span>{LANGUAGES.find(l => l.code === language)?.short}</span>
                </button>
                
                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-36 glass-card rounded-2xl overflow-hidden p-1.5 z-50 border border-white/15 shadow-2xl bg-[#0b0f19]"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setLangDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-left text-[10px] font-bold transition-all flex items-center justify-between uppercase tracking-wider",
                            language === lang.code ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PWA Install Button */}
              <InstallPWAButton variant="navbar" className="hidden sm:inline-flex" />

              {/* Inquire Button */}
              <Link 
                to="/#contact"
                onClick={(e) => scrollToAnchor(e, '/#contact')}
                className="hidden sm:inline-flex items-center justify-center px-3.5 sm:px-4 py-1.5 rounded-full font-black uppercase tracking-wider text-[10px] sm:text-[11px] bg-white text-slate-950 hover:bg-blue-400 hover:text-white transition-all shadow-md whitespace-nowrap shrink-0"
              >
                {t('nav.inquire')}
              </Link>

              {/* Mobile & Tablet Hamburger Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Side Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="lg:hidden fixed top-0 right-0 bottom-0 w-[75vw] max-w-[280px] z-[201] bg-[#040710] border-l border-white/10 shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-[0.2em]">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Links List - Staggered */}
                <div className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-0.5">
                  {NAV_LINKS.map((link, i) => {
                    const isActive = link.type === 'anchor' 
                      ? activeSection === link.href.split('#')[1] && (location.pathname === '/' || location.pathname === `/${language}`)
                      : location.pathname === link.href || location.pathname === `/${language}${link.href}`;

                    return (
                      <motion.div
                        key={link.key}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link 
                          to={link.href}
                          onClick={(e) => {
                            if (link.type === 'anchor') {
                              scrollToAnchor(e, link.href);
                            } else {
                              setMobileMenuOpen(false);
                            }
                          }}
                          className={cn(
                            "group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                            isActive ? "bg-blue-600/10 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-bold uppercase tracking-widest transition-colors",
                            isActive ? "text-blue-400" : "text-slate-300 group-hover:text-white"
                          )}>
                            {t(`nav.${link.key}`)}
                          </span>
                          {isActive ? (
                            <motion.div layoutId="mobile-active-nav-dot" className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_6px_#60a5fa]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bento Footer */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 border-t border-white/5 bg-[#02040a] flex flex-col gap-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                      <span className="text-[9px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <Globe className="w-3 h-3 text-blue-400" /> Lang
                      </span>
                      <div className="flex gap-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as any)}
                            className={cn(
                              "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                              language === lang.code 
                                ? "bg-blue-600 text-white" 
                                : "text-slate-400 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {lang.short}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 flex justify-center">
                      <div className="scale-90 origin-center">
                        <InstallPWAButton variant="mobile-menu" />
                      </div>
                    </div>

                    <Link 
                      to="/#contact"
                      onClick={(e) => scrollToAnchor(e, '/#contact')}
                      className="col-span-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-black uppercase tracking-widest text-[9px] text-center shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center"
                    >
                      {t('nav.inquire')}
                    </Link>
                    
                    {logoUrl && (
                      <div className="col-span-1 [&>button]:w-full [&>button]:h-full [&>button]:py-2 [&>button]:px-2 [&>button]:text-[9px] [&>button]:rounded-lg [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:border [&>button]:border-white/10">
                        <AIResumeModal />
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Floating Bottom-Left Scroll-To-Top Quick Trigger Button (Portaled directly to document.body) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {scrolled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToTop}
              className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[99999] px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-600/50 border border-blue-400/30 backdrop-blur-md cursor-pointer group hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 font-black text-xs uppercase tracking-wider pointer-events-auto"
              title="Jump to Top"
              aria-label="Jump to Top"
            >
              <ArrowUp className="w-4 h-4 stroke-[3] group-hover:-translate-y-0.5 transition-transform" />
              <span>TOP</span>
            </motion.button>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
