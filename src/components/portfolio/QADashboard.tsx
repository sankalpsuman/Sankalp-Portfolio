import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, Shield, CheckCircle2, AlertTriangle, Timer, Zap, BarChart3, TrendingUp, Filter } from 'lucide-react';
import { getCollection } from '../../services/firestoreService';
import { cn } from '../../lib/utils';

interface QAMetric {
  id: string;
  label: string;
  value: string;
  trend: string;
  type: 'counter' | 'percentage' | 'health';
}

const PIE_DATA = [
  { name: 'Passed', value: 85, color: '#10b981' },
  { name: 'Failed', value: 5, color: '#ef4444' },
  { name: 'Skipped', value: 10, color: '#f59e0b' },
];

const TREND_DATA = [
  { name: 'Sprint 1', value: 65 },
  { name: 'Sprint 2', value: 72 },
  { name: 'Sprint 3', value: 68 },
  { name: 'Sprint 4', value: 85 },
  { name: 'Sprint 5', value: 92 },
  { name: 'Sprint 6', value: 88 },
];

export default function QADashboard() {
  const [metrics, setMetrics] = useState<QAMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getCollection<QAMetric>('qaMetrics', 'order');
      setMetrics(data);
      setLoading(false);
    }
    load();
  }, []);

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'health': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'percentage': return <Zap className="w-5 h-5 text-blue-400" />;
      default: return <Activity className="w-5 h-5 text-purple-400" />;
    }
  };

  const handleDownloadReport = () => {
    const reportContent = `
QUALITY ASSURANCE AUDIT REPORT
Generated on: ${new Date().toLocaleString()}
-------------------------------------------

METRICS SUMMARY:
${metrics.map(m => `- ${m.label}: ${m.value} (${m.trend})`).join('\n')}

EXECUTION HEALTH:
- Smoke Test Stability: 92%
- Environment Readiness: 100%

DISTRIBUTION:
- Passed: ${PIE_DATA[0].value}%
- Failed: ${PIE_DATA[1].value}%
- Skipped: ${PIE_DATA[2].value}%

-------------------------------------------
This is an automated audit report generated from the Live Quality Dashboard.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QA_Audit_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="qa-dashboard" className="py-24 bg-[#02040a] relative">
       <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase">
                   <Activity className="w-3 h-3" /> Real-time Analytics
                </div>
                <h2 className="text-4xl font-bold">Live <span className="text-cyan-400">Quality Dashboard</span></h2>
                <p className="text-gray-500 max-w-xl">Live metrics tracking regression health, automation coverage, and sprint quality vectors.</p>
             </div>
             <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                   <Filter className="w-4 h-4" /> All Projects
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Main Chart Area */}
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#050816] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 lg:col-span-2">
                   <div className="flex items-center justify-between">
                      <h4 className="font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Quality Growth Trend
                      </h4>
                      <div className="flex gap-2">
                         <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono uppercase">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Coverage
                         </div>
                      </div>
                   </div>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={TREND_DATA}>
                            <defs>
                               <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#050816', border: '1px solid #ffffff10', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Additional Insight */}
                <div className="bg-[#050816] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center space-y-4">
                   <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                              data={PIE_DATA}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {PIE_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="flex justify-center gap-6 w-full">
                      {PIE_DATA.map(item => (
                        <div key={item.name} className="text-center">
                           <div className="text-[10px] uppercase font-mono text-gray-500 mb-1">{item.name}</div>
                           <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-[#050816] border border-white/5 rounded-3xl p-6 space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                         <AlertTriangle className="w-5 h-5 text-orange-400" />
                      </div>
                      <h4 className="font-bold">Execution Health</h4>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Smoke Test Stability</span>
                          <span className="text-orange-400 font-bold">92%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} className="h-full bg-orange-500"></motion.div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Environment Ready</span>
                          <span className="text-emerald-400 font-bold">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} whileInView={{ width: '100%' }} className="h-full bg-emerald-500"></motion.div>
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Stats Column */}
             <div className="space-y-6">
                {metrics.map(metric => (
                  <motion.div 
                    key={metric.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="p-6 bg-[#050816] border border-white/5 rounded-2xl flex items-center gap-6 group hover:border-cyan-500/30 transition-all cursor-default"
                  >
                     <div className="p-4 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                        {getMetricIcon(metric.type)}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                           <span className="text-2xl font-bold font-mono tracking-tighter">{metric.value}</span>
                           <span className="text-[10px] text-emerald-400 font-bold">{metric.trend}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{metric.label}</div>
                     </div>
                  </motion.div>
                ))}

                {/* Automation Badge */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/10 relative overflow-hidden group">
                   <BarChart3 className="absolute -bottom-6 -right-6 w-32 h-32 text-cyan-500/5 group-hover:scale-110 transition-transform" />
                   <div className="relative z-10 space-y-4">
                      <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">Release Readiness</div>
                      <h4 className="text-2xl font-bold">Automated QA Governance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Integrated CICD pipelines with 95% automation coverage across core business logic flows.</p>
                      <button 
                        onClick={handleDownloadReport}
                        className="text-xs font-bold text-white border-b border-white/20 pb-0.5 hover:border-cyan-400 transition-all"
                      >
                        Download Audit Report
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}
