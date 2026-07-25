import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Sparkles, Globe, Linkedin, Github } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDocument } from '../../services/firestoreService';
import { throttle } from '../../lib/performance';
import { useLanguage } from '../../hooks/useLanguage';
import { AIResumeModal } from './AIResumeModal';

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
      const element = document.getElementById(targetId);
      if (element) {
        setIsNavigating(true);
        setActiveSection(targetId);
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
        setTimeout(() => setIsNavigating(false), 1000);
      }
      setMobileMenuOpen(false);
    } else {
      e.preventDefault();
      navigate(href);
      setMobileMenuOpen(false);
    }
  }, [location.pathname, language, navigate]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        scrolled ? "py-4" : "py-8"
      )}
    >
      <div className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-500 flex items-center justify-between",
        scrolled && "max-w-4xl"
      )}>
        <div className={cn(
          "w-full flex items-center justify-between px-4 py-2 transition-all duration-500",
          scrolled ? "glass-card rounded-full" : "bg-transparent"
        )}>
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group relative px-3 py-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Cpu className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={cn("flex flex-col transition-all duration-500", scrolled ? "w-0 opacity-0 -ml-4" : "opacity-100")}>
              <span className="text-sm font-black text-white tracking-tighter uppercase leading-none">Sankalp</span>
              <span className="text-[8px] font-mono text-blue-400 uppercase tracking-[0.2em] leading-none mt-1">QA Engine</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className={cn(
            "hidden lg:flex items-center",
            scrolled ? "gap-0.5" : "gap-1"
          )}>
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
                    "relative px-4 py-2.5 text-[10px] font-black transition-all uppercase tracking-[0.15em] rounded-full flex items-center justify-center group",
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-bg"
                        className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-full -z-10"
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
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pl-2">
            <div className={cn(
              "hidden md:flex items-center gap-1 border-r border-white/10 pr-2 transition-all",
              scrolled ? "gap-0" : "gap-1"
            )}>
               {logoUrl && <AIResumeModal />}
               <a 
                 href="https://linkedin.com/in/sankalpsuman" 
                 target="_blank" 
                 rel="noreferrer"
                 className="p-2.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95"
               >
                  <Linkedin className="w-4 h-4" />
               </a>
               <a 
                 href="https://github.com/sankalpsuman" 
                 target="_blank" 
                 rel="noreferrer"
                 className="p-2.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95"
               >
                  <Github className="w-4 h-4" />
               </a>
            </div>

            <div className="hidden lg:block relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest text-slate-300 group"
              >
                <Globe className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span>{LANGUAGES.find(l => l.code === language)?.short}</span>
              </button>
              
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-40 glass-card rounded-3xl overflow-hidden p-2 z-50 border border-white/10 shadow-2xl"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setLangDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 rounded-2xl text-left text-[11px] font-black transition-all flex items-center justify-between uppercase tracking-widest",
                          language === lang.code ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link 
              to="/#contact"
              onClick={(e) => scrollToAnchor(e, '/#contact')}
              className={cn(
                "hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-black transition-all uppercase tracking-[0.2em] text-[10px] border",
                scrolled 
                  ? "bg-white text-space-950 border-white hover:bg-transparent hover:text-white" 
                  : "bg-blue-600 text-white border-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-transparent hover:shadow-none"
              )}
            >
              {t('nav.inquire')}
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-slate-300 hover:text-white bg-white/5 rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-24 left-4 right-4 glass-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl z-50"
          >
            <div className="p-8 space-y-6">
              {NAV_LINKS.map((link) => (
                <Link 
                  key={link.key}
                  to={link.href}
                  onClick={(e) => link.type === 'anchor' ? scrollToAnchor(e, link.href) : setMobileMenuOpen(false)}
                  className="block py-2 text-lg font-black uppercase tracking-[0.2em] text-slate-300 hover:text-blue-400 transition-colors"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Language</span>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        language === lang.code ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
