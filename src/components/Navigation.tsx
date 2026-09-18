import React from 'react';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  LineChart,
  Sword,
  Settings,
  Terminal,
  Database
} from 'lucide-react';

export type NavTab = 'dashboard' | 'roadmap' | 'daily' | 'analytics' | 'skills' | 'python' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'Roadmap Tree', icon: Map },
    { id: 'daily', label: 'Daily Tracker', icon: CalendarCheck },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'skills', label: 'Skills Catalog', icon: Sword },
    { id: 'python', label: 'Python Desktop', icon: Terminal, badge: 'PySide6' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full md:w-64 bg-[#0a0f1d] border-b md:border-b-0 md:border-r border-slate-800/80 p-3 md:p-4 flex md:flex-col justify-between shrink-0">
      <div className="w-full">
        <div className="hidden md:block mb-6 px-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Training Matrix
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Product Interview Mode
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1 md:pb-0 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border-l-0 md:border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-l-0 md:border-l-2 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom SQLite status info */}
      <div className="hidden md:block pt-4 border-t border-slate-800/80 mt-auto">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>SQLite Offline Storage</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Syncing persistent tracker.db schema with local storage state.
          </p>
        </div>
      </div>
    </nav>
  );
};
