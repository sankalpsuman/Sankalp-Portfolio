import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { Bot, Sparkles, Brain, Cpu, Search, CheckCircle2, Workflow } from 'lucide-react';
import { getDocument, AI_DOC } from '../../services/firestoreService';

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Brain,
  Workflow,
  Bot,
  Cpu,
  Search,
  CheckCircle2
};

interface AIStep {
  title: string;
  desc: string;
  icon: string;
}

interface AIData {
  headline: string;
  subheadline: string;
  steps: AIStep[];
  efficiency: string;
  reliability: string;
  strategy: string;
  features: string[];
}

export default function AISection() {
  const [data, setData] = useState<AIData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDocument<AIData>(AI_DOC);
        if (res) setData(res);
      } catch (err) {
        console.warn("AI section load failed, using fallbacks:", err);
      }
    }
    load();
  }, []);

  const steps = data?.steps || [
    { title: 'Requirement Intelligence', desc: 'Agentic extraction of acceptance criteria and functional flows from ambiguous specifications.', icon: 'Search' },
    { title: 'Prompt Engineering', desc: 'Proprietary QA prompt libraries optimized for telecom and enterprise business logic.', icon: 'Brain' },
    { title: 'Agentic Debugging', desc: 'Automated log analysis and root cause identification using LLMs to reduce MTTR.', icon: 'Cpu' },
    { title: 'Strategic Automation', desc: 'Predictive impact analysis to optimize regression suites and accelerate STLC by 40%.', icon: 'Workflow' }
  ];

  const features = data?.features || ['Gemini Flash', 'LangChain', 'Prompt Engineering', 'API Validation', 'Impact Analysis', 'ETL Intelligence'];

  return (
    <Section id="ai-qa" title={data?.subheadline || "AI in Quality Engineering"} subtitle={data?.headline || "Quantum Leap In QA"} className="bg-[#02040a]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-20">
         <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-12 relative z-10">
          <div className="space-y-6">
             <h3 className="text-3xl lg:text-4xl font-black text-white leading-tight">
               Revolutionizing Quality with <br/> 
               <span className="text-blue-400">Agentic Testing Workflows</span>
             </h3>
             <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
               {data?.strategy || "Currently leading QA acceleration at Amdocs by integrating Agentic workflows into the STLC. My approach focuses on bridging the gap between traditional automation and generative intelligence to achieve 40% faster delivery cycles."}
             </p>

             <div className="flex flex-wrap gap-2 pt-4">
               {features.map((feature, idx) => (
                 <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-blue-400 transition-colors">
                   {feature}
                 </span>
               ))}
             </div>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => {
              const Icon = ICON_MAP[step.icon] || Sparkles;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-6 group"
                >
                  <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-white transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]`}>
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                     <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{step.title}</h4>
                     <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative"
        >
          <div className="p-1 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-[40px] shadow-2xl">
             <div className="bg-[#050816] rounded-[39px] p-8 lg:p-12 border border-white/10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                   <Cpu className="w-32 h-32 text-blue-500" />
                </div>
                
                <div className="space-y-8 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="h-px flex-1 bg-white/5 ml-4"></div>
                   </div>

                   <div className="space-y-6 font-mono text-sm">
                      <div className="flex items-center gap-4 text-blue-400">
                         <span className="opacity-50">01</span>
                         <span className="flex items-center gap-2">
                            <Search className="w-4 h-4" />
                            Analyze_Requirements(spec_v2.pdf)
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-purple-400 pl-4">
                         <span className="opacity-50">02</span>
                         <span className="flex items-center gap-2">
                            <Cpu className="w-4 h-4" />
                            Generate_Test_Cases(agent="Gemini-Flash")
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-emerald-400 pl-4">
                         <span className="opacity-50">03</span>
                         <span className="flex items-center gap-2 animate-pulse">
                            <CheckCircle2 className="w-4 h-4" />
                            Status: SUCCESS (128 cases verified)
                         </span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 pt-8">
                      <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Efficiency</div>
                         <div className="text-2xl font-bold text-blue-400">{data?.efficiency || "+320%"}</div>
                      </div>
                      <div className="p-4 bg-white/2 border border-white/5 rounded-2xl">
                         <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Reliability</div>
                         <div className="text-2xl font-bold text-purple-400">{data?.reliability || "99.9%"}</div>
                      </div>
                   </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 border-8 border-blue-500/5 rounded-full"></div>
             </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
