import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
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
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Admin Sections
import DashboardOverview from './admin/DashboardOverview';
import HeroEditor from './admin/HeroEditor';
import AboutEditor from './admin/AboutEditor';
import ExperienceEditor from './admin/ExperienceEditor';
import SkillsEditor from './admin/SkillsEditor';
import ProjectsEditor from './admin/ProjectsEditor';
import CertificationsEditor from './admin/CertificationsEditor';
import AIEditor from './admin/AIEditor';
import ContactEditor from './admin/ContactEditor';
import SEOEditor from './admin/SEOEditor';
import Inquiries from './admin/Inquiries';
import BlogEditor from './admin/BlogEditor';
import TestimonialsEditor from './admin/TestimonialsEditor';
import TimelineEditor from './admin/TimelineEditor';
import ImpactStoriesEditor from './admin/ImpactStoriesEditor';
import QAMetricsEditor from './admin/QAMetricsEditor';
import AIToolsEditor from './admin/AIToolsEditor';
import SettingsEditor from './admin/SettingsEditor';
import NowEditor from './admin/NowEditor';

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
    localStorage.setItem('lastAdminPath', location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('lastAdminPath');
    await auth.signOut();
    navigate('/');
  };

  const activeSection = NAV_ITEMS.find(item => {
    const fullPath = `/admin${item.path ? `/${item.path}` : ''}`;
    return location.pathname === fullPath;
  })?.label || 'Dashboard';

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
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin CMS</span>
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
                      ? "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                      : "text-gray-400 border-transparent hover:bg-white/5 hover:text-white"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-blue-500")} />
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
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#050816]/50 backdrop-blur-md border-bottom border-white/5 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-semibold text-lg text-white/90">{activeSection}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              View Site
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 hidden sm:inline">Sankalp Suman</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20"></div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <Routes>
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
        </div>
      </main>
    </div>
  );
}
