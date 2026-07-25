import React, { Suspense, useState, useEffect } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  id?: string;
}

const SectionLoader = () => (
  <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-6 opacity-20">
    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const LazySection: React.FC<LazySectionProps> = ({ children, id }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mount all sections shortly after initial load to prevent scroll jumps
    const timer = setTimeout(() => setIsMounted(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[100px]" id={id ? `lazy-wrapper-${id}` : undefined}>
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
