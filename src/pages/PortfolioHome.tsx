import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';

// Components
import Navbar from '../components/portfolio/Navbar';
import Hero from '../components/portfolio/Hero';
import About from '../components/portfolio/About';
import Experience from '../components/portfolio/Experience';
import CareerTimeline from '../components/portfolio/CareerTimeline';
import Skills from '../components/portfolio/Skills';
import AISection from '../components/portfolio/AISection';
import AIPlayground from '../components/portfolio/AIPlayground';
import QADashboard from '../components/portfolio/QADashboard';
import Projects from '../components/portfolio/Projects';
import ImpactStories from '../components/portfolio/ImpactStories';
import Certifications from '../components/portfolio/Certifications';
import Testimonials from '../components/portfolio/Testimonials';
import BlogPreview from '../components/portfolio/BlogPreview';
import Contact from '../components/portfolio/Contact';
import Footer from '../components/portfolio/Footer';

import { getDocument, SEO_DOC } from '../services/firestoreService';

export default function PortfolioHome() {
  useEffect(() => {
    async function loadSEO() {
      const seo = await getDocument<any>(SEO_DOC);
      if (seo?.title) {
        document.title = seo.title;
      } else {
        document.title = "Sankalp Suman | AI-Driven QA Lead";
      }
    }
    loadSEO();

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
    <div className="bg-[#050816] selection:bg-blue-500/30 selection:text-white overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <About />
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
      </main>
      <Footer />
    </div>
  );
}
