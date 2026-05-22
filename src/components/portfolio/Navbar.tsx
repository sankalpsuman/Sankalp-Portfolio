import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { getDocument } from '../../services/firestoreService';
import { throttle } from '../../lib/performance';

const NAV_LINKS = [
  { label: 'ABOUT', href: '/#about', type: 'anchor' },
  { label: 'JOURNEY', href: '/#career-journey', type: 'anchor' },
  { label: 'TOOLKIT', href: '/#skills', type: 'anchor' },
  { label: 'AI QA', href: '/#ai-playground', type: 'anchor' },
  { label: 'PROJECTS', href: '/#projects', type: 'anchor' },
  { label: 'BLOG', href: '/blog', type: 'link' },
  { label: 'NOW', href: '/now', type: 'link' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
                {link.label}
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
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
           <a 
              href="/#contact" 
              onClick={(e) => scrollToAnchor(e, '/#contact')}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-xl transition-all uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95"
           >
              Inquire
              <Sparkles className="w-3 h-3 text-brand" />
           </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
            <div className="p-6 space-y-2">
              {NAV_LINKS.map((link) => {
                const isActive = link.type === 'anchor' 
                  ? activeSection === link.href.substring(2)
                  : location.pathname === link.href;

                return link.type === 'anchor' ? (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={(e) => scrollToAnchor(e, link.href)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-sm",
                      isActive ? "bg-brand/10 text-brand border border-brand/20" : "text-gray-400 border border-transparent"
                    )}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link 
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-sm",
                      isActive ? "bg-brand/10 text-brand border border-brand/20" : "text-gray-400 border border-transparent"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4">
                 <a 
                   href="/#contact"
                   onClick={(e) => scrollToAnchor(e, '/#contact')}
                   className="flex items-center justify-center gap-3 w-full py-5 bg-brand text-white text-center font-black rounded-2xl tracking-[0.2em] uppercase text-xs shadow-xl shadow-brand/20"
                 >
                   Establish Connection
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
