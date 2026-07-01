import { useState, useEffect } from 'react';
import Section from './Section';
import { motion } from 'motion/react';
import { getCollection } from '../../services/firestoreService';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Workflow, 
  Users,
  Terminal
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

const DEFAULT_SKILLS: Skill[] = [
  // Testing
  { id: 'functional', name: 'Functional Testing', category: 'Testing', level: 95 },
  { id: 'regression', name: 'Regression & Smoke', category: 'Testing', level: 95 },
  { id: 'sit_uat', name: 'System/SIT & UAT', category: 'Testing', level: 90 },
  { id: 'bdd', name: 'BDD Acceptance Criteria', category: 'Testing', level: 88 },
  { id: 'exploratory', name: 'Exploratory & Sanity', category: 'Testing', level: 90 },

  // API & Data
  { id: 'postman', name: 'Postman & REST API', category: 'API & Data', level: 92 },
  { id: 'sql_db', name: 'SQL & Database Testing', category: 'API & Data', level: 88 },
  { id: 'etl_testing', name: 'ETL Validation & Mapping', category: 'API & Data', level: 85 },

  // AI in QA
  { id: 'ai_tools', name: 'ChatGPT, Copilot, Gemini', category: 'AI in QA', level: 95 },
  { id: 'prompt_eng', name: 'Prompt Engineering', category: 'AI in QA', level: 90 },
  { id: 'ai_gen', name: 'AI Test Case Generation', category: 'AI in QA', level: 92 },
  { id: 'ai_debug', name: 'AI Debugging', category: 'AI in QA', level: 85 },

  // Automation & DevOps
  { id: 'cicd', name: 'Jenkins & CI/CD', category: 'Automation & DevOps', level: 85 },
  { id: 'docker_linux', name: 'Docker & Linux', category: 'Automation & DevOps', level: 80 },
  { id: 'opkey', name: 'OpKey', category: 'Automation & DevOps', level: 82 },

  // Tools
  { id: 'jira_confluence', name: 'JIRA & Confluence', category: 'Tools', level: 95 },
  { id: 'alm_zephyr', name: 'Zephyr, Octane, ALM', category: 'Tools', level: 90 },

  // Leadership / Process
  { id: 'scrum_agile', name: 'Agile & Scrum Master', category: 'Leadership', level: 95 },
  { id: 'rca', name: 'Defect Triage & RCA', category: 'Leadership', level: 92 },
  { id: 'release', name: 'Release Management', category: 'Leadership', level: 88 },
];

const CATEGORIES = [
  { name: 'Testing', icon: ShieldCheck, color: 'blue', key: 'testing' },
  { name: 'API & Data', icon: Database, color: 'purple', key: 'api_data' },
  { name: 'AI in QA', icon: Cpu, color: 'cyan', key: 'ai_qa' },
  { name: 'Automation & DevOps', icon: Workflow, color: 'emerald', key: 'automation_devops' },
  { name: 'Tools', icon: Terminal, color: 'slate', key: 'tools' },
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

  const getCategoryName = (category: string, key: string) => {
    const translated = t(`skills.categories.${key}`);
    if (translated !== `skills.categories.${key}`) return translated;
    
    const norm = category.toLowerCase().trim();
    if (norm.includes('testing')) return t('skills.categories.testing');
    if (norm.includes('api') || norm.includes('data')) return t('skills.categories.api_data');
    if (norm.includes('ai') || norm.includes('qa')) return t('skills.categories.ai_qa');
    if (norm.includes('automation') || norm.includes('devops')) return t('skills.categories.automation_devops');
    if (norm.includes('tools')) return t('skills.categories.tools') || "Tools";
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
    <Section id="skills" title={t('skills.title') || "Professional Toolkit"} subtitle={t('skills.subtitle')}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {CATEGORIES.map((cat, catIdx) => {
          // Filter matching skills. We normalize the check to match both database and fallbacks
          const catSkills = items.filter(s => {
            const sCat = s.category.toLowerCase().trim();
            const cName = cat.name.toLowerCase().trim();
            return sCat === cName || 
                   (cName.includes('api') && sCat.includes('api')) ||
                   (cName.includes('ai') && sCat.includes('ai')) ||
                   (cName.includes('devops') && sCat.includes('devops')) ||
                   (cName.includes('tools') && sCat.includes('tools'));
          });
          
          if (catSkills.length === 0) return null;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: catIdx * 0.05 }}
              className="p-5 bg-white/[0.01] backdrop-blur-sm border border-white/5 rounded-2xl hover:border-brand/20 transition-all group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="p-2 rounded-lg bg-brand/5 text-brand group-hover:bg-brand/10 transition-colors">
                  <cat.icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase">{getCategoryName(cat.name, cat.key)}</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                {catSkills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="flex items-center justify-between p-1.5 rounded-md bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group/skill"
                  >
                    <span className="text-[10px] font-medium text-gray-400 group-hover/skill:text-gray-200 transition-colors truncate pr-1">
                      {getSkillName(skill)}
                    </span>
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
