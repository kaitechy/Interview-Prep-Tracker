import React, { useState, useEffect } from 'react';
import { StorageService } from './storage/db';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { RoadmapView } from './components/RoadmapView';
import { DailyTrackerView } from './components/DailyTrackerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SkillsCatalogView } from './components/SkillsCatalogView';
import { PythonAppViewer } from './components/PythonAppViewer';
import { SettingsView } from './components/SettingsView';
import { Category, DailyLog, DailySkillEntry, DashboardMetrics, ProductivityPoint, SkillStatus } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [productivityPeriod, setProductivityPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Storage and metrics state
  const [categories, setCategories] = useState<Category[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog>({ date: selectedDate, entries: {}, updatedAt: '' });
  const [dailyLogsMap, setDailyLogsMap] = useState<Record<string, DailyLog>>({});
  const [productivityData, setProductivityData] = useState<ProductivityPoint[]>([]);

  const reloadData = () => {
    const storage = StorageService.getInstance();
    const cats = storage.getCategories();
    setCategories([...cats]);
    setMetrics(storage.getDashboardMetrics());
    setDailyLog(storage.getDailyLog(selectedDate));
    
    // Refresh full logs map
    const fullLogs: Record<string, DailyLog> = {};
    for (let i = 0; i < 120; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const l = storage.getDailyLog(dStr);
      if (Object.keys(l.entries).length > 0) {
        fullLogs[dStr] = l;
      }
    }
    setDailyLogsMap(fullLogs);
    setProductivityData(storage.getProductivityData(productivityPeriod));
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    const storage = StorageService.getInstance();
    setDailyLog(storage.getDailyLog(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const storage = StorageService.getInstance();
    setProductivityData(storage.getProductivityData(productivityPeriod));
  }, [productivityPeriod]);

  // Skill updates
  const handleUpdateSkill = (skillId: string, completedItems: number, totalItems?: number, status?: SkillStatus) => {
    const storage = StorageService.getInstance();
    storage.updateSkillProgress(skillId, completedItems, totalItems, status);
    reloadData();
  };

  // Add custom subtopic
  const handleAddSubtopic = (parentId: string, name: string, totalItems: number) => {
    const storage = StorageService.getInstance();
    storage.addSubtopic(parentId, name, totalItems);
    reloadData();
  };

  // Save daily entry
  const handleSaveDailyEntry = (entry: DailySkillEntry) => {
    const storage = StorageService.getInstance();
    storage.saveDailySkillEntry(selectedDate, entry);
    reloadData();
  };

  // Reset
  const handleReset = () => {
    const storage = StorageService.getInstance();
    storage.resetToDefaults();
    reloadData();
  };

  if (!metrics) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Booting Interview Quest Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* HUD Top Stats Header */}
      <Header
        metrics={metrics}
        onOpenPythonCode={() => setCurrentTab('python')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              categories={categories}
              dailyLogs={dailyLogsMap}
              productivityData={productivityData}
              productivityPeriod={productivityPeriod}
              onPeriodChange={setProductivityPeriod}
              onNavigateTab={setCurrentTab}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setCurrentTab('daily');
              }}
              selectedDate={selectedDate}
              onOpenPythonModal={() => setCurrentTab('python')}
            />
          )}

          {currentTab === 'roadmap' && (
            <RoadmapView
              categories={categories}
              onUpdateSkill={handleUpdateSkill}
              onAddSubtopic={handleAddSubtopic}
            />
          )}

          {currentTab === 'daily' && (
            <DailyTrackerView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              dailyLog={dailyLog}
              onSaveEntry={handleSaveDailyEntry}
              productivityData={productivityData}
              productivityPeriod={productivityPeriod}
              onPeriodChange={setProductivityPeriod}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              metrics={metrics}
              dailyLogs={dailyLogsMap}
              categories={categories}
              productivityData={productivityData}
              productivityPeriod={productivityPeriod}
              onPeriodChange={setProductivityPeriod}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setCurrentTab('daily');
              }}
              selectedDate={selectedDate}
            />
          )}

          {currentTab === 'skills' && (
            <SkillsCatalogView
              categories={categories}
              onUpdateSkill={handleUpdateSkill}
            />
          )}

          {currentTab === 'python' && (
            <PythonAppViewer />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
