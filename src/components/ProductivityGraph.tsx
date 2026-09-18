import React, { useState } from 'react';
import { ProductivityPoint } from '../types';
import { LineChart, BarChart3, Clock, CheckSquare, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ProductivityGraphProps {
  data: ProductivityPoint[];
  period: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (p: 'daily' | 'weekly' | 'monthly') => void;
  title?: string;
  subtitle?: string;
}

export const ProductivityGraph: React.FC<ProductivityGraphProps> = ({
  data,
  period,
  onPeriodChange,
  title = "PRODUCTIVITY PROGRESSION OVER TIME",
  subtitle = "Real-time metrics compiled dynamically from persistent daily activity logs."
}) => {
  const [metric, setMetric] = useState<'skillsCompleted' | 'studySessions' | 'timeSpentMinutes' | 'problemsSolved'>('skillsCompleted');

  const metricConfig = {
    skillsCompleted: {
      name: 'Skills Completed',
      color: '#00f0ff',
      unit: 'skills',
      icon: CheckSquare
    },
    studySessions: {
      name: 'Study Sessions',
      color: '#818cf8',
      unit: 'sessions',
      icon: BarChart3
    },
    timeSpentMinutes: {
      name: 'Time Spent',
      color: '#00ff9d',
      unit: 'min',
      icon: Clock
    },
    problemsSolved: {
      name: 'Problems Solved',
      color: '#f59e0b',
      unit: 'probs',
      icon: Target
    }
  };

  const current = metricConfig[metric];

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as ProductivityPoint;
      return (
        <div className="bg-[#0b1120] border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs font-mono">
          <div className="text-cyan-400 font-bold mb-1.5">{item.date} ({item.label})</div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Skills Studied:</span>
              <span className="font-bold text-cyan-300">{item.skillsCompleted}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Time Spent:</span>
              <span className="font-bold text-emerald-300">{item.timeSpentMinutes} min</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Problems Solved:</span>
              <span className="font-bold text-amber-300">{item.problemsSolved}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="productivity-graph-card" className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            {(Object.keys(metricConfig) as (keyof typeof metricConfig)[]).map((key) => {
              const active = metric === key;
              const cfg = metricConfig[key];
              return (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cfg.name}
                </button>
              );
            })}
          </div>

          {/* Period Toggle (Daily / Weekly / Monthly) */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => {
              const active = period === p;
              return (
                <button
                  key={p}
                  id={`period-btn-${p}`}
                  onClick={() => onPeriodChange(p)}
                  className={`px-3 py-1 rounded font-mono capitalize transition-all ${
                    active
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metric Quick Values */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-500">Selected Metric</div>
          <div className="text-sm font-bold text-cyan-400 font-mono flex items-center gap-1.5 mt-0.5">
            <current.icon className="w-3.5 h-3.5 text-cyan-400" />
            {current.name}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-500">Period Max</div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {Math.max(...data.map(d => d[metric]), 0)} {current.unit}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-500">Period Total</div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            {data.reduce((acc, d) => acc + d[metric], 0)} {current.unit}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-500">Average / Entry</div>
          <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
            {data.length > 0 ? (data.reduce((acc, d) => acc + d[metric], 0) / data.length).toFixed(1) : 0} {current.unit}
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={current.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={current.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={current.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#color-${metric})`}
              dot={{ r: 3, fill: current.color, stroke: '#0a0f1d', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: current.color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
