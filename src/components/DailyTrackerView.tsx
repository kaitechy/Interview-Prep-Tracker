import React, { useState } from 'react';
import { DailyLog, DailySkillEntry, ProductivityPoint } from '../types';
import { ProductivityGraph } from './ProductivityGraph';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

interface DailyTrackerViewProps {
  selectedDate: string;
  onDateChange: (dateStr: string) => void;
  dailyLog: DailyLog;
  onSaveEntry: (entry: DailySkillEntry) => void;
  productivityData: ProductivityPoint[];
  productivityPeriod: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (p: 'daily' | 'weekly' | 'monthly') => void;
}

// The 12 core skills requested in user prompt
const TRACKER_SKILLS = [
  { id: "java", name: "Java Language Mastery", category: "Language", tag: "Java", color: "border-sky-500/40 text-sky-400 bg-sky-950/20" },
  { id: "dsa", name: "DSA (Data Structures & Algorithms)", category: "Problem Solving", tag: "DSA", color: "border-cyan-500/40 text-cyan-400 bg-cyan-950/20" },
  { id: "algorithms", name: "Algorithms", category: "Patterns & Graph", tag: "Algo", color: "border-indigo-500/40 text-indigo-400 bg-indigo-950/20" },
  { id: "data_structures", name: "Data Structures", category: "Core CS", tag: "DS", color: "border-purple-500/40 text-purple-400 bg-purple-950/20" },
  { id: "oop", name: "OOP / OOPS", category: "Core CS", tag: "OOP", color: "border-fuchsia-500/40 text-fuchsia-400 bg-fuchsia-950/20" },
  { id: "sql", name: "SQL", category: "Core CS", tag: "SQL", color: "border-teal-500/40 text-teal-400 bg-teal-950/20" },
  { id: "dbms", name: "DBMS", category: "Core CS", tag: "DBMS", color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20" },
  { id: "computer_networks", name: "Computer Networks", category: "Core CS", tag: "CN", color: "border-green-500/40 text-green-400 bg-green-950/20" },
  { id: "interview_questions", name: "500 Interview Questions", category: "Interview Prep", tag: "500 Qs", color: "border-amber-500/40 text-amber-400 bg-amber-950/20" },
  { id: "speaking", name: "Speaking", category: "Communication", tag: "Voice", color: "border-rose-500/40 text-rose-400 bg-rose-950/20" },
  { id: "grammar", name: "Grammar", category: "Communication", tag: "Grammar", color: "border-pink-500/40 text-pink-400 bg-pink-950/20" },
  { id: "soft_skills", name: "Soft Skills", category: "Communication", tag: "Behavioral", color: "border-violet-500/40 text-violet-400 bg-violet-950/20" },
];

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({
  selectedDate,
  onDateChange,
  dailyLog,
  onSaveEntry,
  productivityData,
  productivityPeriod,
  onPeriodChange
}) => {
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);

  const triggerSaveNotification = () => {
    setSaveIndicator("⚡ Auto-saved to SQLite");
    setTimeout(() => {
      setSaveIndicator(null);
    }, 2000);
  };

  const handleDateShift = (deltaDays: number) => {
    const cur = new Date(selectedDate + "T00:00:00");
    cur.setDate(cur.getDate() + deltaDays);
    onDateChange(cur.toISOString().split("T")[0]);
  };

  const handleSetToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const activeCount = Object.values(dailyLog.entries || {}).filter(e => e.completed).length;
  const totalMinutes = Object.values(dailyLog.entries || {}).filter(e => e.completed).reduce((sum, e) => sum + (e.timeSpentMinutes || 0), 0);
  const totalProblems = Object.values(dailyLog.entries || {}).filter(e => e.completed).reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Date Selection Bar */}
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">
              Parallel Daily Tracker
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{selectedDate}</span>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono">
                  TODAY
                </span>
              )}
            </h2>
          </div>
        </div>

        {/* Date navigation controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => handleDateShift(-1)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
          />

          <button
            onClick={() => handleDateShift(1)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleSetYesterday}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-slate-200 text-xs font-mono"
          >
            Yesterday
          </button>

          <button
            onClick={handleSetToday}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            Today
          </button>
        </div>
      </div>

      {/* Daily Progress summary banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400">Skills Practiced Today</div>
            <div className="text-base font-bold text-white font-mono">
              {activeCount} <span className="text-xs text-slate-500">/ 12 Parallel Skills</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400">Study Duration</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {totalMinutes} <span className="text-xs text-slate-500">min ({Math.round(totalMinutes/60*10)/10} hrs)</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400">Problems Solved</div>
            <div className="text-base font-bold text-amber-400 font-mono">
              {totalProblems} <span className="text-xs text-slate-500">questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 12 Parallel Skills Checklist */}
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              <Zap className="w-4 h-4" />
              PARALLEL DAILY SKILL TRACKER (ALL 12 SKILLS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tick multiple subjects practiced on {selectedDate}. Expand each row to record study minutes, problems solved, and revision notes.
            </p>
          </div>
          {saveIndicator && (
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-mono animate-fade-in">
              {saveIndicator}
            </span>
          )}
        </div>

        {/* 12 skills rows */}
        <div className="space-y-3">
          {TRACKER_SKILLS.map((sk) => {
            const entry = dailyLog.entries?.[sk.id];
            const isChecked = Boolean(entry && entry.completed);
            const timeSpent = entry?.timeSpentMinutes ?? 45;
            const problems = entry?.problemsSolved ?? 0;
            const notes = entry?.notes ?? '';

            return (
              <div
                key={sk.id}
                className={`rounded-xl border transition-all duration-200 p-3.5 ${
                  isChecked
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.06)]'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header row with Checkbox */}
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        onSaveEntry({
                          skillId: sk.id,
                          skillName: sk.name,
                          completed: e.target.checked,
                          timeSpentMinutes: timeSpent,
                          problemsSolved: problems,
                          notes
                        });
                        triggerSaveNotification();
                      }}
                      className="w-5 h-5 rounded border-2 border-slate-700 bg-slate-900 checked:bg-cyan-500 checked:border-cyan-500 text-cyan-500 focus:ring-0 focus:ring-offset-0 transition cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold transition ${isChecked ? 'text-cyan-300 font-bold' : 'text-slate-200'}`}>
                          {sk.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${sk.color}`}>
                          {sk.tag}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {sk.category}
                      </span>
                    </div>
                  </label>

                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                        ACTIVE TODAY
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable fields when ticked */}
                {isChecked && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                    {/* Time spent */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        Time Spent (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        step="15"
                        value={timeSpent}
                        onChange={(e) => {
                          onSaveEntry({
                            skillId: sk.id,
                            skillName: sk.name,
                            completed: true,
                            timeSpentMinutes: parseInt(e.target.value) || 0,
                            problemsSolved: problems,
                            notes
                          });
                          triggerSaveNotification();
                        }}
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                    </div>

                    {/* Problems solved */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-amber-400" />
                        Problems / Questions Solved
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={problems}
                        onChange={(e) => {
                          onSaveEntry({
                            skillId: sk.id,
                            skillName: sk.name,
                            completed: true,
                            timeSpentMinutes: timeSpent,
                            problemsSolved: parseInt(e.target.value) || 0,
                            notes
                          });
                          triggerSaveNotification();
                        }}
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                    </div>

                    {/* Short notes */}
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        Short Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Inverted BST, Two-sum, deadlock revised..."
                        value={notes}
                        onChange={(e) => {
                          onSaveEntry({
                            skillId: sk.id,
                            skillName: sk.name,
                            completed: true,
                            timeSpentMinutes: timeSpent,
                            problemsSolved: problems,
                            notes: e.target.value
                          });
                          triggerSaveNotification();
                        }}
                        className="w-full bg-slate-900 border border-slate-700/80 focus:border-emerald-400 rounded-lg px-2.5 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE REQUIREMENT #5:
          "Below the daily tracker, display an overall productivity graph."
          The graph shows productivity over time based on:
          - Number of skills completed
          - Study sessions
          - Time spent
          - Problems/questions solved
          With Daily / Weekly / Monthly toggles! */}
      <ProductivityGraph
        data={productivityData}
        period={productivityPeriod}
        onPeriodChange={onPeriodChange}
        title="OVERALL PRODUCTIVITY CURVE"
        subtitle="Positioned directly below the daily tracker. Automatically compiles your parallel skill entries."
      />
    </div>
  );
};
