import React, { useState } from 'react';
import { Settings, RefreshCw, Download, Upload, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StorageService } from '../storage/db';

interface SettingsViewProps {
  onReset: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onReset }) => {
  const [exportJson, setExportJson] = useState<string>('');
  const [importJson, setImportJson] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = () => {
    const data = StorageService.getInstance().exportBackup();
    setExportJson(data);
    setMessage("Export created! You can copy the JSON backup or save it.");
  };

  const handleImport = () => {
    if (!importJson.trim()) return;
    const ok = StorageService.getInstance().importBackup(importJson.trim());
    if (ok) {
      setMessage("Backup restored successfully!");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage("Failed to parse JSON backup. Please verify format.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
            SETTINGS & DATA MANAGEMENT
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure offline persistence, export/import tracker data, and customize training rules.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Backup & Export / Import */}
      <div className="p-5 rounded-xl bg-[#0c1222] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          DATA BACKUP & RESTORE
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            Generate Backup JSON
          </button>
        </div>

        {exportJson && (
          <div>
            <textarea
              readOnly
              value={exportJson}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 select-all"
            />
          </div>
        )}

        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <label className="block text-xs font-mono text-slate-400">
            Paste JSON Backup to Restore:
          </label>
          <textarea
            placeholder="Paste your exported JSON backup here..."
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 focus:border-cyan-400"
          />
          <button
            onClick={handleImport}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
          >
            Restore Backup
          </button>
        </div>
      </div>

      {/* Factory Reset */}
      <div className="p-5 rounded-xl bg-[#0c1222] border border-rose-900/40 space-y-3">
        <h3 className="text-sm font-bold font-mono text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          FACTORY RESET
        </h3>
        <p className="text-xs text-slate-400">
          Reset all progress back to the default Product Company Interview roadmap and initial seed data.
        </p>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all preparation data?")) {
              onReset();
              setMessage("Progress reset to default initial state.");
            }
          }}
          className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-mono font-bold transition"
        >
          Reset to Default Roadmap
        </button>
      </div>
    </div>
  );
};
