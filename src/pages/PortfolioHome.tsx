import { useEffect, useState, lazy, Suspense } from 'react';
import Lenis from '@studio-freight/lenis';
import SEO from '../components/SEO';

// Core Components (Eager)
import Navbar from '../components/portfolio/Navbar';
import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';

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

const SectionLoader = () => (
  <div className="h-40 flex items-center justify-center opacity-20">
    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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

  return (
    <div id="portfolio-home" className="bg-[#050816] selection:bg-blue-500/30 selection:text-white overflow-hidden">
      <SEO />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Suspense fallback={<SectionLoader />}>
          <Experience />
          <CareerTimeline />
          <Skills />
          <AISection />
          <AIPlayground />
          <QADashboard />
          <Projects />
          <ImpactStories />
          <Certifications />
          <Testimonials />
          <BlogPreview />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
