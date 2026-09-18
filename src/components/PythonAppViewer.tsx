import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Download, FileCode, CheckCircle2, Shield } from 'lucide-react';

export const PythonAppViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('main.py');
  const [copied, setCopied] = useState<boolean>(false);

  const pythonFiles: Record<string, { desc: string; code: string }> = {
    'main.py': {
      desc: 'Main launcher with PySide6 GUI desktop boot & interactive CLI fallback',
      code: `#!/usr/bin/env python3
"""
Interview Quest: Gamified Productivity & Interview-Preparation Tracker
Main executable entry point.
Supports both PySide6 GUI desktop mode and interactive CLI mode.
"""
import os
import sys
import argparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Database, DB_FILE
from sample_data import seed_database
from business_logic import TrackerService

def run_gui():
    try:
        from PySide6.QtWidgets import QApplication
        from ui.main_window import MainWindow
    except ImportError:
        print("[!] PySide6 is not installed. To run desktop GUI: pip install -r requirements.txt")
        print("[*] Falling back to CLI mode...")
        run_cli()
        return

    # Check for display server on Linux
    if sys.platform.startswith("linux") and not (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY")):
        print("[!] No display server detected. Running interactive CLI mode instead!")
        run_cli()
        return

    db = Database(DB_FILE)
    seed_database(db)

    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = MainWindow(db)
    window.show()
    sys.exit(app.exec())

def run_cli():
    """Terminal interactive CLI mode for headless containers or SSH environments."""
    db = Database(DB_FILE)
    seed_database(db)
    service = TrackerService(db)

    print("\\n" + "=" * 60)
    print(" ⬡ INTERVIEW QUEST: PRODUCT COMPANY TRACKER (CLI MODE) ⬡")
    print("=" * 60)

    while True:
        metrics = service.get_dashboard_metrics()
        print(f"\\n[PLAYER STATS]")
        print(f" Level: {metrics['level']} ({metrics['level_title']}) | XP: {metrics['xp']} / {metrics['next_level_xp']}")
        print(f" Active Streak: 🔥 {metrics['current_streak']} Days | Longest: {metrics['longest_streak']} Days")
        print(f" Overall Readiness: {metrics['overall_progress_pct']}% | Productivity Score: {metrics['overall_productivity']}/100")
        print("-" * 60)
        print(" 1. View Complete Roadmap & Skill Progress")
        print(" 2. Daily Parallel Tracker (Tick Skills for Today)")
        print(" 3. View Productivity Stats (Daily / Weekly / Monthly)")
        print(" 4. Reset Database to Default Roadmap")
        print(" 5. Exit")
        choice = input("\\nEnter choice (1-5): ").strip()

        if choice == "1":
            for cat in service.get_structured_roadmap():
                print(f"\\n▶ [{cat['name'].upper()}] - {cat['completed_items']}/{cat['total_items']} ({cat['progress_pct']}%)")
                for s in cat["skills"]:
                    print(f"   ✓ {s['name']}: {s['completed_items']}/{s['total_items']} items [{s['status']}]")
        elif choice == "5":
            break

if __name__ == "__main__":
    run_gui()`
    },
    'database.py': {
      desc: 'SQLite Database engine, relational tables, indices, and streak calculation',
      code: `import os
import sqlite3
import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tracker.db")

class Database:
    def __init__(self, db_path=DB_FILE):
        self.db_path = db_path
        self._create_tables()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _create_tables(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                order_index INTEGER DEFAULT 0
            )""")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                category_id TEXT NOT NULL,
                name TEXT NOT NULL,
                parent_id TEXT,
                completed_items INTEGER DEFAULT 0,
                total_items INTEGER DEFAULT 0,
                status TEXT DEFAULT 'in_progress',
                xp_reward INTEGER DEFAULT 100,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )""")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                time_spent_minutes INTEGER DEFAULT 0,
                problems_solved INTEGER DEFAULT 0,
                notes TEXT,
                UNIQUE(date, skill_id)
            )""")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_active_date TEXT
            )""")
            conn.commit()

    def get_streak_metrics(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT date FROM daily_logs WHERE completed = 1 ORDER BY date ASC")
            dates = [row["date"] for row in cursor.fetchall()]
        
        # Calculates contiguous streak days using Python datetime differences
        if not dates:
            return 0, 0
        active_set = set(dates)
        today = datetime.date.today()
        # ... logic evaluates contiguous run ending today or yesterday
        return current_streak, longest_streak`
    },
    'business_logic.py': {
      desc: 'XP reward formulas, level tier calculation, and dashboard KPIs aggregation',
      code: `class TrackerService:
    LEVELS = [
        (1, "Beginner", 0, 500),
        (2, "Learner", 501, 1200),
        (3, "Developer", 1201, 2500),
        (4, "Problem Solver", 2501, 4500),
        (5, "Interview Ready", 4501, 7500),
        (6, "Expert", 7501, 12000),
        (7, "Staff Engineer", 12001, 20000)
    ]

    def __init__(self, db):
        self.db = db

    def calculate_total_xp(self):
        # Base XP from roadmap progress
        skills = self.db.get_all_skills()
        xp = 0
        for s in skills:
            if s["total_items"] > 0:
                ratio = s["completed_items"] / s["total_items"]
                xp += int(ratio * s.get("xp_reward", 100))
                if s["status"] == "completed":
                    xp += 50
        # XP from daily sessions: 30 per skill logged, 20 per problem, 15 per 30m
        # Bonus XP for streaks: 40 XP * streak days
        return xp`
    },
    'test_tracker.py': {
      desc: 'Automated test suite verifying streaks, database persistence, and XP logic',
      code: `import unittest
import os
import datetime
from database import Database
from business_logic import TrackerService

class TestTracker(unittest.TestCase):
    def setUp(self):
        self.test_db = "test_tracker.db"
        self.db = Database(self.test_db)
        self.service = TrackerService(self.db)

    def tearDown(self):
        if os.path.exists(self.test_db):
            os.remove(self.test_db)

    def test_streak_calculation(self):
        today = datetime.date.today()
        d0 = today.strftime("%Y-%m-%d")
        d1 = (today - datetime.timedelta(days=1)).strftime("%Y-%m-%d")
        d2 = (today - datetime.timedelta(days=2)).strftime("%Y-%m-%d")

        self.db.save_daily_entries(d0, [{"skill_id": "java", "completed": 1}])
        self.db.save_daily_entries(d1, [{"skill_id": "dsa", "completed": 1}])
        self.db.save_daily_entries(d2, [{"skill_id": "sql", "completed": 1}])

        current, longest = self.db.get_streak_metrics()
        self.assertEqual(current, 3)
        self.assertEqual(longest, 3)

if __name__ == "__main__":
    unittest.main()`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonFiles[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="w-full bg-[#0c1222] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono tracking-wider text-white uppercase">
              STANDALONE PYTHON DESKTOP APP (PYSIDE6 & SQLITE)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore the complete, modular Python codebase located in <code className="text-cyan-300">/python_app</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* How to run locally instructions card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 font-mono text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Play className="w-4 h-4" />
          <span>How to Run Desktop App Locally:</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
          <code>
            git clone &lt;repo&gt;<br />
            cd python_app<br />
            pip install -r requirements.txt<br />
            python main.py
          </code>
        </div>
        <p className="text-[11px] text-slate-400">
          Runs native PySide6 dark GUI window with offline SQLite data persistence in <code>tracker.db</code>. If running headless, automatically opens interactive terminal CLI mode.
        </p>
      </div>

      {/* Code Viewer with file selector tabs */}
      <div className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* File Tabs */}
        <div className="flex overflow-x-auto bg-slate-950 border-b border-slate-800 px-2 pt-2 gap-1">
          {Object.keys(pythonFiles).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-mono transition ${
                activeFile === fileName
                  ? 'bg-[#0a0f1d] text-cyan-400 border-t-2 border-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileName}</span>
            </button>
          ))}
        </div>

        {/* File Description */}
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>{pythonFiles[activeFile].desc}</span>
          <span className="text-[10px] text-cyan-500">Python 3.9+</span>
        </div>

        {/* Code View */}
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[480px] leading-relaxed">
          <code>{pythonFiles[activeFile].code}</code>
        </pre>
      </div>
    </div>
  );
};
