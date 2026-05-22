import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface LazySectionProps {
  children: React.ReactNode;
  id?: string;
}

const SectionLoader = () => (
  <div className="h-40 flex items-center justify-center opacity-20">
    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const LazySection: React.FC<LazySectionProps> = ({ children, id }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [forceVisible, setForceVisible] = useState(false);
  
  const entry = useIntersectionObserver(ref, {
    rootMargin: '200px',
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (!id) return;

    // Check if the current URL hash matches this section
    const checkHash = () => {
      const currentHash = window.location.hash;
      if (currentHash === `#${id}`) {
        setForceVisible(true);
      }
    };

    checkHash();

    window.addEventListener('hashchange', checkHash);

    // Support instant navigation from navigation links
    const handleForceVisible = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === id) {
        setForceVisible(true);
      }
    };

    window.addEventListener('force-section-visible', handleForceVisible);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('force-section-visible', handleForceVisible);
    };
  }, [id]);

  const isVisible = !!entry?.isIntersecting || forceVisible;

  return (
    <div ref={ref} className="min-h-[100px]" id={id ? `lazy-wrapper-${id}` : undefined}>
      {isVisible ? (
        <Suspense fallback={<SectionLoader />}>
          {children}
        </Suspense>
      ) : (
        <SectionLoader />
      )}
    </div>
  );
};
