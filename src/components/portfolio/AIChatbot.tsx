import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, X, Send, Minus, Maximize2, 
  Linkedin, FileText, Calendar, Moon, Sun, 
  AlertCircle, ChevronRight, CheckCircle2, RefreshCw,
  User, Mail, Building
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveDocument } from '../../services/firestoreService';

interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

interface LeadData {
  recruiterName?: string;
  companyName?: string;
  email?: string;
  roleDetails?: string;
  location?: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Lead tracking
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  
  // Interactive CTAs
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleEmail, setScheduleEmail] = useState('');

  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States for Exit Lead generation
  const [showExitForm, setShowExitForm] = useState(false);
  const [exitName, setExitName] = useState('');
  const [exitEmail, setExitEmail] = useState('');
  const [exitCompany, setExitCompany] = useState('');
  const [isSubmittingExit, setIsSubmittingExit] = useState(false);
  const [submitExitSuccess, setSubmitExitSuccess] = useState(false);

  const handleOpenChat = () => {
    // If the session was cleared or messages are empty, initialize a brand new session/session id
    if (!messages || messages.length === 0) {
      const savedSessionId = `session_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      localStorage.setItem('portfolio_chatbot_session_id', savedSessionId);
      setSessionId(savedSessionId);
      
      const fresh: ChatMessage[] = [
        {
          role: 'model',
          content: `Hi there! 👋 I am Sankalp's premium AI Assistant.
 
I can help answer questions about Sankalp's **7+ years in Software Testing/QA**, his **Scrum Master** credentials at Amdocs, his automated & manual QA leadership, or his exciting global career interests supporting roles in **India 🇮🇳, USA 🇺🇸, Germany 🇩🇪**, or anywhere else globally!
 
How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(fresh);
      localStorage.setItem('portfolio_chatbot_history', JSON.stringify(fresh));
    }
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleDirectClose = () => {
    // Clear storage to force fresh session on next open
    localStorage.removeItem('portfolio_chatbot_history');
    localStorage.removeItem('portfolio_chatbot_lead');
    localStorage.removeItem('portfolio_chatbot_session_id');

    // Reset states
    setMessages([]);
    setSessionId('');
    setLeadData({});
    setIsRecruiter(false);
    setShowScheduler(false);
    setExitName('');
    setExitEmail('');
    setExitCompany('');
    setShowExitForm(false);
    setIsOpen(false);
  };

  const handleExitFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitName || !exitEmail || !exitCompany) return;

    setIsSubmittingExit(true);

    const mergedLead: LeadData = {
      ...leadData,
      recruiterName: exitName,
      email: exitEmail,
      companyName: exitCompany,
      roleDetails: "Exit Form Submission on Close"
    };
    setLeadData(mergedLead);

    // Save to sync
    localStorage.setItem('portfolio_chatbot_lead', JSON.stringify(mergedLead));

    try {
      await fetch('/api/chat/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          leadData: mergedLead,
          messages,
          force: true
        })
      });
    } catch (error) {
      console.warn("Failed sending exit lead email:", error);
    }

    setSubmitExitSuccess(true);
    setIsSubmittingExit(false);

    setTimeout(() => {
      // Clear storage
      localStorage.removeItem('portfolio_chatbot_history');
      localStorage.removeItem('portfolio_chatbot_lead');
      localStorage.removeItem('portfolio_chatbot_session_id');

      // Reset
      setMessages([]);
      setSessionId('');
      setLeadData({});
      setIsRecruiter(false);
      setShowScheduler(false);
      setExitName('');
      setExitEmail('');
      setExitCompany('');
      setSubmitExitSuccess(false);
      setShowExitForm(false);
      setIsOpen(false);
    }, 2500);
  };

  // Initialize session and history
  useEffect(() => {
    // Session ID setup
    let savedSessionId = localStorage.getItem('portfolio_chatbot_session_id');
    if (!savedSessionId) {
      savedSessionId = `session_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      localStorage.setItem('portfolio_chatbot_session_id', savedSessionId);
    }
    setSessionId(savedSessionId);

    // Chat History setup
    const savedHistory = localStorage.getItem('portfolio_chatbot_history');
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch (e) {
        initializeFirstMessage();
      }
    } else {
      initializeFirstMessage();
    }

    // Lead data setup
    const savedLead = localStorage.getItem('portfolio_chatbot_lead');
    if (savedLead) {
      try {
        const parsed = JSON.parse(savedLead);
        setLeadData(parsed);
        setIsRecruiter(true);
      } catch (e) {}
    }
  }, []);

  // Open chatbot via custom event listener
  useEffect(() => {
    const handleOpenRequest = () => {
      handleOpenChat();
    };
    window.addEventListener('open-ai-chatbot', handleOpenRequest);
    return () => {
      window.removeEventListener('open-ai-chatbot', handleOpenRequest);
    };
  }, [messages, sessionId]);

  // Save changes to history and Firestore
  const syncChatState = async (updatedMessages: ChatMessage[], updatedLead?: LeadData) => {
    localStorage.setItem('portfolio_chatbot_history', JSON.stringify(updatedMessages));
    if (updatedLead) {
      localStorage.setItem('portfolio_chatbot_lead', JSON.stringify(updatedLead));
    }

    // Direct Firestore write
    try {
      await saveDocument(`chat_sessions/${sessionId}`, {
        sessionId,
        messages: updatedMessages,
        isRecruiterLead: isRecruiter,
        leadData: updatedLead || leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to save chat session directly to Firestore:', e);
    }
  };

  const initializeFirstMessage = () => {
    const fresh: ChatMessage[] = [
      {
        role: 'model',
        content: `Hi there! 👋 I am Sankalp's premium AI Assistant.

I can help answer questions about Sankalp's **7+ years in Software Testing/QA**, his **Scrum Master** credentials at Amdocs, his automated & manual QA leadership, or his exciting global career interests supporting roles in **India 🇮🇳, USA 🇺🇸, Germany 🇩🇪**, or anywhere else globally!

How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(fresh);
    localStorage.setItem('portfolio_chatbot_history', JSON.stringify(fresh));
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isMinimized, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }

    const newUserMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    // Sync immediately
    await syncChatState(nextMessages);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      const aiReplyMessage: ChatMessage = {
        role: 'model',
        content: data.reply || 'Apologies, I encountered an issue retrieving my context. Please retry shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...nextMessages, aiReplyMessage];
      setMessages(finalMessages);

      // Handle detected recruiter lead data
      let currentLead = { ...leadData };
      if (data.isRecruiterLead) {
        setIsRecruiter(true);
        if (data.leadData) {
          // Merge newly extracted fields
          currentLead = {
            recruiterName: data.leadData.recruiterName || currentLead.recruiterName,
            companyName: data.leadData.companyName || currentLead.companyName,
            email: data.leadData.email || currentLead.email,
            roleDetails: data.leadData.roleDetails || currentLead.roleDetails,
            location: data.leadData.location || currentLead.location,
          };
          setLeadData(currentLead);
        }
      }

      await syncChatState(finalMessages, currentLead);

      // Dispatch real-time hot-lead notification email
      if (data.isRecruiterLead || isRecruiter) {
        await fetch('/api/chat/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            leadData: currentLead,
            messages: finalMessages,
            force: true // Always trigger immediately for active recruiter leads!
          })
        });
      }
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: `⚠️ Sorry! I seemed to have hit an connectivity issue.

Please make sure you are online or try writing again. If you'd like to reach Sankalp directly, feel free to use his main **Contact form** on this website or email him directly at **sankalpsmn@gmail.com**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...nextMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleEmail || !scheduledDate || !scheduledTime) return;

    setScheduleSuccess(true);
    
    // Create notification structure to record this book details
    const textNotification = `⭐ INTERVIEW BOOKING REQUEST FORM SUBMITTED:
