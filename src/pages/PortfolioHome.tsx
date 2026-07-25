import { useEffect, useState, lazy, Suspense } from 'react';
import SEO from '../components/SEO';
import { LazySection } from '../components/portfolio/LazySection';
import { BackgroundEffects } from '../components/portfolio/BackgroundEffects';

// Core Components (Eager)
import Navbar from '../components/portfolio/Navbar';
import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';
import { lazyRetry } from '../lib/lazyRetry';

// Below-the-fold Components (Lazy)
const Experience = lazy(() => lazyRetry(() => import('../components/portfolio/Experience.tsx')));
const WhyHireMe = lazy(() => lazyRetry(() => import('../components/portfolio/WhyHireMe.tsx')));
const Achievements = lazy(() => lazyRetry(() => import('../components/portfolio/Achievements.tsx')));
const FAQ = lazy(() => lazyRetry(() => import('../components/portfolio/FAQ.tsx')));
const RecruiterLobby = lazy(() => lazyRetry(() => import('../components/portfolio/RecruiterLobby.tsx')));
const CareerTimeline = lazy(() => lazyRetry(() => import('../components/portfolio/CareerTimeline.tsx')));
const Skills = lazy(() => lazyRetry(() => import('../components/portfolio/Skills.tsx')));
const AISection = lazy(() => lazyRetry(() => import('../components/portfolio/AISection.tsx')));
const AIPlayground = lazy(() => lazyRetry(() => import('../components/portfolio/AIPlayground.tsx')));
const QADashboard = lazy(() => lazyRetry(() => import('../components/portfolio/QADashboard.tsx')));
const Projects = lazy(() => lazyRetry(() => import('../components/portfolio/Projects.tsx')));
const ImpactStories = lazy(() => lazyRetry(() => import('../components/portfolio/ImpactStories.tsx')));
const Certifications = lazy(() => lazyRetry(() => import('../components/portfolio/Certifications.tsx')));
const Testimonials = lazy(() => lazyRetry(() => import('../components/portfolio/Testimonials.tsx')));
const BlogPreview = lazy(() => lazyRetry(() => import('../components/portfolio/BlogPreview.tsx')));
const Contact = lazy(() => lazyRetry(() => import('../components/portfolio/Contact.tsx')));
const Footer = lazy(() => lazyRetry(() => import('../components/portfolio/Footer.tsx')));

import { PageTransition } from '../components/PageTransition';

export default function PortfolioHome() {
  const [welcomeDismissed, setWelcomeDismissed] = useState(true);

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

    // Delay slightly to give page structure a chance to initialize
    const timer = setTimeout(handleInitialHash, 150);
    
    // Listen for manual hash changes (e.g. from footer links)
    window.addEventListener('hashchange', handleInitialHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleInitialHash);
    };
  }, []);

  return (
    <PageTransition>
      <div id="portfolio-home" className="bg-[#050816] selection:bg-brand/30 selection:text-white overflow-x-hidden relative">
        <BackgroundEffects active={welcomeDismissed} />
        <SEO />
        <Navbar />
        <main>
          <Hero />
          <About active={welcomeDismissed} />
          <LazySection id="why-hire-me"><WhyHireMe /></LazySection>
          
          <LazySection id="experience"><Experience /></LazySection>
          <LazySection id="career-journey"><CareerTimeline /></LazySection>
          <LazySection id="skills"><Skills /></LazySection>
          <LazySection id="ai-qa"><AISection /></LazySection>
          <LazySection id="ai-playground"><AIPlayground /></LazySection>
          <LazySection id="qa-dashboard"><QADashboard /></LazySection>
          <LazySection id="projects"><Projects /></LazySection>
          <LazySection id="impact-stories"><ImpactStories /></LazySection>
          <LazySection id="achievements"><Achievements /></LazySection>
          <LazySection id="certifications"><Certifications /></LazySection>
          <LazySection id="testimonials"><Testimonials /></LazySection>
          <LazySection id="blog"><BlogPreview /></LazySection>
          <LazySection id="recruiter-lobby"><RecruiterLobby /></LazySection>
          <LazySection id="faq"><FAQ /></LazySection>
          <LazySection id="contact"><Contact /></LazySection>
        </main>
        <LazySection><Footer /></LazySection>
      </div>
    </PageTransition>
  );
}
