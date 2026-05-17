import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCollection } from '../../services/firestoreService';
import { 
  Eye, 
  MousePointer2, 
  MessageSquare, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Mail
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function DashboardOverview() {
  const [stats, setStats] = useState([
    { label: 'Total Views', value: '1,284', icon: Eye, change: '+12%', color: 'blue' },
    { label: 'Project Clicks', value: '452', icon: MousePointer2, change: '+8%', color: 'purple' },
    { label: 'Inquiries', value: '0', icon: MessageSquare, change: 'Stable', color: 'cyan' },
    { label: 'Uptime', value: '99.9%', icon: Activity, change: 'Stable', color: 'emerald' },
  ]);

  useEffect(() => {
    async function loadStats() {
      const messages = await getCollection('messages');
      if (messages) {
        setStats(prev => prev.map(s => s.label === 'Inquiries' ? { ...s, value: messages.length.toString(), change: messages.length > 0 ? `+${messages.length}` : 'Stable' } : s));
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-blue-600 rounded-2xl p-8 lg:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Welcome back, Sankalp.</h1>
          <p className="text-blue-100 text-lg mb-6">
            Your AI-Powered portfolio is performing smoothly. Everything is up to date.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-sm font-medium">Verified Admin</span>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/20">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-sm font-medium">82% Portfolio Strength</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-[#050816] border border-white/5 rounded-xl hover:border-blue-500/20 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2.5 rounded-lg border",
                stat.color === 'blue' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                stat.color === 'purple' && "bg-purple-500/10 border-purple-500/20 text-purple-400",
                stat.color === 'cyan' && "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                stat.color === 'emerald' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                stat.change === 'Stable' ? "bg-gray-500/10 text-gray-400" : "bg-emerald-500/10 text-emerald-400"
              )}>
                {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.label}</h3>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            System Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#050816] border border-white/5 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium group-hover:text-blue-400 transition-colors">AI Content Synchronization</h4>
                  <p className="text-xs text-gray-500">Live data feeding from Firestore active</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#050816] border border-white/5 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium group-hover:text-purple-400 transition-colors">Security Rules Enforced</h4>
                  <p className="text-xs text-gray-500">RBAC validation active on all mutations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
             <Link to="/admin/hero" className="flex items-center gap-3 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl hover:bg-blue-600/20 transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-sm">Update Hero Headline</span>
             </Link>
             <Link to="/admin/projects" className="flex items-center gap-3 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl hover:bg-purple-600/20 transition-all group">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-sm">Add New Project</span>
             </Link>
             <Link to="/admin/inquiries" className="flex items-center gap-3 p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-600/20 transition-all group">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-sm">Review Recent Inquiries</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
