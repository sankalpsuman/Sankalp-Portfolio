import React, { Suspense, useState, useEffect, useRef } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  id?: string;
  eager?: boolean;
}

const SectionLoader = () => (
  <div className="min-h-[120px] w-full flex items-center justify-center opacity-15 py-8">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const LazySection: React.FC<LazySectionProps> = ({ children, id, eager = false }) => {
  const [isMounted, setIsMounted] = useState(eager);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMounted) return;

    // Listen for manual anchor clicks or force-visible events
    const handleForceVisible = (e: CustomEvent<string>) => {
      if (id && e.detail === id) {
        setIsMounted(true);
      }
    };

    window.addEventListener('force-section-visible', handleForceVisible as EventListener);

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsMounted(true);
            observer.disconnect();
          }
        },
        { rootMargin: '500px 0px 500px 0px', threshold: 0.01 }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        window.removeEventListener('force-section-visible', handleForceVisible as EventListener);
      };
    } else {
      setIsMounted(true);
      return () => {
        window.removeEventListener('force-section-visible', handleForceVisible as EventListener);
      };
    }
  }, [id, isMounted]);

  return (
    <div ref={containerRef} className="min-h-[80px]" id={id ? `lazy-wrapper-${id}` : undefined}>
      {isMounted ? (
        <Suspense fallback={<SectionLoader />}>
          {children}
        </Suspense>
      ) : (
        <SectionLoader />
      )}
    </div>
  );
};
