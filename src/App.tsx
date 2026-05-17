import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { subscribeDocument } from './services/firestoreService';

// Lazy load Pages
const PortfolioHome = lazy(() => import('./pages/PortfolioHome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const NowPage = lazy(() => import('./pages/NowPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050816] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

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

    return () => {
      unsubscribeAuth();
      unsubscribeTheme();
    };
  }, []);

  const isAdmin = user?.email === 'sankalpsmn@gmail.com';

  return (
    <HelmetProvider>
      <Toaster position="bottom-right" />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<PortfolioHome />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/now" element={<NowPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/*" 
              element={
                !authInitialized ? <LoadingFallback /> : 
                isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}
