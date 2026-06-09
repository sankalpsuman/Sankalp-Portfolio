import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

const DEFAULT_CERTS: Certification[] = [
  { id: '1', name: 'ISTQB Certified Tester', issuer: 'ISTQB', date: '2019' },
  { id: '2', name: 'Scrum Master Certified', issuer: 'Scrum Alliance', date: '2021' },
];

export default function Certifications() {
  const [items, setItems] = useState<Certification[]>([]);
  const { t, resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Certification>('certifications', 'order');
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEFAULT_CERTS);
        }
      } catch (err) {
        console.warn("Certifications data load failed, using fallbacks:", err);
        setItems(DEFAULT_CERTS);
      }
    }
    load();
  }, []);

  if (items.length === 0) return null;

  return (
    <Section id="certifications" title={t('certifications.title')} subtitle={t('certifications.subtitle')} className="bg-[#050816]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((cert, idx) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 bg-white/2 border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Award className="w-16 h-16 text-blue-400" />
            </div>
            
            <div className="relative z-10 space-y-4">
               <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Award className="w-6 h-6 text-blue-400" />
               </div>
               
               <div>
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{resolveTranslation(cert, 'name')}</h4>
                  <p className="text-gray-400 text-sm">{resolveTranslation(cert, 'issuer')}</p>
               </div>

               <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                     <Calendar className="w-3 h-3" />
                     {resolveTranslation(cert, 'date')}
                  </div>
                  {cert.url && (
                    <a 
                      href={cert.url} 
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                    >
                       {t('certifications.verify')} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
