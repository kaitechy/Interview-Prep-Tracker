import React from 'react';
import { Flame, Shield, Zap, Award, Terminal, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface HeaderProps {
  metrics: DashboardMetrics;
  onOpenPythonCode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ metrics, onOpenPythonCode }) => {
  return (
    <header id="app-header" className="relative z-10 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand & Level Badge */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Shield className="w-6 h-6 text-cyan-400" />
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-cyan-500 text-[9px] font-black text-slate-950 font-mono">
                LVL{metrics.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  Level {metrics.level}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {metrics.levelTitle}
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                INTERVIEW QUEST
                <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                  DESKTOP v1.0
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Python code launcher on mobile */}
          <button
            onClick={onOpenPythonCode}
            className="md:hidden flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python</span>
          </button>
        </div>

        {/* Center: XP Progression Bar */}
        <div className="w-full md:max-w-md flex-1 px-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-mono text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <strong className="text-white">{metrics.xp.toLocaleString()}</strong>
              <span className="text-slate-500">/ {metrics.nextLevelXp.toLocaleString()} XP</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {metrics.levelProgressPct}% TO LVL {metrics.level + 1}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              style={{ width: `${Math.max(4, metrics.levelProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Right: Quick HUD Indicators (Streak, Overall %, Python Desktop CTA) */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {/* Flame Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/40">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
            <div>
              <div className="text-[10px] font-mono text-amber-300/80 uppercase leading-none">Streak</div>
              <div className="text-xs font-bold text-amber-300 font-mono leading-tight">
                {metrics.currentStreak} DAYS
              </div>
            </div>
          </div>

          {/* Overall Preparation Progress */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
            <Award className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono text-emerald-300/80 uppercase leading-none">Readiness</div>
              <div className="text-xs font-bold text-emerald-300 font-mono leading-tight">
                {metrics.overallProgressPct}%
              </div>
            </div>
          </div>

          {/* Python Desktop App Modal Button */}
          <button
            id="btn-python-modal"
            onClick={onOpenPythonCode}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 transition-all duration-200 text-xs font-mono font-semibold shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Python Desktop Code</span>
          </button>
        </div>

      </div>
    </header>
  );
};
