import React from 'react';
import { DailyLog } from '../types';
import { Flame, Calendar, CheckCircle2 } from 'lucide-react';

interface ActivityHeatmapProps {
  dailyLogs: Record<string, DailyLog>;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  dailyLogs,
  onSelectDate,
  selectedDate
}) => {
  // Generate past 16 weeks of days ending today
  const weeksCount = 16;
  const today = new Date();
  
  // Calculate day cells
  const days: { dateStr: string; dayOfWeek: number; count: number; minutes: number }[] = [];
  const totalDays = weeksCount * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = dailyLogs[dateStr];
    const activeEntries = log ? Object.values(log.entries).filter(e => e.completed) : [];
    const count = activeEntries.length;
    const minutes = activeEntries.reduce((acc, e) => acc + (e.timeSpentMinutes || 0), 0);

    days.push({
      dateStr,
      dayOfWeek: d.getDay(),
      count,
      minutes
    });
  }

  // Calculate activity statistics
  const activeDaysCount = Object.values(dailyLogs).filter(l => Object.values(l.entries).some(e => e.completed)).length;
  const mostProductiveDay = Object.values(dailyLogs).reduce((max, log) => {
    const active = Object.values(log.entries).filter(e => e.completed);
    const count = active.length;
    return count > max.count ? { date: log.date, count } : max;
  }, { date: 'None', count: 0 });

  const getCellColor = (count: number, isSelected: boolean) => {
    if (isSelected) return 'ring-2 ring-cyan-400 bg-cyan-400 text-slate-950';
    if (count === 0) return 'bg-slate-900 border border-slate-800/60 hover:border-slate-700';
    if (count === 1) return 'bg-cyan-950/80 border border-cyan-800/50 hover:bg-cyan-900';
    if (count === 2) return 'bg-cyan-700 border border-cyan-600/60 hover:bg-cyan-600';
    if (count <= 4) return 'bg-cyan-500 border border-cyan-400 hover:bg-cyan-400';
    return 'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(0,255,157,0.4)]';
  };

  return (
    <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              STUDY STREAK & CONTRIBUTION HEATMAP
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            GitHub-style activity matrix tracking consistent interview preparation intensity.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-cyan-950 border border-cyan-800" />
            <div className="w-3 h-3 rounded-sm bg-cyan-700" />
            <div className="w-3 h-3 rounded-sm bg-cyan-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[580px]">
          {days.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.dateStr}
                onClick={() => onSelectDate(d.dateStr)}
                title={`${d.dateStr}: ${d.count} skills completed, ${d.minutes} min studied`}
                className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 focus:outline-none ${getCellColor(
                  d.count,
                  isSelected
                )}`}
              />
            );
          })}
        </div>
      </div>

      {/* Stats summary row */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Total Study Days: <strong className="text-white">{activeDaysCount} days</strong></span>
        </div>
        <div>
          <span>Most Productive Day: <strong className="text-cyan-400">{mostProductiveDay.date}</strong> ({mostProductiveDay.count} skills)</span>
        </div>
        <div>
          <span>Selected Date: <strong className="text-amber-400">{selectedDate}</strong></span>
        </div>
      </div>
    </div>
  );
};
