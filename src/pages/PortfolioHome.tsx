import { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from '@studio-freight/lenis';
import SEO from '../components/SEO';
import { LazySection } from '../components/portfolio/LazySection';

// Core Components (Eager)
import Navbar from '../components/portfolio/Navbar';
import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';
import { WelcomePopup } from '../components/portfolio/WelcomePopup';

// Below-the-fold Components (Lazy)
const Experience = lazy(() => import('../components/portfolio/Experience'));
const CareerTimeline = lazy(() => import('../components/portfolio/CareerTimeline'));
const Skills = lazy(() => import('../components/portfolio/Skills'));
const AISection = lazy(() => import('../components/portfolio/AISection'));
const AIPlayground = lazy(() => import('../components/portfolio/AIPlayground'));
const QADashboard = lazy(() => import('../components/portfolio/QADashboard'));
const Projects = lazy(() => import('../components/portfolio/Projects'));
const ImpactStories = lazy(() => import('../components/portfolio/ImpactStories'));
const Certifications = lazy(() => import('../components/portfolio/Certifications'));
const Testimonials = lazy(() => import('../components/portfolio/Testimonials'));
const BlogPreview = lazy(() => import('../components/portfolio/BlogPreview'));
const Contact = lazy(() => import('../components/portfolio/Contact'));
const Footer = lazy(() => import('../components/portfolio/Footer'));

export default function PortfolioHome() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Handle initial page load hash URL deep-linking with lazy loaded elements
  useEffect(() => {
    const handleInitialHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.substring(1);
        if (targetId) {
          // Immediately notify corresponding LazySection to mount
          window.dispatchEvent(new CustomEvent('force-section-visible', { detail: targetId }));
          
          // Smooth scroll to the target element once mounted
          setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 350);
        }
      }
    };

    // Delay slightly to give page structure and Lenis a chance to initialize
    const timer = setTimeout(handleInitialHash, 150);
    
    // Listen for manual hash changes (e.g. from footer links)
    window.addEventListener('hashchange', handleInitialHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleInitialHash);
    };
  }, []);

  return (
    <div id="portfolio-home" className="bg-[#050816] selection:bg-brand/30 selection:text-white overflow-hidden">
      <WelcomePopup />
      <SEO />
      <Navbar />
      <main>
        <Hero />
        <About />
        
        <LazySection id="experience"><Experience /></LazySection>
        <LazySection id="career-journey"><CareerTimeline /></LazySection>
        <LazySection id="skills"><Skills /></LazySection>
        <LazySection id="ai-qa"><AISection /></LazySection>
        <LazySection id="ai-playground"><AIPlayground /></LazySection>
        <LazySection id="qa-dashboard"><QADashboard /></LazySection>
        <LazySection id="projects"><Projects /></LazySection>
        <LazySection id="impact-stories"><ImpactStories /></LazySection>
        <LazySection id="certifications"><Certifications /></LazySection>
        <LazySection id="testimonials"><Testimonials /></LazySection>
        <LazySection id="blog"><BlogPreview /></LazySection>
        <LazySection id="contact"><Contact /></LazySection>
      </main>
      <LazySection><Footer /></LazySection>
    </div>
  );
}
