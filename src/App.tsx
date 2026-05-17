import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load Pages
const PortfolioHome = lazy(() => import('./pages/PortfolioHome'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const NowPage = lazy(() => import('./pages/NowPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050816] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthInitialized(true);
    });
    return unsubscribe;
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
