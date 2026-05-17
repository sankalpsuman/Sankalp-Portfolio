import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Code, 
  Layers, 
  Award, 
  Mail, 
  Search, 
  Settings, 
  LogOut,
  Menu,
  X,
  Zap,
  Globe,
  Sparkles,
  MessageSquare,
  FileText,
  Star,
  Milestone,
  BarChart3,
  Settings2,
  Clock,
  Bot,
  Target,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Critical core modules (Loaded immediately for instant switching)
import DashboardOverview from './admin/DashboardOverview';
import HeroEditor from './admin/HeroEditor';
import AboutEditor from './admin/AboutEditor';
import ExperienceEditor from './admin/ExperienceEditor';
import SkillsEditor from './admin/SkillsEditor';
import ProjectsEditor from './admin/ProjectsEditor';

// Secondary/Data-heavy modules (Remain lazy)
const CertificationsEditor = lazy(() => import('./admin/CertificationsEditor'));
const AIEditor = lazy(() => import('./admin/AIEditor'));
const ContactEditor = lazy(() => import('./admin/ContactEditor'));
const SEOEditor = lazy(() => import('./admin/SEOEditor'));
const Inquiries = lazy(() => import('./admin/Inquiries'));
const BlogEditor = lazy(() => import('./admin/BlogEditor'));
const TestimonialsEditor = lazy(() => import('./admin/TestimonialsEditor'));
const TimelineEditor = lazy(() => import('./admin/TimelineEditor'));
const ImpactStoriesEditor = lazy(() => import('./admin/ImpactStoriesEditor'));
const QAMetricsEditor = lazy(() => import('./admin/QAMetricsEditor'));
const AIToolsEditor = lazy(() => import('./admin/AIToolsEditor'));
const SettingsEditor = lazy(() => import('./admin/SettingsEditor'));
const NowEditor = lazy(() => import('./admin/NowEditor'));

const NAV_ITEMS = [
  { path: '', label: 'Overview', icon: LayoutDashboard },
  { path: 'hero', label: 'Hero Section', icon: Zap },
  { path: 'about', label: 'About Me', icon: User },
  { path: 'experience', label: 'Experience', icon: Briefcase },
  { path: 'skills', label: 'Toolkit', icon: Code },
  { path: 'timeline', label: 'Career Journey', icon: Milestone },
  { path: 'ai', label: 'AI in QA', icon: Sparkles },
  { path: 'aitools', label: 'AI Tools', icon: Bot },
  { path: 'projects', label: 'Projects', icon: Layers },
  { path: 'impact', label: 'Impact Stories', icon: Target },
  { path: 'metrics', label: 'QA Metrics', icon: BarChart3 },
  { path: 'certifications', label: 'Certifications', icon: Award },
  { path: 'blogs', label: 'Blog', icon: FileText },
  { path: 'testimonials', label: 'Testimonials', icon: Star },
  { path: 'now', label: 'Now Page', icon: Clock },
  { path: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  { path: 'contact', label: 'Contact Settings', icon: Mail },
  { path: 'seo', label: 'SEO & Metadata', icon: Search },
  { path: 'settings', label: 'Global Settings', icon: Settings2 },
];

export default function AdminDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we are at exactly /admin or /admin/, always redirect to overview internally (URL stays same/similar)
    // but the state will prioritize the overview content.
    localStorage.setItem('lastAdminPath', location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('lastAdminPath');
    await auth.signOut();
    navigate('/');
  };

  const activeSection = useMemo(() => {
    // Exact match first
    const exactMatch = NAV_ITEMS.find(item => {
      const fullPath = `/admin${item.path ? `/${item.path}` : ''}`;
      return location.pathname === fullPath;
    });
    
    if (exactMatch) return exactMatch.label;

    // Fallback to Overview if we are at root admin path
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return 'Overview';
    }

    return 'Dashboard';
  }, [location.pathname]);

  const LoadingFallback = () => (
    <div className="flex-1 flex items-center justify-center bg-[#02040a]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-brand animate-spin relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-bold text-white tracking-widest uppercase">Propelling Interface</p>
          <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand"
              animate={{ x: [-128, 128] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#050816] border-r border-white/5 transition-transform duration-300 transform",
          !isSidebarOpen ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">Admin CMS</span>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
            {NAV_ITEMS.map((item) => {
              const fullPath = `/admin${item.path ? `/${item.path}` : ''}`;
              const isActive = location.pathname === fullPath;

              return (
                <Link
                  key={item.path}
                  to={fullPath}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group border whitespace-nowrap",
                    isActive
                      ? "bg-brand/10 text-brand border-brand/20 shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.1)]"
                      : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-brand")} />
                  <span className="font-medium text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors group"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm text-white">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#050816]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <h2 className="font-semibold text-lg text-white/90">{activeSection}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-sm font-medium text-white"
            >
              <Globe className="w-4 h-4 text-brand" />
              View Site
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 hidden sm:inline">Sankalp Suman</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-purple-600 border border-white/20"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="h-full"
                >
                  <Routes location={location}>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="/hero" element={<HeroEditor />} />
                    <Route path="/about" element={<AboutEditor />} />
                    <Route path="/experience" element={<ExperienceEditor />} />
                    <Route path="/skills" element={<SkillsEditor />} />
                    <Route path="/projects" element={<ProjectsEditor />} />
                    <Route path="/certifications" element={<CertificationsEditor />} />
                    <Route path="/ai" element={<AIEditor />} />
                    <Route path="/inquiries" element={<Inquiries />} />
                    <Route path="/contact" element={<ContactEditor />} />
                    <Route path="/seo" element={<SEOEditor />} />
                    <Route path="/blogs" element={<BlogEditor />} />
                    <Route path="/testimonials" element={<TestimonialsEditor />} />
                    <Route path="/timeline" element={<TimelineEditor />} />
                    <Route path="/impact" element={<ImpactStoriesEditor />} />
                    <Route path="/metrics" element={<QAMetricsEditor />} />
                    <Route path="/aitools" element={<AIToolsEditor />} />
                    <Route path="/settings" element={<SettingsEditor />} />
                    <Route path="/now" element={<NowEditor />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
