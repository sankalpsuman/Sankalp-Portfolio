import React, { useState, useEffect } from 'react';
import { getCollection, deleteCollectionDocument } from '../../services/firestoreService';
import { Mail, User, Clock, Trash2, Loader2, MessageSquare, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export default function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInquiries = async () => {
    setLoading(true);
    const data = await getCollection<Inquiry>('messages', 'createdAt');
    setInquiries(data.reverse()); // Show newest first
    setLoading(false);
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      await deleteCollectionDocument('messages', id);
      setInquiries(prev => prev.filter(item => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (error) {
      alert('Failed to delete inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-gray-500 font-mono text-sm animate-pulse">Retreiving client transmissions...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6">
      {/* List Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#050816] border border-white/5 rounded-2xl overflow-hidden transition-all",
        selectedInquiry ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input 
               type="text" 
               placeholder="Search transmissions..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
             />
           </div>
           <button onClick={loadInquiries} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
             <Clock className="w-4 h-4" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredInquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-2">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm font-mono">No transmissions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredInquiries.map((inquiry) => (
                <div 
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={cn(
                    "p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors group relative",
                    selectedInquiry?.id === inquiry.id && "bg-blue-600/10 border-l-2 border-l-blue-500"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-105 transition-transform">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-sm truncate">{inquiry.name}</h4>
                      <span className="text-[10px] uppercase font-mono text-gray-600 shrink-0">{formatDate(inquiry.createdAt)}</span>
                    </div>
                    <p className="text-xs text-blue-400 mb-1 truncate">{inquiry.email}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">"{inquiry.message}"</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Area */}
      <div className={cn(
        "lg:w-[450px] flex flex-col bg-[#050816] border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all h-full",
        !selectedInquiry ? "hidden lg:flex opacity-50 grayscale pointer-events-none" : "flex"
      )}>
        {selectedInquiry ? (
          <div className="flex flex-col h-full bg-gradient-to-b from-blue-600/5 to-transparent">
            {/* Detail Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
               <button 
                 onClick={() => setSelectedInquiry(null)}
                 className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400"
               >
                 <ChevronRight className="w-5 h-5 rotate-180" />
               </button>
               <div className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">Transmission Detail</div>
               <button 
                 onClick={(e) => handleDelete(selectedInquiry.id, e as any)}
                 className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors rounded-lg"
               >
                 <Trash2 className="w-5 h-5" />
               </button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedInquiry.name}</h2>
                    <p className="text-blue-400 font-mono text-sm">{formatDate(selectedInquiry.createdAt)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <Mail className="w-4 h-4 text-gray-500" />
                         <span className="text-sm font-medium">{selectedInquiry.email}</span>
                      </div>
                      <a href={`mailto:${selectedInquiry.email}`} className="p-2 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                   </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest pl-1">Transmission Received</label>
                <div className="p-6 bg-white/2 border border-white/5 rounded-2xl text-gray-200 leading-relaxed italic relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/50"></div>
                   <div className="relative z-10 whitespace-pre-wrap">
                     "{selectedInquiry.message}"
                   </div>
                   <MessageSquare className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Detail Footer */}
            <div className="p-6 border-t border-white/5 bg-white/2">
               <a 
                 href={`mailto:${selectedInquiry.email}?subject=Re: Portfolio Inquiry&body=Hi ${selectedInquiry.name},\n\n`}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                >
                 <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 Respond via Email
               </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/2 border border-white/5 flex items-center justify-center text-gray-700">
               <MessageSquare className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-gray-500">Select a transmission</h3>
              <p className="text-xs text-gray-600 max-w-[200px] mx-auto mt-2">Pick an inquiry from the list to view the full message content.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
