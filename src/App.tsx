import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { subscribeDocument } from './services/firestoreService';
import { AIChatbot } from './components/portfolio/AIChatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './hooks/useLanguage';
import { lazyRetry } from './lib/lazyRetry';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Terminal } from 'lucide-react';
import { cn } from './lib/utils';

// Lazy load Pages
const PortfolioHome = lazy(() => lazyRetry(() => import('./pages/PortfolioHome.tsx')));
const AdminDashboard = lazy(() => lazyRetry(() => import('./pages/AdminDashboard.tsx')));
const AdminLogin = lazy(() => lazyRetry(() => import('./pages/AdminLogin.tsx')));
const BlogList = lazy(() => lazyRetry(() => import('./pages/BlogList.tsx')));
const BlogDetail = lazy(() => lazyRetry(() => import('./pages/BlogDetail.tsx')));
const NowPage = lazy(() => lazyRetry(() => import('./pages/NowPage.tsx')));

const LoadingFallback = () => {
  const [progress, setProgress] = useState(10);
  const [logs, setLogs] = useState<string[]>([]);
  const logsList = [
    'Initializing automated QA pipeline...',
    'Injecting high-performance test suites [Smoke Tests]...',
    'Verifying API response latencies (<15ms goal)...',
    'Ensuring Scrum sprint goal compliance...',
    'Checking pipeline build outputs... Integrity verified.',
    'Ready. Rendering premium user experience...'
  ];

  useEffect(() => {
    // Immediate bump to simulate initial load start
    const timer = setTimeout(() => setProgress(30), 100);
    
    const handleLoad = () => {
      setProgress(100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Interval to fill the gap if load takes time
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 5);
      });
    }, 200);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const logIndex = Math.min(
      Math.floor((progress / 100) * logsList.length),
      logsList.length - 1
    );
    if (!logs.includes(logsList[logIndex])) {
      setLogs((prev) => [...prev.slice(-3), logsList[logIndex]]);
    }
  }, [progress, logs]);

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative selection:bg-cyan-500/30">
      {/* Decorative radial gradients for luxury feel */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/10 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/5 blur-[90px] pointer-events-none rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/[0.01] backdrop-blur-md border border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-2xl relative"
      >
        {/* Glass corner design indicators */}
        <div className="absolute top-4 left-4 border-t border-l border-white/10 w-4 h-4"></div>
        <div className="absolute top-4 right-4 border-t border-r border-white/10 w-4 h-4"></div>
        <div className="absolute bottom-4 left-4 border-b border-l border-white/10 w-4 h-4"></div>
        <div className="absolute bottom-4 right-4 border-b border-r border-white/10 w-4 h-4"></div>

        {/* Head branding */}
        <div className="flex flex-col items-center text-center gap-5">
          <div className="relative">
            {/* Spinning verification scanning rings */}
            <div className="absolute -inset-4 border border-dashed border-white/10 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute -inset-2 border border-[#22d3ee]/20 rounded-full animate-[spin_12s_linear_infinite]" />
            
            <div className="p-4 bg-gradient-to-br from-brand/15 to-cyan-500/5 border border-white/10 rounded-2xl relative shadow-lg shadow-brand/10 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              QA INTEGRITY SUITE
            </h2>
            <p className="text-xs text-gray-500 font-semibold font-mono tracking-normal leading-none uppercase">
              Sankalp Suman • Scrum Master & Lead
            </p>
          </div>
          
          {/* Main loader progress bar */}
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between items-center font-mono text-[11px] text-gray-400 px-1 font-semibold">
              <span className="text-[#22d3ee]/70">PIPELINE HEURISTICS</span>
              <span>{progress}%</span>
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-brand to-purple-500"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite] pointer-events-none" />
            </div>
          </div>

          {/* Running console logs simulation */}
          <div className="w-full bg-[#030611] rounded-xl p-3 border border-white/5 text-left h-[76px] overflow-hidden flex flex-col justify-end font-mono text-[10px] text-gray-400 leading-relaxed space-y-1 select-none">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`flex gap-1.5 items-start ${index === logs.length - 1 ? 'text-[#22d3ee]' : 'opacity-40'}`}
              >
                <Terminal className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="break-all">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Admin Guard component to handle deep linking and unauthorized access
