"""
SQLite Database Manager for Interview Quest Tracker.
Handles local persistent storage for categories, skills, daily logs, user profile, and productivity.
"""
import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tracker.db")

class Database:
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Categories
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT DEFAULT '',
                order_index INTEGER DEFAULT 0
            )
            """)

            # Skills
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                category_id TEXT NOT NULL,
                name TEXT NOT NULL,
                parent_id TEXT,
                completed_items INTEGER DEFAULT 0,
                total_items INTEGER DEFAULT 10,
                status TEXT DEFAULT 'in_progress',
                xp_reward INTEGER DEFAULT 100,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES skills(id) ON DELETE CASCADE
            )
            """)

            # Daily Activity Logs
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                log_date TEXT NOT NULL,
                skill_id TEXT NOT NULL,
                completed INTEGER DEFAULT 1,
                time_spent_minutes INTEGER DEFAULT 0,
                problems_solved INTEGER DEFAULT 0,
                notes TEXT DEFAULT '',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(log_date, skill_id),
                FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
            )
            """)

            # User Profile & Gamification
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                id INTEGER PRIMARY KEY,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                level_title TEXT DEFAULT 'Beginner',
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_active_date TEXT
            )
            """)

            # Key-Value Settings
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """)

            # Indices for rapid querying
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_skills_parent ON skills(parent_id)")

            # Initialize user profile if empty
            cursor.execute("SELECT COUNT(*) as cnt FROM user_profile")
            if cursor.fetchone()["cnt"] == 0:
                cursor.execute("""
                INSERT INTO user_profile (id, xp, level, level_title, current_streak, longest_streak, last_active_date)
                VALUES (1, 0, 1, 'Beginner', 0, 0, NULL)
                """)

            conn.commit()

    # --- CATEGORY & SKILL CRUD ---

    def insert_category(self, id: str, name: str, description: str = "", order_index: int = 0):
        with self.get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO categories (id, name, description, order_index)
            VALUES (?, ?, ?, ?)
            """, (id, name, description, order_index))
            conn.commit()

    def get_all_categories(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM categories ORDER BY order_index ASC")
            return [dict(row) for row in cursor.fetchall()]

    def insert_skill(self, id: str, category_id: str, name: str, parent_id: Optional[str] = None,
                     completed_items: int = 0, total_items: int = 10, status: str = "in_progress",
                     xp_reward: int = 100, order_index: int = 0):
        with self.get_connection() as conn:
            conn.execute("""
            INSERT OR REPLACE INTO skills (id, category_id, name, parent_id, completed_items, total_items, status, xp_reward, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (id, category_id, name, parent_id, completed_items, total_items, status, xp_reward, order_index))
            conn.commit()

    def update_skill_progress(self, skill_id: str, completed_items: int, total_items: Optional[int] = None, status: Optional[str] = None):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM skills WHERE id = ?", (skill_id,))
            current = cursor.fetchone()
            if not current:
                return

            new_total = total_items if total_items is not None else current["total_items"]
            new_completed = max(0, min(completed_items, new_total))

            if status is not None:
                new_status = status
            else:
                if new_completed >= new_total and new_total > 0:
                    new_status = "completed"
                elif new_completed > 0:
                    new_status = "in_progress"
                else:
                    new_status = current["status"]

            cursor.execute("""
            UPDATE skills
            SET completed_items = ?, total_items = ?, status = ?
            WHERE id = ?
            """, (new_completed, new_total, new_status, skill_id))
            conn.commit()

    def get_all_skills(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM skills ORDER BY order_index ASC")
            return [dict(row) for row in cursor.fetchall()]

    def get_skill_by_id(self, skill_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM skills WHERE id = ?", (skill_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    # --- DAILY TRACKER LOGS ---

    def save_daily_entries(self, log_date: str, entries: List[Dict[str, Any]]):
        """
        Saves or updates daily entries for multiple skills on a given date.
        entries: list of dicts: {'skill_id': str, 'completed': bool/int, 'time_spent_minutes': int, 'problems_solved': int, 'notes': str}
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            for entry in entries:
                completed_val = 1 if entry.get("completed", True) else 0
                cursor.execute("""
                INSERT INTO daily_logs (log_date, skill_id, completed, time_spent_minutes, problems_solved, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(log_date, skill_id) DO UPDATE SET
                    completed = excluded.completed,
                    time_spent_minutes = excluded.time_spent_minutes,
                    problems_solved = excluded.problems_solved,
                    notes = excluded.notes
                """, (
                    log_date,
                    entry["skill_id"],
                    completed_val,
                    entry.get("time_spent_minutes", 0),
                    entry.get("problems_solved", 0),
                    entry.get("notes", "")
                ))
            conn.commit()

    def get_daily_logs_for_date(self, log_date: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT dl.*, s.name as skill_name, s.category_id
            FROM daily_logs dl
            JOIN skills s ON dl.skill_id = s.id
            WHERE dl.log_date = ?
            ORDER BY s.order_index ASC
            """, (log_date,))
            return [dict(row) for row in cursor.fetchall()]

    def delete_daily_entry(self, log_date: str, skill_id: str):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM daily_logs WHERE log_date = ? AND skill_id = ?", (log_date, skill_id))
            conn.commit()

    # --- ACTIVITY HEATMAP & STREAK CALCULATIONS ---

    def get_active_dates(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT log_date, 
                   COUNT(DISTINCT skill_id) as skills_count,
                   SUM(time_spent_minutes) as total_time,
                   SUM(problems_solved) as total_problems
            FROM daily_logs
            WHERE completed = 1
            GROUP BY log_date
            ORDER BY log_date ASC
            """)
            return [dict(row) for row in cursor.fetchall()]

    def calculate_streaks(self) -> Dict[str, int]:
        """Calculates current streak and all-time longest streak from SQLite daily_logs."""
        dates_data = self.get_active_dates()
        if not dates_data:
            return {"current_streak": 0, "longest_streak": 0}

        active_dates = set(row["log_date"] for row in dates_data if row["skills_count"] > 0)
        if not active_dates:
            return {"current_streak": 0, "longest_streak": 0}

        sorted_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in active_dates])
        
        # Longest streak
        longest_streak = 0
        cur_run = 0
        prev_d = None

        for d in sorted_dates:
            if prev_d is None:
                cur_run = 1
            elif d == prev_d + timedelta(days=1):
                cur_run += 1
            else:
                cur_run = 1
            if cur_run > longest_streak:
                longest_streak = cur_run
            prev_d = d

        # Current streak: checks today or yesterday
        today = date.today()
        current_streak = 0
        check_date = today

        if check_date.strftime("%Y-%m-%d") not in active_dates:
            # Check if active yesterday
            check_date = today - timedelta(days=1)

        while check_date.strftime("%Y-%m-%d") in active_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Update user_profile
        with self.get_connection() as conn:
            conn.execute("""
            UPDATE user_profile
            SET current_streak = ?, longest_streak = ?
            WHERE id = 1
            """, (current_streak, longest_streak))
            conn.commit()

        return {"current_streak": current_streak, "longest_streak": longest_streak}

    # --- PRODUCTIVITY AGGREGATION ---

    def get_productivity_data(self, period: str = "daily") -> List[Dict[str, Any]]:
        """
        period: 'daily' (last 14 days), 'weekly' (last 8 weeks), 'monthly' (last 6 months)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if period == "daily":
                # Last 14 days up to today
                today = date.today()
                result = []
                for i in range(13, -1, -1):
                    day_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                    cursor.execute("""
                    SELECT COUNT(DISTINCT skill_id) as skills_completed,
                           COUNT(id) as sessions,
                           COALESCE(SUM(time_spent_minutes), 0) as time_spent,
                           COALESCE(SUM(problems_solved), 0) as problems_solved
                    FROM daily_logs
                    WHERE log_date = ? AND completed = 1
                    """, (day_str,))
                    row = cursor.fetchone()
                    label = (today - timedelta(days=i)).strftime("%b %d")
                    result.append({
                        "label": label,
                        "date": day_str,
                        "skills_completed": row["skills_completed"],
                        "study_sessions": row["sessions"],
                        "time_spent_minutes": row["time_spent"],
                        "problems_solved": row["problems_solved"]
                    })
                return result

            elif period == "weekly":
                # Last 8 weeks
                cursor.execute("""
                SELECT strftime('%Y-W%W', log_date) as week_label,
                       MIN(log_date) as start_date,
                       COUNT(DISTINCT skill_id) as skills_completed,
                       COUNT(id) as sessions,
                       COALESCE(SUM(time_spent_minutes), 0) as time_spent,
                       COALESCE(SUM(problems_solved), 0) as problems_solved
                FROM daily_logs
                WHERE completed = 1
                GROUP BY week_label
                ORDER BY week_label DESC
                LIMIT 8
                """)
                rows = cursor.fetchall()
                result = []
                for r in reversed(rows):
                    result.append({
                        "label": f"Wk {r['week_label'][-2:]}",
                        "date": r["start_date"],
                        "skills_completed": r["skills_completed"],
                        "study_sessions": r["sessions"],
                        "time_spent_minutes": r["time_spent"],
                        "problems_solved": r["problems_solved"]
                    })
                return result

            elif period == "monthly":
                # Last 6 months
                cursor.execute("""
                SELECT strftime('%Y-%m', log_date) as month_label,
                       COUNT(DISTINCT skill_id) as skills_completed,
                       COUNT(id) as sessions,
                       COALESCE(SUM(time_spent_minutes), 0) as time_spent,
                       COALESCE(SUM(problems_solved), 0) as problems_solved
                FROM daily_logs
                WHERE completed = 1
                GROUP BY month_label
                ORDER BY month_label DESC
                LIMIT 6
                """)
                rows = cursor.fetchall()
                result = []
                for r in reversed(rows):
                    # Format as Month Name
                    dt = datetime.strptime(r["month_label"] + "-01", "%Y-%m-%d")
                    result.append({
                        "label": dt.strftime("%b %Y"),
                        "date": r["month_label"],
                        "skills_completed": r["skills_completed"],
                        "study_sessions": r["sessions"],
                        "time_spent_minutes": r["time_spent"],
                        "problems_solved": r["problems_solved"]
                    })
                return result

        return []

    # --- USER PROFILE & GAMIFICATION ---

    def get_user_profile(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_profile WHERE id = 1")
            row = cursor.fetchone()
            return dict(row) if row else {}

    def update_user_profile(self, xp: int, level: int, level_title: str):
        with self.get_connection() as conn:
            conn.execute("""
            UPDATE user_profile
            SET xp = ?, level = ?, level_title = ?
            WHERE id = 1
            """, (xp, level, level_title))
            conn.commit()

    def reset_database(self):
        """Drops all tables and re-initializes fresh database."""
        with self.get_connection() as conn:
            conn.execute("DROP TABLE IF EXISTS daily_logs")
            conn.execute("DROP TABLE IF EXISTS skills")
            conn.execute("DROP TABLE IF EXISTS categories")
            conn.execute("DROP TABLE IF EXISTS user_profile")
            conn.execute("DROP TABLE IF EXISTS settings")
            conn.commit()
        self.init_db()
