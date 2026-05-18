import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, Copy, Check, Loader2, RefreshCw, Terminal, Command, Info, Activity, Cpu, CheckCircle2 } from 'lucide-react';
import { generateAIResponse } from '../../services/geminiService';
import { getCollection } from '../../services/firestoreService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';

interface AITool {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  placeholder: string;
  enabled: boolean;
}

export default function AIPlayground() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTools() {
      const data = await getCollection<AITool>('aiTools');
      const enabledTools = data.filter(t => t.enabled);
      setTools(enabledTools);
      if (enabledTools.length > 0) setSelectedTool(enabledTools[0]);
    }
    loadTools();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTool || !input.trim() || loading) return;
    setLoading(true);
    setOutput('');
    
    try {
      const response = await generateAIResponse(selectedTool.prompt, input);
      setOutput(response);
    } catch (error) {
      setOutput('Error generating response. Please check your connection or API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (tools.length === 0) return null;

  return (
    <section id="ai-playground" className="py-24 relative overflow-hidden bg-[#02040a]">
       {/* Ambient Background */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
       
       <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-6">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm font-semibold"
             >
               <Sparkles className="w-4 h-4" /> Leading Edge QA Intelligence
             </motion.div>
             
             <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                   The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">QA Catalyst</span> Playground
                </h2>
                <div className="max-w-3xl mx-auto">
                   <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
                      Experience the future of Quality Engineering. This interactive environment demonstrates how I bridge the gap between complex requirements and high-velocity testing using Generative AI.
                   </p>
                </div>
             </div>

             <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 group hover:border-blue-500/30 transition-all">
                   <Activity className="w-4 h-4 text-blue-400" />
                   <div className="text-left">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Efficiency</div>
                      <div className="text-sm font-bold text-white">30% Faster Delivery</div>
                   </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 group hover:border-purple-500/30 transition-all">
                   <CheckCircle2 className="w-4 h-4 text-purple-400" />
                   <div className="text-left">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Reliability</div>
                      <div className="text-sm font-bold text-white">40% Better Coverage</div>
                   </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 group hover:border-emerald-500/30 transition-all">
                   <Cpu className="w-4 h-4 text-emerald-400" />
                   <div className="text-left">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Engine</div>
                      <div className="text-sm font-bold text-white">Gemini 3 Flash</div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* Toolbar */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Command className="w-4 h-4" /> Tool Arsenal
                      </h3>
                      <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      {tools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => { setSelectedTool(tool); setOutput(''); }}
                          className={cn(
                            "w-full text-left p-4 rounded-xl transition-all border group",
                            selectedTool?.id === tool.id 
                              ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-lg shadow-blue-600/5" 
                              : "border-transparent hover:bg-white/5 text-gray-400"
                          )}
                        >
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg transition-transform group-hover:scale-110",
                                selectedTool?.id === tool.id ? "bg-blue-500 text-white" : "bg-white/5 text-gray-500"
                              )}>
                                 <Bot className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-sm">{tool.name}</span>
                           </div>
                           <p className="text-[10px] mt-2 opacity-60 leading-relaxed font-medium">{tool.description}</p>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 space-y-4">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Innovation Impact</h4>
                   <p className="text-[11px] text-gray-500 leading-loose">
                      This platform is a testament to the power of combining deep QA expertise with generative AI. It's designed to solve real-world problems like manual regression overhead and requirement ambiguity.
                   </p>
                </div>
             </div>

             {/* Interface */}
             <div className="lg:col-span-8">
                 <div className="bg-[#050816] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
                    {/* Terminal Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                       <div className="flex items-center gap-2">
                          <div className="flex gap-1.5">
                             <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                             <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                          </div>
                          <div className="h-4 w-px bg-white/10 mx-2"></div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
                             <Terminal className="w-3 h-3" />
                             <span>session.qa_gen</span>
                          </div>
                       </div>
                       <div className="text-[10px] uppercase font-mono text-blue-500/60 font-bold tracking-widest hidden sm:block italic">Agentic Quality Engineering Framework</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
                       {/* Context Sidebar */}
                       <div className="md:col-span-4 border-r border-white/5 p-6 bg-white/[0.01] hidden md:flex flex-col gap-8">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <Info className="w-3 h-3" /> Purpose & Context
                             </h4>
                             <p className="text-[11px] text-gray-400 leading-relaxed font-medium capitalize">
                                This space is dedicated to demonstrating how AI can be a "Catalyst" in the Quality Engineering Lifecycle. It's not just about speed, but about depth and accuracy in requirement extraction.
                             </p>
                          </div>

                          <div className="space-y-6">
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Mission Live Log
                             </h4>
                             <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] space-y-3">
                                <div className="flex gap-2 text-blue-400">
                                   <span className="opacity-50">01</span>
                                   <span>Analyze_Requirements(spec_v2.pdf)</span>
                                </div>
                                <div className="flex gap-2 text-purple-400">
                                   <span className="opacity-50">02</span>
                                   <span>Generate_Test_Cases(agent="Gemini-Flash")</span>
                                </div>
                                <div className="flex gap-2 text-emerald-400">
                                   <span className="opacity-50">03</span>
                                   <span className="animate-pulse">Status: SUCCESS (128 cases)</span>
                                </div>
                                <div className="pt-2 border-t border-white/5 mt-2 flex justify-between">
                                   <span className="text-gray-500">EFFICIENCY</span>
                                   <span className="text-blue-400 font-bold">30%</span>
                                </div>
                                <div className="flex justify-between">
                                   <span className="text-gray-500">RELIABILITY</span>
                                   <span className="text-purple-400 font-bold">40%</span>
                                </div>
                             </div>
                          </div>

                          <div className="mt-auto pt-6 border-t border-white/5">
                             <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/60 uppercase font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                                System Optimized
                             </div>
                          </div>
                       </div>

                       {/* Main Interaction Area */}
                       <div className="md:col-span-8 flex flex-col pt-2">
                          <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
                             <div className="space-y-4">
                                <label className="text-xs font-mono text-gray-500 uppercase tracking-widest pl-1">Input Context Source</label>
                                <div className="relative">
                                   <textarea 
                                     value={input}
                                     onChange={e => setInput(e.target.value)}
                                     placeholder={selectedTool?.placeholder || "Enter requirements, user stories, or code snippets..."}
                                     className="w-full bg-white/2 border border-white/5 rounded-2xl p-6 text-white text-sm outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none leading-relaxed font-mono"
                                   />
                                   <button 
                                     onClick={handleGenerate}
                                     disabled={loading || !input.trim()}
                                     className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white p-3 rounded-xl shadow-lg transition-all active:scale-95 group"
                                   >
                                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                   </button>
                                 </div>
                             </div>

                             <div className="space-y-4 flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                   <label className="text-xs font-mono text-gray-500 uppercase tracking-widest pl-1">Extracted Output</label>
                                   <div className="flex gap-2">
                                      {output && (
                                         <>
                                            <button 
                                              onClick={handleCopy}
                                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-gray-400 hover:text-white transition-all border border-white/5"
                                            >
                                               {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                               {copied ? 'Copied' : 'Copy'}
                                            </button>
                                         </>
                                      )}
                                      <button 
                                        onClick={() => { setOutput(''); setInput(''); }}
                                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all border border-white/5"
                                      >
                                         <RefreshCw className="w-3 h-3" />
                                      </button>
                                   </div>
                                </div>

                                <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
                                   <AnimatePresence mode="wait">
                                      {loading ? (
                                        <motion.div 
                                          key="loading"
                                          initial={{ opacity: 0 }} 
                                          animate={{ opacity: 1 }} 
                                          exit={{ opacity: 0 }}
                                          className="flex flex-col items-center justify-center h-full py-12 space-y-4"
                                        >
                                           <div className="relative">
                                              <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                                              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 animate-pulse" />
                                           </div>
                                           <p className="text-xs font-mono text-gray-500 animate-pulse">Running Quality Inference...</p>
                                        </motion.div>
                                      ) : output ? (
                                        <motion.div 
                                          key="output"
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="flex-1 flex flex-col h-full overflow-hidden"
                                        >
                                           <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 prose prose-invert prose-sm md:prose-base max-w-none 
                                              prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                                              prose-table:border prose-table:border-white/10 prose-table:rounded-xl prose-table:overflow-hidden 
                                              prose-th:bg-white/5 prose-th:px-4 prose-th:py-3 prose-th:text-blue-400 prose-th:font-bold prose-th:text-xs prose-th:uppercase prose-th:tracking-wider
                                              prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-white/5 prose-td:text-[11px] sm:prose-td:text-xs
                                              prose-headings:tracking-tight prose-headings:text-blue-400 
                                              prose-p:leading-relaxed prose-p:text-gray-400
                                              font-sans leading-relaxed">
                                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                                           </div>
                                        </motion.div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-20 flex-1">
                                           <Bot className="w-12 h-12 mb-4" />
                                           <p className="text-xs font-mono">Select a tool and provide context to begin.</p>
                                        </div>
                                      )}
                                   </AnimatePresence>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
       </div>
    </section>
  );
}
