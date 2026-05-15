import { useState, useEffect } from 'react';
import { getCollection, addCollectionDocument, updateCollectionDocument, deleteCollectionDocument } from '../../services/firestoreService';
import { Save, Plus, Trash2, Loader2, Code, GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';
import { motion, Reorder } from 'motion/react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
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
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

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
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const id = deleteModal.id;
    setSaving(true);
    try {
      await deleteCollectionDocument('skills', id);
      setSkills(skills.filter(s => s.id !== id));
      setLocalSkills(localSkills.filter(s => s.id !== id));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      alert('Failed to delete skill');
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
        return original && (original.level !== local.level || original.name !== local.name || original.category !== local.category);
      });

      await Promise.all(changedSkills.map(s => 
        updateCollectionDocument('skills', s.id, { level: s.level, name: s.name, category: s.category })
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
    <div className="max-w-5xl space-y-8">
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        isLoading={saving}
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This will remove it from all categories."
      />
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
          Add New Skill
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-blue-500 outline-none transition-all"
              placeholder="Skill Name (e.g. Selenium)"
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
            <div key={category} className="space-y-4">
              <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest pl-2">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catSkills.map(skill => (
                  <div key={skill.id} className="p-4 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all">
                    <div className="flex-1 mr-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-xs text-blue-400 font-mono">{skill.level}%</span>
                      </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={skill.level}
                          onChange={(e) => handleLevelChange(skill.id, parseInt(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-3 -m-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-5 h-5" />
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
