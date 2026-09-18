import React, { useState } from 'react';
import { Category, Skill, SkillStatus } from '../types';
import { Sword, Search, CheckCircle2, Lock, Play, Edit3, Award } from 'lucide-react';

interface SkillsCatalogViewProps {
  categories: Category[];
  onUpdateSkill: (skillId: string, completedItems: number, totalItems?: number, status?: SkillStatus) => void;
}

export const SkillsCatalogView: React.FC<SkillsCatalogViewProps> = ({ categories, onUpdateSkill }) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'locked'>('all');

  const allSkills: (Skill & { categoryName: string })[] = [];
  categories.forEach(c => {
    c.skills.forEach(s => {
      allSkills.push({ ...s, categoryName: c.name });
    });
  });

  const filtered = allSkills.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              SKILLS & PREPARATION CATALOG
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete inventory of technical tracks required to crack product company interviews.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-slate-600"
            />
          </div>

          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['all', 'in_progress', 'completed', 'locked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-2.5 py-1 rounded font-mono capitalize transition ${
                  filterStatus === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => {
          const pct = s.totalItems > 0 ? Math.round((s.completedItems / s.totalItems) * 100) : 0;
          return (
            <div
              key={s.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/40 transition shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {s.categoryName}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    +{s.xpReward} XP
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-mono mt-2">
                  {s.name}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                  <span>Progress</span>
                  <span className="text-cyan-400 font-bold">{s.completedItems} / {s.totalItems} ({pct}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 mb-3">
                  <div
                    className={`h-full rounded-full ${s.status === 'completed' ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-teal-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Status: <strong className="text-slate-300">{s.status.replace('_', ' ')}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateSkill(s.id, Math.min(s.totalItems, s.completedItems + 1))}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700"
                    >
                      +1 Item
                    </button>
                    {s.completedItems < s.totalItems && (
                      <button
                        onClick={() => onUpdateSkill(s.id, s.totalItems, s.totalItems, 'completed')}
                        className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-[11px] font-mono text-emerald-300 border border-emerald-800/50"
                      >
                        Master
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
