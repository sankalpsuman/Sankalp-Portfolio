import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Globe, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { getDocument } from '../../services/firestoreService';

const NAV_LINKS = [
  { label: 'About', href: '/#about', type: 'anchor' },
  { label: 'Journey', href: '/#career-journey', type: 'anchor' },
  { label: 'Toolkit', href: '/#skills', type: 'anchor' },
  { label: 'AI QA', href: '/#ai-playground', type: 'anchor' },
  { label: 'Projects', href: '/#projects', type: 'anchor' },
  { label: 'Blog', href: '/blog', type: 'link' },
  { label: 'Now', href: '/now', type: 'link' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [location]);

  const scrollToAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname === '/' && href.startsWith('/#')) {
      e.preventDefault();
      const element = document.getElementById(href.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
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
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-[0_0_20px_rgba(37,99,235,0.3)] overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Cpu className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Sankalp</span>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.2em] leading-none mt-1">QA Architecture</span>
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
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white"
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
                  isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-white hover:bg-white/5"
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
              <Sparkles className="w-3 h-3 text-blue-600" />
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
                      isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-400 border border-transparent"
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
                      isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-400 border border-transparent"
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
                   className="flex items-center justify-center gap-3 w-full py-5 bg-blue-600 text-white text-center font-black rounded-2xl tracking-[0.2em] uppercase text-xs shadow-xl shadow-blue-600/20"
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
