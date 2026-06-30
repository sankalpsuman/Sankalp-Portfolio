import { useState, useEffect } from 'react';
import Section from './Section';
import { getCollection } from '../../services/firestoreService';
import { Award, Star, Trophy, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../hooks/useLanguage';
import { AutoTranslate } from './TranslationComponents';

interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
  description?: string;
  badge?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export default function Achievements() {
  const [items, setItems] = useState<Achievement[]>([]);
  const { resolveTranslation } = useLanguage();

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Achievement>('achievements', 'order');
        setItems(data);
      } catch (e) {
        console.warn('Achievements collection lookup failed. Fallbacks loaded.');
      }
    }
    load();
  }, []);

  const featuredItems = items.filter(item => item.featured !== false);
  const displayItems = featuredItems.length > 0 ? featuredItems : items;

  return (
    <Section id="achievements" title="Achievements & Awards" subtitle="Peer-recognized milestones, competitive awards, and leadership credits">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="group relative p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-brand/30 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
          >
            {/* Visual Header Grid wrapper */}
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={resolveTranslation(item, 'title')} className="w-8 h-8 rounded-lg object-cover" />
                  ) : (
                    <Trophy className="w-6 h-6 text-brand" />
                  )}
                </div>

                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-brand/10 border border-brand/20 text-brand rounded-full">
                    <AutoTranslate text={resolveTranslation(item, 'badge')} />
                  </span>
                )}
              </div>

              <h4 className="text-lg font-bold text-white group-hover:text-brand transition-colors line-clamp-1">
                {resolveTranslation(item, 'title')}
              </h4>
              <p className="text-sm font-semibold text-purple-400 mt-1">
                {resolveTranslation(item, 'organization')}
              </p>
              
              {item.description && (
                <p className="text-gray-400 text-xs leading-relaxed mt-3 whitespace-pre-line">
                  {resolveTranslation(item, 'description')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                <AutoTranslate text="Conferred" />: {resolveTranslation(item, 'date')}
              </span>
            </div>
          </motion.div>
        ))}

        {displayItems.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white/[0.01] border border-white/5 rounded-2xl text-gray-500 font-medium">
            🥇 <AutoTranslate text="Add awards, performance metrics certificates, or peer bonuses in the Admin dashboard." />
          </div>
        )}
      </div>
    </Section>
  );
}
