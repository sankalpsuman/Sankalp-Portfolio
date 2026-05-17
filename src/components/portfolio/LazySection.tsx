import React, { Suspense, useRef } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface LazySectionProps {
  children: React.ReactNode;
}

const SectionLoader = () => (
  <div className="h-40 flex items-center justify-center opacity-20">
    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const LazySection: React.FC<LazySectionProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(ref, {
    rootMargin: '200px',
    freezeOnceVisible: true,
  });

  const isVisible = !!entry?.isIntersecting;

  return (
    <div ref={ref} className="min-h-[100px]">
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
