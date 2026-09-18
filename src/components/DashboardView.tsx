import React from 'react';
import { DashboardMetrics, Category, DailyLog, ProductivityPoint } from '../types';
import { ProductivityGraph } from './ProductivityGraph';
import { ActivityHeatmap } from './ActivityHeatmap';
import {
  Award,
  Zap,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldAlert,
  Terminal,
  Code2
} from 'lucide-react';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  categories: Category[];
  dailyLogs: Record<string, DailyLog>;
  productivityData: ProductivityPoint[];
  productivityPeriod: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (p: 'daily' | 'weekly' | 'monthly') => void;
  onNavigateTab: (tab: any) => void;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
  onOpenPythonModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  categories,
  dailyLogs,
  productivityData,
  productivityPeriod,
  onPeriodChange,
  onNavigateTab,
  onSelectDate,
  selectedDate,
  onOpenPythonModal
}) => {
  // 8 Core Dashboard Indicators
  const kpiCards = [
    {
      id: 'kpi-overall',
      title: 'Overall Progress',
      value: `${metrics.overallProgressPct}%`,
      subtitle: `${metrics.totalSkillsCompleted} / ${metrics.totalSkillsCount} Skills Mastered`,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-950/20',
      icon: Award
    },
    {
      id: 'kpi-level',
      title: 'Current Level',
      value: `LVL ${metrics.level}`,
      subtitle: metrics.levelTitle,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgColor: 'bg-cyan-950/20',
      icon: Zap
    },
    {
      id: 'kpi-completed',
      title: 'Skills Completed',
      value: `${metrics.totalSkillsCompleted}`,
      subtitle: `Target: ${metrics.totalSkillsCount} Skills`,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/30',
      bgColor: 'bg-teal-950/20',
      icon: CheckCircle2
    },
    {
      id: 'kpi-sessions',
      title: 'Study Sessions',
      value: `${metrics.totalStudySessions}`,
      subtitle: `${metrics.totalStudyHours} Total Hours`,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      bgColor: 'bg-indigo-950/20',
      icon: Clock
    },
    {
      id: 'kpi-streak',
      title: 'Current Streak',
      value: `🔥 ${metrics.currentStreak} Days`,
      subtitle: `Active Daily Chain`,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-950/20',
      icon: Flame
    },
    {
      id: 'kpi-longest-streak',
      title: 'Longest Streak',
      value: `${metrics.longestStreak} Days`,
      subtitle: `Personal All-Time Record`,
      color: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-950/20',
      icon: TrendingUp
    },
    {
      id: 'kpi-today',
      title: "Today's Progress",
      value: `${metrics.todaySkillsCount} Skills`,
      subtitle: `${metrics.todayTimeMinutes} min • ${metrics.todayProblemsSolved} probs`,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgColor: 'bg-rose-950/20',
      icon: Calendar
    },
    {
      id: 'kpi-productivity',
      title: 'Productivity Score',
      value: `${metrics.overallProductivity} / 100`,
      subtitle: 'Dynamic Interview Readiness Index',
      color: 'text-cyan-300',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/30',
      icon: Target
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Hero Card */}
      <div className="w-full bg-gradient-to-r from-[#0c1222] via-[#0f172a] to-[#0c1222] border border-cyan-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700/60 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                OBJECTIVE: CRACK PRODUCT-BASED INTERVIEWS
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                • Offline SQLite Persistence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide font-mono">
              FUTURISTIC DEVELOPER TRAINING DASHBOARD
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Track multi-track progress across Java Mastery, 3-tier DSA progression, Algorithms, Core CS (SQL/DBMS/Networks), 500 Interview Questions, and Communication skills simultaneously.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('daily')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              <span>Tick Today's Skills</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateTab('roadmap')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs font-mono transition"
            >
              <span>Explore Skill Tree</span>
            </button>

            <button
              onClick={onOpenPythonModal}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-700/40 text-cyan-300 text-xs font-mono transition"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Python Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className={`p-4 rounded-xl border ${kpi.borderColor} ${kpi.bgColor} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${kpi.color}`}>
                {kpi.value}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {kpi.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Progress Rings / Tracks Preview */}
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              CURRICULUM CATEGORY BREAKDOWN
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current completion status across the 6 major preparation modules.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('roadmap')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Full Skill Tree</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categories.map((cat) => {
            const total = cat.skills.reduce((sum, s) => sum + s.totalItems, 0);
            const comp = cat.skills.reduce((sum, s) => sum + s.completedItems, 0);
            const pct = total > 0 ? Math.round((comp / total) * 100) : 0;

            return (
              <div
                key={cat.id}
                onClick={() => onNavigateTab('roadmap')}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono truncate">
                    {cat.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 shrink-0 ml-2">
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800 mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{comp} of {total} completed</span>
                  <span>{cat.skills.length} tracks</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productivity Graph */}
      <ProductivityGraph
        data={productivityData}
        period={productivityPeriod}
        onPeriodChange={onPeriodChange}
        title="DYNAMIC PRODUCTIVITY ANALYTICS"
        subtitle="Calculated dynamically from your daily parallel sessions, study minutes, and solved problems."
      />

      {/* GitHub-style Activity Heatmap */}
      <ActivityHeatmap
        dailyLogs={dailyLogs}
        onSelectDate={onSelectDate}
        selectedDate={selectedDate}
      />
    </div>
  );
};