const AdminGuard = ({ children, user, authInitialized }: { children: React.ReactNode, user: User | null, authInitialized: boolean }) => {
  const location = useLocation();
  const isAdmin = user?.email === 'sankalpsmn@gmail.com';

  if (!authInitialized) {
    return <LoadingFallback />;
  }

  if (!isAdmin) {
    // Save the intended destination to localStorage to survive refreshes during login
    if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
      localStorage.setItem('lastAdminPath', location.pathname + location.search);
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

import { WelcomeGateway } from './components/portfolio/WelcomeGateway';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [hasEntered, setHasEntered] = useState(() => {
    // Check if user has already entered in this session
    return sessionStorage.getItem('portfolio_entered') === 'true';
  });

  const handleEnter = () => {
    setHasEntered(true);
    sessionStorage.setItem('portfolio_entered', 'true');
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthInitialized(true);
    });

    // Subscribe and apply theme color in real-time
    const unsubscribeTheme = subscribeDocument<{ themeColor?: string }>('settings/global', (settings) => {
      if (settings?.themeColor) {
        const color = settings.themeColor;
        document.documentElement.style.setProperty('--brand-primary', color);
        
        // Helper to convert hex to RGB for Tailwind opacity support
        const hexToRgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `${r}, ${g}, ${b}`;
        };
        
        try {
          if (color.startsWith('#') && color.length === 7) {
            document.documentElement.style.setProperty('--brand-primary-rgb', hexToRgb(color));
          }
        } catch (e) {
          console.error("Failed to parse theme color for RGB:", e);
        }
      }
    });

    // Intercept dynamic chunk loading/module script errors globally
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      const isChunkError = 
        msg.includes('dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('Failed to fetch') ||
        msg.toLowerCase().includes('chunk');
      if (isChunkError) {
        console.warn('Global chunk load error caught. Auto-refreshing page for updated content...', msg);
        window.location.reload();
      }
    };

    window.addEventListener('error', handleGlobalError);

    return () => {
      unsubscribeAuth();
      unsubscribeTheme();
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <LanguageProvider>
          <Toaster position="bottom-right" />
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {!hasEntered && (
                <WelcomeGateway onEnter={handleEnter} key="welcome-gateway" />
              )}
            </AnimatePresence>

            <div className={cn(
              "transition-all duration-1000",
              !hasEntered ? "opacity-0 scale-95 blur-xl h-screen overflow-hidden pointer-events-none" : "opacity-100 scale-100 blur-0"
            )}>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* English / Default Base Routes */}
                  <Route path="/" element={<PortfolioHome />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/now" element={<NowPage />} />

                  {/* Hindi Prefixed Routes */}
                  <Route path="/hi" element={<PortfolioHome />} />
                  <Route path="/hi/blog" element={<BlogList />} />
                  <Route path="/hi/blog/:slug" element={<BlogDetail />} />
                  <Route path="/hi/now" element={<NowPage />} />

                  {/* French Prefixed Routes */}
                  <Route path="/fr" element={<PortfolioHome />} />
                  <Route path="/fr/blog" element={<BlogList />} />
                  <Route path="/fr/blog/:slug" element={<BlogDetail />} />
                  <Route path="/fr/now" element={<NowPage />} />

                  {/* German Prefixed Routes */}
                  <Route path="/de" element={<PortfolioHome />} />
                  <Route path="/de/blog" element={<BlogList />} />
                  <Route path="/de/blog/:slug" element={<BlogDetail />} />
                  <Route path="/de/now" element={<NowPage />} />

                  {/* Admin Management System (Non-prefixed) */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/*" 
                    element={
                      <AdminGuard user={user} authInitialized={authInitialized}>
                        <AdminDashboard />
                      </AdminGuard>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <AIChatbot />
            </div>
          </ErrorBoundary>
        </LanguageProvider>
      </Router>
    </HelmetProvider>
  );
}