- Name: ${scheduleName}
- Email: ${scheduleEmail}
- Requested Date: ${scheduledDate}
- Requested Time: ${scheduledTime}
- Status: Confirmed / Added to lead data`;

    const nextMessages = [...messages, {
      role: 'system' as any,
      content: textNotification,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    
    setMessages(nextMessages);

    const mergedLead = {
      ...leadData,
      recruiterName: scheduleName || leadData.recruiterName,
      email: scheduleEmail || leadData.email,
      roleDetails: `Requested Interview for ${scheduledDate} at ${scheduledTime}`
    };
    setLeadData(mergedLead);

    await syncChatState(nextMessages, mergedLead);

    // Force send mail for interview booking
    try {
      await fetch('/api/chat/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          leadData: mergedLead,
          messages: nextMessages,
          force: true
        })
      });
    } catch(e) {}

    setTimeout(() => {
      setShowScheduler(false);
      setScheduleSuccess(false);
    }, 4500);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the conversation and restart?')) {
      localStorage.removeItem('portfolio_chatbot_history');
      localStorage.removeItem('portfolio_chatbot_lead');
      setLeadData({});
      setIsRecruiter(false);
      initializeFirstMessage();
    }
  };

  const suggestedQuestions = [
    "Briefly outline Sankalp's technical stack.",
    "Explain his Amdocs Scrum Master role.",
    "Is he open to roles globally (India, USA, Germany)?",
    "Why Sociology optional & UPSC experience?",
  ];

  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 font-sans transition-all duration-300 ${isExpanded ? 'sm:right-8 sm:bottom-8' : ''}`} id="ai-chabot-wrapper">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            id="chatbot-window"
            className={`w-full sm:max-w-none flex flex-col rounded-3xl shadow-2xl border mb-4 overflow-hidden backdrop-blur-xl transition-all duration-300 ${
              isExpanded 
                ? 'sm:w-[650px] h-[650px] max-h-[85vh]' 
                : 'sm:w-[430px] h-[540px] max-h-[80vh]'
            } ${
              isDarkMode 
                ? 'bg-neutral-900/95 border-neutral-800 text-white shadow-neutral-950/50' 
                : 'bg-white/95 border-neutral-200 text-neutral-800 shadow-neutral-400/20'
            }`}
            style={{ height: isExpanded ? undefined : '540px' }}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between border-b ${
              isDarkMode ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50/40'
            }`} id="chatbot-header">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-bold tracking-wider shadow-md">
                    SS
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 rounded-full border-neutral-900 animate-pulse"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-sm leading-none font-display">Sankalp Suman</h4>
                    {isRecruiter && (
                      <span className="bg-brand/25 text-brand-primary border border-brand-primary/30 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wider uppercase animate-pulse">
                        Recruiter VIP
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-70 flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse"></span>
                    AI Representative
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors ${
                    isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-150'
                  }`}
                  title={isDarkMode ? "Light Mode" : "Dark Mode"}
                  id="btn-chatbot-theme"
                >
                  {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {/* Maximize / Expand (only sm and up) */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors hidden sm:block ${
                    isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-150'
                  }`}
                  title={isExpanded ? "Restore Normal view" : "Maximize view"}
                  id="btn-chatbot-expand"
                >
                  <Maximize2 size={13} className={isExpanded ? 'rotate-180 transition-transform' : ''} />
                </button>
                
                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className={`p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors ${
                    isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-150'
                  }`}
                  id="btn-chatbot-minimize"
                >
                  <Minus size={15} />
                </button>
                
                {/* Clear/Restart */}
                <button
                  onClick={handleClearHistory}
                  className={`p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors ${
                    isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-150'
                  }`}
                  title="Restart Chat"
                  id="btn-chatbot-restart"
                >
                  <RefreshCw size={14} />
                </button>

                {/* Close */}
                <button
                  onClick={() => {
                    // Only prompt for exit info if the user has written something (messages.length > 1)
                    if (messages && messages.length > 1) {
                      setShowExitForm(true);
                    } else {
                      handleDirectClose();
                    }
                  }}
                  className={`p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-colors ${
                    isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-150'
                  }`}
                  id="btn-chatbot-close"
                  title="Close and Save Session"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            {!showExitForm && (
              <div className={`px-4 py-2 flex gap-2 overflow-x-auto justify-start border-b scrollbar-none text-[11px] ${
                isDarkMode ? 'bg-neutral-950/20 border-neutral-850' : 'bg-neutral-50/20 border-neutral-150'
              }`} id="chatbot-quick-cta-bar">
                <a 
                  href="/resume.pdf" 
                  download="Sankalp_Suman_Resume.pdf"
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand/20 text-brand-primary border border-brand/30 rounded-full hover:bg-brand/30 transition-all font-medium whitespace-nowrap"
                >
                  <FileText size={11} />
                  Resume Download
                </a>
                <a 
                  href="https://linkedin.com/in/sankalp-suman" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800/80 text-blue-400 border border-neutral-700 rounded-full hover:bg-neutral-750 transition-all font-medium whitespace-nowrap"
                >
                  <Linkedin size={11} />
                  LinkedIn profile
                </a>
                <button 
                  onClick={() => setShowScheduler(!showScheduler)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full hover:bg-green-500/20 transition-all font-medium whitespace-nowrap"
                >
                  <Calendar size={11} />
                  Book Interview
                </button>
              </div>
            )}

            {/* Messages Area / Scheduler view */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              {showExitForm ? (
                <div className={`p-6 flex-1 overflow-y-auto flex flex-col justify-center ${
                  isDarkMode ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-800'
                }`} id="chatbot-exit-form-container">
                  {submitExitSuccess ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center p-4 flex flex-col items-center justify-center h-full"
                    >
                      <CheckCircle2 className="text-emerald-500 w-12 h-12 mb-3 animate-bounce" />
                      <h4 className="font-bold text-base text-emerald-500 dark:text-emerald-400 font-display">
                        Info Received!
                      </h4>
                      <p className="text-xs opacity-80 mt-2 max-w-sm leading-relaxed">
                        Thank you for sharing your contact card. Sankalp has been notified instantly. Closing the session...
                      </p>
                    </motion.div>
                  ) : (
                    <div className="w-full max-w-sm mx-auto space-y-4">
                      <div className="text-center">
                        <div className="inline-flex w-10 h-10 bg-brand/10 text-brand-primary rounded-full items-center justify-center mb-1.5">
                          <MessageSquare size={18} className="text-brand-primary" />
                        </div>
                        <h4 className="font-bold text-sm font-display">Let's Stay Connected!</h4>
                        <p className="text-[10.5px] opacity-70 mt-0.5">
                          Before you close, please share your details so Sankalp can get back to you.
                        </p>
                      </div>

                      <form onSubmit={handleExitFormSubmit} className="space-y-3 text-[11px]">
                        <div>
                          <label className="block font-medium mb-1 opacity-80 flex items-center gap-1.5">
                            <User size={12} className="text-brand-primary" />
                            Your Name
                          </label>
                          <input 
                            type="text" 
                            required
                            value={exitName}
                            onChange={e => setExitName(e.target.value)}
                            placeholder="John Doe"
                            className={`w-full p-2 rounded-lg border outline-none transition-all ${
                              isDarkMode 
                                ? 'bg-neutral-950 border-neutral-800 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30' 
                                : 'bg-white border-neutral-200 text-neutral-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1 opacity-80 flex items-center gap-1.5">
                            <Mail size={12} className="text-brand-primary" />
                            Email Address
                          </label>
                          <input 
                            type="email" 
                            required
                            value={exitEmail}
                            onChange={e => setExitEmail(e.target.value)}
                            placeholder="john@example.com"
                            className={`w-full p-2 rounded-lg border outline-none transition-all ${
                              isDarkMode 
                                ? 'bg-neutral-950 border-neutral-800 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/35' 
                                : 'bg-white border-neutral-200 text-neutral-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/35'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block font-medium mb-1 opacity-80 flex items-center gap-1.5">
                            <Building size={12} className="text-brand-primary" />
                            Company / Organization
                          </label>
                          <input 
                            type="text" 
                            required
                            value={exitCompany}
                            onChange={e => setExitCompany(e.target.value)}
                            placeholder="Acme Corp"
                            className={`w-full p-2 rounded-lg border outline-none transition-all ${
                              isDarkMode 
                                ? 'bg-neutral-950 border-neutral-800 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30' 
                                : 'bg-white border-neutral-200 text-neutral-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30'
                            }`}
                          />
                        </div>

                        <div className="pt-1 flex flex-col gap-1.5">
                          <button
                            type="submit"
                            disabled={isSubmittingExit}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand text-white font-semibold rounded-lg hover:opacity-95 active:scale-[0.98] transition-all whitespace-nowrap outline-none disabled:opacity-50"
                          >
                            {isSubmittingExit ? "Sending info..." : "Submit Card & Close"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setShowExitForm(false)}
                            className="w-full py-1.5 text-center text-[10px] underline opacity-60 hover:opacity-100 transition-all cursor-pointer"
                          >
                            Back to conversation
                          </button>

                          <button
                            type="button"
                            onClick={handleDirectClose}
                            className="w-full text-center text-[9px] opacity-45 hover:opacity-75 transition-all cursor-pointer mt-0.5"
                          >
                            Close directly without details
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : showScheduler ? (
                <div className={`p-5 flex-1 overflow-y-auto ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-25'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-semibold text-sm flex items-center gap-1.5">
                      <Calendar className="text-brand" size={16} />
                      Interview Scheduling Panel
                    </h5>
                    <button onClick={() => setShowScheduler(false)} className="opacity-70 hover:opacity-100">
                      <X size={16} />
                    </button>
                  </div>

                  {scheduleSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-4"
                    >
                      <CheckCircle2 className="text-green-500 w-12 h-12 mb-3 animate-bounce" />
                      <h4 className="font-semibold text-lg text-green-400">Schedule Request Submitted!</h4>
                      <p className="text-xs opacity-80 mt-2 px-2 max-w-sm">
                        Thank you. Your request for an interview on <strong>{scheduledDate}</strong> at <strong>{scheduledTime}</strong> has been logged to Sankalp's schedule list and emailed instantly.
                      </p>
                      <p className="text-[10px] opacity-40 mt-4">Closing scheduler panel...</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-medium mb-1 opacity-80">Full Name / Company 대표</label>
                        <input 
                          type="text" 
                          required
                          value={scheduleName}
                          onChange={e => setScheduleName(e.target.value)}
                          placeholder="Visitor Name or Recruiting Firm"
                          className={`w-full p-2.5 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-neutral-800 text-white focus:border-brand' 
                              : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-1 opacity-80">Contact Email</label>
                        <input 
                          type="email" 
                          required
                          value={scheduleEmail}
                          onChange={e => setScheduleEmail(e.target.value)}
                          placeholder="recruiter@company.com"
                          className={`w-full p-2.5 rounded-lg border ${
                            isDarkMode 
                              ? 'bg-neutral-950 border-neutral-800 text-white focus:border-brand' 
                              : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium mb-1 opacity-80">Requested Date</label>
                          <input 
                            type="date" 
                            required
                            value={scheduledDate}
                            onChange={e => setScheduledDate(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-neutral-950 border-neutral-800 text-white' 
                                : 'bg-neutral-50 border-neutral-200 text-neutral-850'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1 opacity-80">Preferred Time</label>
                          <input 
                            type="time" 
                            required
                            value={scheduledTime}
                            onChange={e => setScheduledTime(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border ${
                              isDarkMode 
                                ? 'bg-neutral-950 border-neutral-800 text-white' 
                                : 'bg-neutral-50 border-neutral-200 text-neutral-850'
                            }`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap mt-4 hover:shadow-lg hover:shadow-brand/20 active:scale-[0.98]"
                      >
                        <Calendar size={14} />
                        Confirm Booking Schedule
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  {/* Messages Scroll Map */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col" id="chatbot-messages-holder">
                    {messages.map((m, index) => {
                      if (m.role === 'system') {
                        return (
                          <div key={index} className="flex justify-center">
                            <div className="text-[10px] bg-brand/10 border border-brand/20 text-brand py-1 px-3.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-green-400" />
                              {m.content}
                            </div>
                          </div>
                        );
                      }
                      
                      const isAI = m.role === 'model';
                      return (
                        <div 
                          key={index}
                          className={`flex items-start gap-2 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
                        >
                          {/* Mini Bubble Abbreviation avatar */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm ${
                            isAI 
                              ? 'bg-brand text-white' 
                              : isDarkMode ? 'bg-neutral-800 text-neutral-300 border border-neutral-700' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {isAI ? 'SS' : 'V'}
                          </div>
                          
                          <div className="flex flex-col max-w-full">
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                              isAI 
                                ? isDarkMode 
                                  ? 'bg-neutral-800/80 text-gray-100 rounded-tl-none border border-neutral-750/30' 
                                  : 'bg-neutral-100/90 text-neutral-800 rounded-tl-none border-neutral-200/50' 
                                : 'bg-brand-primary text-white rounded-tr-none'
                            }`}>
                              {isAI ? (
                                <div className="prose prose-xs max-w-none dark:prose-invert">
                                  <ReactMarkdown
                                    components={{
                                      p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed text-inherit" {...props} />,
                                      strong: ({ node, ...props }) => <strong className="font-bold text-[#2563eb] dark:text-[#60a5fa]" {...props} />,
                                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-0.5 text-inherit" {...props} />,
                                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5 text-inherit" {...props} />,
                                      li: ({ node, ...props }) => <li className="mb-px leading-snug text-inherit" {...props} />,
                                      a: ({ node, ...props }) => <a className="text-[#3b82f6] dark:text-blue-400 font-medium underline hover:opacity-85" target="_blank" rel="noopener noreferrer" {...props} />,
                                      code: ({ node, ...props }) => <code className="bg-black/15 dark:bg-black/40 px-1 py-0.5 rounded font-mono text-[10.5px] text-pink-500 dark:text-pink-300 border border-neutral-700/10" {...props} />
                                    }}
                                  >
                                    {m.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap">{m.content}</div>
                              )}
                            </div>
                            <span className={`text-[9px] opacity-40 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
                              {m.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="flex items-start gap-2 max-w-[80%] self-start" id="chatbot-typing-indicator">
                        <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          SS
                        </div>
                        <div className={`p-3 rounded-2xl rounded-tl-none text-xs leading-none shadow-sm ${
                          isDarkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          <div className="flex gap-1 py-1 px-1.5" id="typing-dots">
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestion Chips */}
                  {messages.length < 5 && (
                    <div className="px-3 py-1 flex gap-2 overflow-x-auto select-none p-1.5 border-t border-dotted border-neutral-800">
                      {suggestedQuestions.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedQuestion(q)}
                          id={`suggested-chip-${i}`}
                          className={`text-[10px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all border outline-none cursor-pointer ${
                            isDarkMode 
                              ? 'bg-neutral-950/45 border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:text-white' 
                              : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-black'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input Bar */}
            {!showExitForm && (
              <div className={`p-3 border-t ${
                isDarkMode ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50/40'
              }`} id="chatbot-input-bar">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={showScheduler ? 'Please close scheduler panel to chat...' : 'Ask about expertise, USA/Germany interests...'}
                  disabled={isLoading || showScheduler}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-brand/50 transition-all ${
                    isDarkMode 
                      ? 'bg-neutral-950 text-white border border-neutral-800 focus:border-brand-primary' 
                      : 'bg-neutral-50 text-neutral-800 border border-neutral-200 focus:border-brand-primary'
                  }`}
                  id="chatbot-input"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim() || showScheduler}
                  className="p-2.5 bg-brand text-white rounded-xl hover:opacity-90 active:scale-95 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  id="btn-chatbot-send"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[9px] opacity-40 text-center mt-1.5">
                Representative AI Core • Keeps chats saved locally
              </p>
            </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Minimized Bubble Indicator */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            id="chatbot-minimized-bubble"
            className="flex items-center gap-2 bg-[#2563eb] border border-[#3b82f6]/40 text-white rounded-full px-5 py-3 hover:bg-[#1d4ed8] hover:shadow-lg transition-all pr-4"
          >
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-xs font-semibold">Active AI Representative</span>
            <Maximize2 size={13} className="ml-1 opacity-70" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Primary Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenChat}
            id="btn-chatbot-float"
            className="w-14 h-14 bg-brand rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:shadow-xl hover:shadow-brand/20 active:scale-95 relative"
            title="Ask Sankalp's AI Assistant"
          >
            {/* Pulsing halo */}
            <span className="absolute -inset-1.5 bg-brand rounded-full opacity-20 animate-ping"></span>
            
            <MessageSquare size={22} className="relative z-10" />
            
            {/* Unread badge/dot */}
            <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
