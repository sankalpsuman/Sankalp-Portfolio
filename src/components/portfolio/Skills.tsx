import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Workflow, 
  Users 
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const DEFAULT_SKILLS: Skill[] = [
  { id: 'ai_testing', name: 'AI-Driven Testing', category: 'AI in QA', level: 95 },
  { id: 'prompt_heavy', name: 'Prompt Engineering', category: 'AI in QA', level: 90 },
  { id: 'api_validation', name: 'API Validation (REST/SOAP)', category: 'API & Data', level: 92 },
  { id: 'selenium_playwright', name: 'Selenium / Playwright', category: 'Testing', level: 88 },
  { id: 'sql_db', name: 'SQL & Database Testing', category: 'API & Data', level: 85 },
  { id: 'scrum_lead', name: 'Scrum Leadership', category: 'Leadership', level: 90 },
  { id: 'cicd_pipeline', name: 'CI/CD Pipelines (Jenkins/GitHub Actions)', category: 'Automation & DevOps', level: 82 },
  { id: 'etl_testing', name: 'ETL Testing', category: 'API & Data', level: 85 },
];

const CATEGORIES = [
  { name: 'Testing', icon: ShieldCheck, color: 'blue', key: 'testing' },
  { name: 'API & Data', icon: Database, color: 'purple', key: 'api_data' },
  { name: 'AI in QA', icon: Cpu, color: 'cyan', key: 'ai_qa' },
  { name: 'Automation & DevOps', icon: Workflow, color: 'emerald', key: 'automation_devops' },
  { name: 'Leadership', icon: Users, color: 'orange', key: 'leadership' },
];

export default function Skills() {
  const [items, setItems] = useState<Skill[]>([]);
  const { t, resolveTranslation } = useLanguage();

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

  const getCategoryName = (category: string) => {
    const norm = category.toLowerCase().trim();
    if (norm.includes('testing')) return t('skills.categories.testing');
    if (norm.includes('api') || norm.includes('data')) return t('skills.categories.api_data');
    if (norm.includes('ai') || norm.includes('qa')) return t('skills.categories.ai_qa');
    if (norm.includes('automation') || norm.includes('devops')) return t('skills.categories.automation_devops');
    if (norm.includes('leadership')) return t('skills.categories.leadership');
    return category;
  };

  const getSkillName = (skill: Skill) => {
    const translated = t(`skills.list.${skill.id}`);
    if (translated !== `skills.list.${skill.id}`) {
      return translated;
    }
    
    const map: Record<string, string> = {
      'ai-driven testing': t('skills.list.ai_testing'),
      'prompt engineering': t('skills.list.prompt_heavy'),
      'api validation (rest/soap)': t('skills.list.api_validation'),
      'selenium / playwright': t('skills.list.selenium_playwright'),
      'sql & database testing': t('skills.list.sql_db'),
      'scrum leadership': t('skills.list.scrum_lead'),
      'ci/cd pipelines (jenkins/github actions)': t('skills.list.cicd_pipeline'),
      'etl testing': t('skills.list.etl_testing')
    };
    
    return map[skill.name.toLowerCase().trim()] || resolveTranslation(skill, 'name');
  };

  return (
    <Section id="skills" title={t('skills.title')} subtitle={t('skills.subtitle')}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, catIdx) => {
          // Filter matching skills. We normalize the check to match both database and fallbacks
          const catSkills = items.filter(s => {
            const sCat = s.category.toLowerCase().trim();
            const cName = cat.name.toLowerCase().trim();
            return sCat === cName || 
                   (cName.includes('api') && sCat.includes('api')) ||
                   (cName.includes('ai') && sCat.includes('ai')) ||
                   (cName.includes('devops') && sCat.includes('devops'));
          });
          
          if (catSkills.length === 0) return null;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.1 }}
              className="p-8 bg-white/[0.01] backdrop-blur-md border border-white/5 rounded-3xl hover:border-brand/35 hover:bg-white/[0.03] transition-all group relative overflow-hidden shadow-lg"
            >
              {/* Visual Glass Reflection Glare */}
              <div className="absolute top-0 -left-1/2 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-25 group-hover:left-[150%] transition-all duration-[1000ms] ease-out pointer-events-none" />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="p-3 rounded-2xl bg-white/5 text-brand border border-white/10 group-hover:scale-110 group-hover:border-brand/40 group-hover:bg-brand/10 transition-all duration-300">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-brand transition-colors duration-300">{getCategoryName(cat.name)}</h3>
              </div>

              <div className="space-y-6">
                {catSkills.map((skill) => (
                  <div key={skill.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 font-medium">{getSkillName(skill)}</span>
                      <span className="text-brand font-mono">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-brand to-purple-600 rounded-full"
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
