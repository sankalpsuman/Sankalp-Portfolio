import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Workflow, 
  Terminal, 
  Users 
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'AI-Driven Testing', category: 'AI in QA', level: 95 },
  { id: '2', name: 'Prompt Engineering', category: 'AI in QA', level: 90 },
  { id: '3', name: 'API Validation (REST/SOAP)', category: 'API & Data', level: 92 },
  { id: '4', name: 'Selenium / Playwright', category: 'Testing', level: 88 },
  { id: '5', name: 'SQL & Database Testing', category: 'API & Data', level: 85 },
  { id: '6', name: 'Scrum Leadership', category: 'Leadership', level: 90 },
  { id: '7', name: 'CI/CD Pipelines (Jenkins/GitHub Actions)', category: 'Automation & DevOps', level: 82 },
  { id: '8', name: 'ETL Testing', category: 'API & Data', level: 85 },
];

const CATEGORIES = [
  { name: 'Testing', icon: ShieldCheck, color: 'blue' },
  { name: 'API & Data', icon: Database, color: 'purple' },
  { name: 'AI in QA', icon: Cpu, color: 'cyan' },
  { name: 'Automation & DevOps', icon: Workflow, color: 'emerald' },
  { name: 'Leadership', icon: Users, color: 'orange' },
];

export default function Skills() {
  const [items, setItems] = useState<Skill[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollection<Skill>('skills');
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEFAULT_SKILLS);
        }
      } catch (err) {
        console.warn("Skills data load failed, using fallbacks:", err);
        setItems(DEFAULT_SKILLS);
      }
    }
    load();
  }, []);

  return (
    <Section id="skills" title="Technical Arsenal" subtitle="Skills">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, catIdx) => {
          const catSkills = items.filter(s => s.category === cat.name);
          if (catSkills.length === 0) return null;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1 }}
              className="p-8 bg-white/2 border border-white/5 rounded-3xl hover:border-blue-500/20 transition-all group hover:bg-white/5"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl bg-white/5 text-blue-400 border border-white/10 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">{cat.name}</h3>
              </div>

              <div className="space-y-6">
                {catSkills.map((skill) => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 font-medium">{skill.name}</span>
                      <span className="text-blue-400 font-mono">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
