import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Menu, X, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'AI in QA', href: '#ai-qa' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

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
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-300",
        scrolled ? "py-4 bg-[#050816]/80 backdrop-blur-xl border-b border-white/5" : "py-8 bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group relative">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Sankalp</span>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.2em] leading-none mt-1">QA Pioneer</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 px-6 py-2 bg-white/2 backdrop-blur-md rounded-full border border-white/10">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a 
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-all uppercase tracking-widest",
                  isActive ? "text-blue-400 scale-105" : "text-gray-400 hover:text-white"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-4">
           <a 
              href="#contact" 
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20"
           >
              Let's Talk
           </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#050816] border-b border-white/5 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a 
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block text-lg font-bold transition-all uppercase tracking-widest",
                      isActive ? "text-blue-400 pl-2 border-l-2 border-blue-500" : "text-gray-400 hover:text-white"
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a 
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-4 bg-blue-600 text-white text-center font-bold rounded-xl"
              >
                Let's Talk
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
