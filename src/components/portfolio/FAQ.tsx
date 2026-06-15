import { useState, useEffect } from 'react';
import Section from './Section';
import { getCollection } from '../../services/firestoreService';
import { ChevronDown, HelpCircle, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  visible: boolean;
  order: number;
}

export default function FAQ() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<FAQ>('faqs', 'order');
        setItems(data);
      } catch (e) {
        console.warn('FAQs collection load skipped due to standard fallback configurations.');
      }
    }
    load();
  }, []);

  const visibleItems = items.filter(item => item.visible !== false);

  const categories = ['All', ...Array.from(new Set(visibleItems.map(item => item.category)))];

  const filteredItems = visibleItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) || 
                          item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Inject standard FAQ structured schema markup dynamically
  useEffect(() => {
    if (visibleItems.length === 0) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": visibleItems.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    const scriptId = 'faq-structured-data';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [visibleItems]);

  return (
    <Section id="faq" title="Common Inquiries (FAQs)" subtitle="Get instantaneous answers regarding visa status, onsite options, and test methodologies">
      
      {/* Search and Filters Hub */}
      <div className="max-w-3xl mx-auto space-y-6 mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answer definitions..."
            className="w-full bg-white/[0.03] border border-white/5 hover:border-brand/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand transition-all"
          />
        </div>

        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-brand border-brand text-white shadow-lg'
                    : 'bg-white/[0.01] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accordions Frame */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredItems.map((item, idx) => {
          const isOpen = openId === item.id;
          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? 'bg-brand/5 border-brand/40 shadow-xl' 
                  : 'bg-white/[0.01]/10 border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="w-full flex justify-between items-center px-6 py-5 text-left text-white"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-brand' : 'text-gray-500'}`} />
                  <span className="font-bold text-sm sm:text-base leading-snug">{item.question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-sm text-gray-300 leading-relaxed pt-2 border-t border-white/5">
                      <p className="whitespace-pre-line">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm bg-white/[0.01] border border-white/5 rounded-2xl">
            🔍 No matching FAQs found. Modify your search.
          </div>
        )}
      </div>
    </Section>
  );
}
