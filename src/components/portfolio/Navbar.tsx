import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { getDocument } from '../../services/firestoreService';
import { throttle } from '../../lib/performance';
import { useLanguage } from '../../hooks/useLanguage';

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
      rootMargin: '-50% 0px -40% 0px', // More centered detection for active section
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isNavigating) return;
      entries.forEach((entry) => {
        // We only update if the user isn't actively clicking a nav link
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Only observe if we are on the home page
    if (location.pathname === '/') {
      // Observe all logical sections
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
  }, [location.pathname]);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      
      // Dispatch custom event to mount the lazy-loaded section immediately
      window.dispatchEvent(new CustomEvent('force-section-visible', { detail: targetId }));

      if (location.pathname === '/') {
        e.preventDefault();
        
        // Slight delay to allow the LazySection to mount the child in DOM
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            setIsNavigating(true);
            setActiveSection(targetId);
            element.scrollIntoView({ behavior: 'smooth' });
            
            // Sync address bar hash without full page reload
            window.history.pushState(null, '', `/#${targetId}`);

            setTimeout(() => setIsNavigating(false), 1000);
          }
        }, 60);
        
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500",
        scrolled ? "py-4 bg-[#050816]/70 backdrop-blur-xl border-b border-white/5" : "py-8 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group relative">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Cpu className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Sankalp</span>
            <span className="text-[10px] font-mono text-brand uppercase tracking-[0.2em] leading-none mt-1">QA Architecture</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1 p-1 bg-white/2 backdrop-blur-md rounded-2xl border border-white/5">
          {NAV_LINKS.map((link) => {
            const isActive = link.type === 'anchor' 
              ? activeSection === link.href.substring(2)
              : location.pathname === link.href;

            const localizedLabel = t(`nav.${link.key}`);

            return link.type === 'anchor' ? (
              <a 
                key={link.label}
                href={link.href}
                onClick={(e) => scrollToAnchor(e, link.href)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold transition-all uppercase tracking-[0.1em] rounded-xl flex items-center gap-1.5",
                  isActive ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-gray-400 hover:text-white"
                )}
              >
                {isActive && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                {localizedLabel}
              </a>
            ) : (
              <Link 
                key={link.label}
                to={link.href}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold transition-all uppercase tracking-[0.1em] rounded-xl flex items-center gap-1.5",
                  isActive ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                {localizedLabel}
              </Link>
            );
          })}
        </div>

        {/* CTA & Language Selector */}
        <div className="hidden lg:flex items-center gap-3">
           {/* Desktop Language Selector */}
           <div className="relative">
             <button 
               id="lang-selector-desktop"
               onClick={() => setLangDropdownOpen(!langDropdownOpen)}
               className="flex items-center gap-2 px-3 py-2 bg-white/5 text-gray-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10"
             >
               <Globe className="w-3.5 h-3.5 text-brand animate-pulse" />
               <span>{LANGUAGES.find(l => l.code === language)?.label || 'English'}</span>
               <ChevronDown className={cn("w-3 h-3 opacity-60 transition-transform", langDropdownOpen && "rotate-180")} />
             </button>
             
             <AnimatePresence>
               {langDropdownOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                   <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     transition={{ duration: 0.15 }}
                     className="absolute right-0 mt-2 w-40 bg-[#050816]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-1.5 space-y-1"
                   >
                     {LANGUAGES.map((lang) => (
                       <button
                         key={lang.code}
                         id={`lang-opt-${lang.code}`}
                         onClick={() => {
                           setLanguage(lang.code as any);
                           setLangDropdownOpen(false);
                         }}
                         className={cn(
                           "w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                           language === lang.code 
                             ? "bg-brand text-white shadow-md shadow-brand/20" 
                             : "text-gray-400 hover:text-white hover:bg-white/5"
                         )}
                       >
                         <span>{lang.label}</span>
                         {language === lang.code && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                       </button>
                     ))}
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
           </div>

           <a 
              href="/#contact" 
              onClick={(e) => scrollToAnchor(e, '/#contact')}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-xl transition-all uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95"
           >
              {t('nav.inquire')}
              <Sparkles className="w-3 h-3 text-brand" />
           </a>
        </div>

        {/* Mobile Action Buttons (Language Selector dropdown & Mobile menu toggle) */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile Language Button */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="p-3 bg-white/5 hover:bg-white/10 text-brand rounded-xl border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none"
              title="Change Language / भाषा बदलें / Changer de langue / Sprache ändern"
            >
              <Globe className="w-4 h-4 text-brand" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {language === 'en' ? 'EN' : language === 'hi' ? 'HI' : language === 'fr' ? 'FR' : 'DE'}
              </span>
            </button>
            
            <AnimatePresence>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-36 bg-[#050816]/98 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 p-1.5 space-y-1"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        id={`lang-mobile-dropdown-${lang.code}`}
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setLangDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                          language === lang.code 
                            ? "bg-brand text-white shadow-md shadow-brand/20" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <span>{lang.label}</span>
                        {language === lang.code && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (langDropdownOpen) setLangDropdownOpen(false);
            }}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 w-full bg-[#050816]/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden shadow-2xl"
          >
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {NAV_LINKS.map((link) => {
                  const isActive = link.type === 'anchor' 
                    ? activeSection === link.href.substring(2)
                    : location.pathname === link.href;

                  const localizedLabel = t(`nav.${link.key}`);

                  return link.type === 'anchor' ? (
                    <a 
                      key={link.label}
                      href={link.href}
                      onClick={(e) => scrollToAnchor(e, link.href)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-bold uppercase tracking-widest text-xs sm:text-sm",
                        isActive ? "bg-brand/10 text-brand border border-brand/20" : "text-gray-400 border border-transparent"
                      )}
                    >
                      {localizedLabel}
                    </a>
                  ) : (
                    <Link 
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-bold uppercase tracking-widest text-xs sm:text-sm",
                        isActive ? "bg-brand/10 text-brand border border-brand/20" : "text-gray-400 border border-transparent"
                      )}
                    >
                      {localizedLabel}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Language Selector */}
              <div className="border-t border-white/5 pt-4">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-brand" />
                  <span>Language / भाषा</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      id={`lang-mobile-opt-${lang.code}`}
                      onClick={() => {
                        setLanguage(lang.code as any);
                      }}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer",
                        language === lang.code 
                          ? "bg-brand text-white shadow-md shadow-brand/25" 
                          : "text-gray-400 hover:text-white"
                      )}
                      title={lang.label}
                    >
                      {lang.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                 <a 
                   href="/#contact"
                   onClick={(e) => scrollToAnchor(e, '/#contact')}
                   className="flex items-center justify-center gap-3 w-full py-5 bg-brand text-white text-center font-black rounded-2xl tracking-[0.2em] uppercase text-xs shadow-xl shadow-brand/20"
                 >
                   {t('nav.establish_connection')}
                   <Sparkles className="w-4 h-4" />
                 </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
