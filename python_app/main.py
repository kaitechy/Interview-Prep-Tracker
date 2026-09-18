#!/usr/bin/env python3
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
        from PySide6.QtGui import QFont
        from ui.main_window import MainWindow
    except ImportError:
        print("[!] PySide6 is not installed. To run the desktop GUI:")
        print("    pip install -r requirements.txt")
        print("[*] Falling back to CLI mode...")
        run_cli()
        return

    # Check for display server on Linux
    if sys.platform.startswith("linux") and not (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY")):
        print("[!] No display server detected (HEADLESS environment).")
        print("[*] Running interactive CLI mode instead. You can also view the full web app preview!")
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

    print("\n" + "=" * 60)
    print(" ⬡ INTERVIEW QUEST: PRODUCT COMPANY TRACKER (CLI MODE) ⬡")
    print("=" * 60)

    while True:
        metrics = service.get_dashboard_metrics()
        print(f"\n[PLAYER STATS]")
        print(f" Level: {metrics['level']} ({metrics['level_title']}) | XP: {metrics['xp']} / {metrics['next_level_xp']}")
        print(f" Active Streak: 🔥 {metrics['current_streak']} Days | Longest: {metrics['longest_streak']} Days")
        print(f" Overall Preparation: {metrics['overall_progress_pct']}% | Productivity Score: {metrics['overall_productivity']}/100")
        print("-" * 60)
        print(" 1. View Complete Roadmap & Skill Progress")
        print(" 2. Daily Parallel Tracker (Tick Skills for Today)")
        print(" 3. View Productivity Stats (Daily / Weekly / Monthly)")
        print(" 4. Reset Database to Default Roadmap")
        print(" 5. Exit")
        choice = input("\nEnter choice (1-5): ").strip()

        if choice == "1":
            categories = service.get_structured_roadmap()
            print("\n=== COMPLETE PREPARATION ROADMAP ===")
            for cat in categories:
                print(f"\n▶ [{cat['name'].upper()}] - {cat['completed_items']}/{cat['total_items']} ({cat['progress_pct']}%)")
                for s in cat["skills"]:
                    status_icon = "✓" if s["status"] == "completed" else "▶" if s["status"] == "in_progress" else "🔒"
                    print(f"   {status_icon} {s['name']}: {s['completed_items']}/{s['total_items']} items [{s['status']}]")
                    for child in s.get("children", []):
                        c_icon = "✓" if child["status"] == "completed" else "▶"
                        print(f"      ↳ {c_icon} {child['name']}: {child['completed_items']}/{child['total_items']}")

        elif choice == "2":
            import datetime
            today_str = datetime.date.today().strftime("%Y-%m-%d")
            print(f"\n=== DAILY PARALLEL TRACKER (Date: {today_str}) ===")
            skills = db.get_all_skills()
            current_logs = {l["skill_id"]: l for l in db.get_daily_logs_for_date(today_str)}

            for i, s in enumerate(skills[:12], 1):
                is_done = "☑" if s["id"] in current_logs and current_logs[s["id"]]["completed"] else "☐"
                print(f" {i:2d}. {is_done} {s['name']}")

            print("\nEnter skill numbers to toggle today (e.g. '1, 2, 4') or 'done':")
            sel = input("> ").strip()
            if sel.lower() != "done" and sel:
                indices = [int(x.strip()) for x in sel.split(",") if x.strip().isdigit()]
                entries = []
                for idx in indices:
                    if 1 <= idx <= len(skills[:12]):
                        sk = skills[idx - 1]
                        entries.append({
                            "skill_id": sk["id"],
                            "completed": 1,
                            "time_spent_minutes": 60,
                            "problems_solved": 2,
                            "notes": "Studied today"
                        })
                if entries:
                    db.save_daily_entries(today_str, entries)
                    service.recalculate_user_xp_and_level()
                    print(f"[✓] Saved {len(entries)} skills to tracker.db SQLite database!")

        elif choice == "3":
            print("\n=== PRODUCTIVITY OVER TIME ===")
            daily = db.get_productivity_data("daily")
            print("Day         | Skills Done | Sessions | Time (min) | Problems Solved")
            print("-" * 65)
            for d in daily[-7:]:
                print(f"{d['date']}  |      {d['skills_completed']:2d}     |    {d['study_sessions']:2d}    |    {d['time_spent_minutes']:3d}     |      {d['problems_solved']:2d}")

        elif choice == "4":
            confirm = input("Are you sure you want to reset the database? (y/n): ")
            if confirm.lower() == "y":
                db.reset_database()
                seed_database(db, force=True)
                print("[✓] Database reset and seeded with initial product company roadmap!")

        elif choice == "5":
            print("Exiting Interview Quest. Keep up the grind!")
            break

def main():
    parser = argparse.ArgumentParser(description="Interview Quest Tracker")
    parser.add_argument("--cli", action="store_true", help="Force interactive CLI mode")
    args = parser.parse_args()

    if args.cli:
        run_cli()
    else:
        run_gui()

if __name__ == "__main__":
    main()
