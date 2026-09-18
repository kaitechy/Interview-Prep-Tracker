import React, { useState } from 'react';
import { Category, Skill, SkillStatus } from '../types';
import {
  Map,
  Plus,
  CheckCircle2,
  Lock,
  Play,
  ArrowDown,
  Edit3,
  Layers,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface RoadmapViewProps {
  categories: Category[];
  onUpdateSkill: (skillId: string, completedItems: number, totalItems?: number, status?: SkillStatus) => void;
  onAddSubtopic: (parentId: string, name: string, totalItems: number) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  categories,
  onUpdateSkill,
  onAddSubtopic
}) => {
  const [activeModalSkill, setActiveModalSkill] = useState<Skill | null>(null);
  const [editCompleted, setEditCompleted] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(10);
  const [editStatus, setEditStatus] = useState<SkillStatus>('in_progress');

  // Subtopic modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [subtopicParentId, setSubtopicParentId] = useState<string>('dsa');
  const [newSubtopicName, setNewSubtopicName] = useState<string>('');
  const [newSubtopicTotal, setNewSubtopicTotal] = useState<number>(10);

  const openEditModal = (skill: Skill) => {
    setActiveModalSkill(skill);
    setEditCompleted(skill.completedItems);
    setEditTotal(skill.totalItems);
    setEditStatus(skill.status);
  };

  const handleSaveProgress = () => {
    if (activeModalSkill) {
      onUpdateSkill(activeModalSkill.id, editCompleted, editTotal, editStatus);
      setActiveModalSkill(null);
    }
  };

  const handleCreateSubtopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopicName.trim()) return;
    onAddSubtopic(subtopicParentId, newSubtopicName.trim(), newSubtopicTotal);
    setNewSubtopicName('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-bold">
            <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            IN PROGRESS
          </span>
        );
      case 'locked':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
            <Lock className="w-3 h-3 text-slate-400" />
            LOCKED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              INTERACTIVE PREPARATION ROADMAP & SKILL TREE
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual progression track designed specifically to crack product-based company technical interviews. Click any topic to update mastery.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_15px_rgba(0,240,255,0.2)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subtopic</span>
        </button>
      </div>

      {/* Structured Roadmap Categories */}
      <div className="space-y-6">
        {categories.map((cat, idx) => {
          const totalItems = cat.skills.reduce((acc, s) => acc + s.totalItems, 0);
          const completedItems = cat.skills.reduce((acc, s) => acc + s.completedItems, 0);
          const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          return (
            <div
              key={cat.id}
              className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                      0{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 ml-8">
                    {cat.description}
                  </p>
                </div>

                {/* Progress bar & percentage */}
                <div className="flex items-center gap-3 sm:ml-auto">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-cyan-400">
                      {completedItems} / {totalItems} items ({pct}%)
                    </div>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skills Tree Grid inside Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cat.skills.map((skill) => {
                  const sPct = skill.totalItems > 0 ? Math.round((skill.completedItems / skill.totalItems) * 100) : 0;
                  const isSub = Boolean(skill.parentId);

                  return (
                    <div
                      key={skill.id}
                      onClick={() => openEditModal(skill)}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                        isSub ? 'ml-4 bg-slate-900/40' : 'bg-slate-900/80'
                      } ${
                        skill.status === 'completed'
                          ? 'border-emerald-500/40 hover:border-emerald-400'
                          : skill.status === 'in_progress'
                          ? 'border-slate-800 hover:border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.04)]'
                          : 'border-slate-800/60 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {isSub && <span className="text-slate-600 font-mono">↳</span>}
                          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                            {skill.name}
                          </h4>
                        </div>
                        {getStatusBadge(skill.status)}
                      </div>

                      {/* Progress Bar & Details */}
                      <div className="space-y-1.5 mt-3">
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>Progress</span>
                          <span className="text-cyan-400 font-bold">{skill.completedItems} / {skill.totalItems} ({sPct}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              skill.status === 'completed'
                                ? 'bg-emerald-400'
                                : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                            }`}
                            style={{ width: `${sPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                        <span>Reward: +{skill.xpReward} XP</span>
                        <span className="flex items-center gap-1 text-cyan-400/80 group-hover:text-cyan-300">
                          <Edit3 className="w-3 h-3" />
                          <span>Update</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecting Flow Arrow between linear roadmap sections */}
              {idx < 2 && (
                <div className="flex justify-center mt-5 -mb-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    <span>Next Milestone Phase</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Skill Progress Modal */}
      {activeModalSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0c1222] border border-cyan-500/50 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Update Skill: {activeModalSkill.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalSkill(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Completed Topics / Questions:
                </label>
                <input
                  type="number"
                  min="0"
                  max={editTotal}
                  value={editCompleted}
                  onChange={(e) => setEditCompleted(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Total Target Topics / Problems:
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={editTotal}
                  onChange={(e) => setEditTotal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Skill Mastery Status:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SkillStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="locked">Locked</option>
                </select>
              </div>

              {/* Progress preview */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Calculated Mastery:</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round((editCompleted / Math.max(1, editTotal)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (editCompleted / Math.max(1, editTotal)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModalSkill(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Subtopic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateSubtopic}
            className="w-full max-w-md bg-[#0c1222] border border-cyan-500/50 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Add Custom Subtopic
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Parent Skill Track:
                </label>
                <select
                  value={subtopicParentId}
                  onChange={(e) => setSubtopicParentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                >
                  <option value="dsa">DSA (Data Structures & Algorithms)</option>
                  <option value="dsa_beginner">DSA - Beginner</option>
                  <option value="dsa_intermediate">DSA - Intermediate</option>
                  <option value="dsa_expert">DSA - Expert</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="java">Java Language Mastery</option>
                  <option value="data_structures">Data Structures</option>
                  <option value="interview_questions">500 Interview Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Subtopic Name (e.g. Dynamic Programming, Trie, Sliding Window):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dynamic Programming"
                  value={newSubtopicName}
                  onChange={(e) => setNewSubtopicName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Target Problems / Items Count:
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newSubtopicTotal}
                  onChange={(e) => setNewSubtopicTotal(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                Add Subtopic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
