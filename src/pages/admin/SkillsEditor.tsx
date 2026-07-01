import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Globe } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { autoTranslateDocument, bulkAutoTranslateDocuments } from '../../lib/translationUtils';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  translations?: Record<string, any>;
}

const CATEGORIES = [
  'Testing',
  'API & Data',
  'AI in QA',
  'Automation & DevOps',
  'Tools',
  'Leadership'
];

export default function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Testing', level: 80 });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; type: 'skill' | 'category' }>({ isOpen: false, id: null, type: 'skill' });
  const [activeEditorLang, setActiveEditorLang] = useState<'en' | 'hi' | 'fr' | 'de'>('en');
  const [translating, setTranslating] = useState(false);

  const getSkillName = (s: Skill) => {
    if (activeEditorLang === 'en') return s.name;
    return (s as any).translations?.[activeEditorLang]?.name || '';
  };

  const setSkillName = (id: string, nameVal: string) => {
    setLocalSkills(localSkills.map(s => {
      if (s.id !== id) return s;
      const translations = (s as any).translations || {};
      return {
        ...s,
        name: activeEditorLang === 'en' ? nameVal : s.name,
        translations: {
          ...translations,
          [activeEditorLang]: {
            ...(translations[activeEditorLang] || {}),
            name: nameVal
          }
        }
      };
    }));
  };

  const handleCategoryChange = (id: string, category: string) => {
    setLocalSkills(localSkills.map(s => s.id === id ? { ...s, category } : s));
  };

  const handleAutoTranslateAll = async () => {
    if (localSkills.length === 0) return;
    setTranslating(true);
    try {
      // Use efficient bulk translation to avoid quota exhaustion (429 errors)
      const updated = await bulkAutoTranslateDocuments(localSkills);
      setLocalSkills(updated);
      alert('All skills auto-translated successfully! Don’t forget to click "Save All Changes".');
    } catch (e) {
      console.error(e);
      alert('Skills auto-translation failed. Quota may be exhausted, please try again in a few minutes.');
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    async function load() {
      const data = await getCollection<Skill>('skills');
      setSkills(data);
      setLocalSkills(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkill.name) return;
    setSaving(true);
    try {
      // Support comma separated skills
      const skillNames = newSkill.name.split(',')
        .map(n => n.trim())
        .filter(n => n && !skills.some(s => s.name.toLowerCase() === n.toLowerCase()));

      if (skillNames.length === 0) {
        setSaving(false);
        return;
      }

      const addedSkills = await Promise.all(skillNames.map(async (name) => {
        const skillData = { ...newSkill, name };
        const id = await addCollectionDocument('skills', skillData);
        return { ...skillData, id };
      }));

      setSkills([...skills, ...addedSkills]);
      setLocalSkills([...localSkills, ...addedSkills]);
      setNewSkill({ name: '', category: 'Testing', level: 80 });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = (id: string) => {
    setDeleteModal({ isOpen: true, id, type: 'skill' });
  };

  const handleDeleteCategory = (category: string) => {
    setDeleteModal({ isOpen: true, id: category, type: 'category' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const id = deleteModal.id;
    setSaving(true);
    try {
      if (deleteModal.type === 'skill') {
        await deleteCollectionDocument('skills', id);
        setSkills(skills.filter(s => s.id !== id));
        setLocalSkills(localSkills.filter(s => s.id !== id));
      } else {
        // Delete category and its skills
        const skillsToDelete = skills.filter(s => s.category === id);
        await Promise.all(skillsToDelete.map(s => deleteCollectionDocument('skills', s.id)));
        setSkills(skills.filter(s => s.category !== id));
        setLocalSkills(localSkills.filter(s => s.category !== id));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setDeleteModal({ isOpen: false, id: null, type: 'skill' });
    } catch (error) {
      alert(`Failed to delete ${deleteModal.type}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLevelChange = (id: string, level: number) => {
    setLocalSkills(localSkills.map(s => s.id === id ? { ...s, level } : s));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Find changed skills
      const changedSkills = localSkills.filter(local => {
        const original = skills.find(s => s.id === local.id);
        const originalTransStr = JSON.stringify(original?.translations || {});
        const localTransStr = JSON.stringify(local?.translations || {});
        return original && (
          original.level !== local.level || 
          original.name !== local.name || 
          original.category !== local.category ||
          originalTransStr !== localTransStr
        );
      });

      await Promise.all(changedSkills.map(s => 
        updateCollectionDocument('skills', s.id, { 
          level: s.level, 
          name: s.name, 
          category: s.category,
          translations: (s as any).translations || null
        })
      ));

      setSkills(localSkills);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-300">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: 'skill' })}
        onConfirm={confirmDelete}
        isLoading={saving}
        title={deleteModal.type === 'skill' ? "Delete Skill" : "Delete Category"}
        message={deleteModal.type === 'skill' 
          ? "Are you sure you want to delete this skill? This will remove it from all categories." 
          : `Are you sure you want to delete the "${deleteModal.id}" category and ALL its related skills? This action cannot be undone.`}
      />
      
      {/* Top localization bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#050816] border border-white/5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-gray-300">Skills Localization (Active: {activeEditorLang.toUpperCase()})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-lg">
            {(['en', 'hi', 'fr', 'de'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveEditorLang(lang)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all duration-150 cursor-pointer",
                  activeEditorLang === lang 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAutoTranslateAll}
            disabled={translating || localSkills.length === 0}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 disabled:opacity-50 text-blue-400 rounded-lg text-xs font-bold transition-all border border-blue-500/20 cursor-pointer"
          >
            {translating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Globe className="w-3 h-3" />
            )}
            <span>Bulk Auto-Translate All</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Skills & Expertise</h2>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 px-6 py-2 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20",
            saved ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-blue-600 hover:bg-blue-700",
            saving && "opacity-50"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save All Changes'}
        </button>
      </div>

      {/* Add New Skill */}
      <div className="bg-[#050816] border border-white/5 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          Add New Skill (English)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-all text-white text-sm"
              placeholder="Skill Name (e.g. Selenium) or comma-separated list..."
            />
          </div>
          <div>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-all appearance-none"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#050816]">{cat}</option>)}
            </select>
          </div>
          <button
            onClick={handleAddSkill}
            disabled={saving || !newSkill.name}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Skill
          </button>
        </div>
      </div>

      {/* Skills Grouped by Category */}
      <div className="space-y-6">
        {CATEGORIES.map(category => {
          const catSkills = localSkills.filter(s => s.category === category);
          if (catSkills.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between pl-1">
                <h4 className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">{category}</h4>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer border border-red-500/10"
                  title={`Delete entire ${category} category`}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Delete Category</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catSkills.map(skill => (
                  <div key={skill.id} className="p-3 bg-white/2 border border-white/5 rounded-lg flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex-1 mr-3 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        {activeEditorLang === 'en' ? (
                          <input 
                            value={skill.name}
                            onChange={(e) => setSkillName(skill.id, e.target.value)}
                            className="bg-transparent border-b border-transparent focus:border-blue-500/50 outline-none font-medium text-white p-0.5 text-xs w-full truncate"
                            placeholder="Skill Name"
                          />
                        ) : (
                          <input 
                            value={(skill as any).translations?.[activeEditorLang]?.name || ''}
                            onChange={(e) => setSkillName(skill.id, e.target.value)}
                            className="bg-transparent border-b border-white/10 focus:border-blue-500 outline-none font-medium text-xs text-blue-400 p-0.5 w-full truncate"
                            placeholder={`${activeEditorLang.toUpperCase()}...`}
                          />
                        )}
                        <span className="text-[10px] text-blue-400 font-mono ml-1 shrink-0">{skill.level}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => handleLevelChange(skill.id, parseInt(e.target.value))}
                          className="flex-1 h-0.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <select
                          value={skill.category}
                          onChange={(e) => handleCategoryChange(skill.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-gray-500 focus:text-white outline-none appearance-none cursor-pointer"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#050816]">{cat}</option>)}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all rounded cursor-pointer shrink-0"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
