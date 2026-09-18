"""
Unit & Integration test suite for the Interview Quest Python backend.
Verifies database operations, streak computations, daily parallel logging, and productivity queries.
"""
import unittest
import os
import sys
import tempfile
import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import Database
from sample_data import seed_database
from business_logic import TrackerService

class TestTrackerBackend(unittest.TestCase):
    def setUp(self):
        self.temp_db_fd, self.temp_db_path = tempfile.mkstemp(suffix=".db")
        self.db = Database(self.temp_db_path)
        seed_database(self.db, force=True)
        self.service = TrackerService(self.db)

    def tearDown(self):
        os.close(self.temp_db_fd)
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    def test_seeded_data(self):
        categories = self.db.get_all_categories()
        skills = self.db.get_all_skills()
        self.assertEqual(len(categories), 6)
        self.assertGreaterEqual(len(skills), 15)

    def test_daily_parallel_tracking(self):
        test_date = datetime.date.today().strftime("%Y-%m-%d")
        entries = [
            {"skill_id": "java", "completed": 1, "time_spent_minutes": 60, "problems_solved": 2, "notes": "OOP in Java"},
            {"skill_id": "dsa_beginner", "completed": 1, "time_spent_minutes": 45, "problems_solved": 3, "notes": "Arrays & two pointers"},
            {"skill_id": "sql", "completed": 1, "time_spent_minutes": 30, "problems_solved": 1, "notes": "Window functions"}
        ]
        self.db.save_daily_entries(test_date, entries)
        logs = self.db.get_daily_logs_for_date(test_date)
        self.assertEqual(len(logs), 3)

        # Verify time spent and notes preserved
        java_log = next(l for l in logs if l["skill_id"] == "java")
        self.assertEqual(java_log["time_spent_minutes"], 60)
        self.assertEqual(java_log["problems_solved"], 2)
        self.assertEqual(java_log["notes"], "OOP in Java")

    def test_streak_calculation(self):
        streaks = self.db.calculate_streaks()
        self.assertGreaterEqual(streaks["current_streak"], 1)
        self.assertGreaterEqual(streaks["longest_streak"], 1)

    def test_productivity_aggregation(self):
        daily = self.db.get_productivity_data("daily")
        self.assertEqual(len(daily), 14)
        weekly = self.db.get_productivity_data("weekly")
        self.assertIsInstance(weekly, list)
        monthly = self.db.get_productivity_data("monthly")
        self.assertIsInstance(monthly, list)

    def test_skill_progress_update(self):
        self.db.update_skill_progress("java", completed_items=10, total_items=10)
        skill = self.db.get_skill_by_id("java")
        self.assertEqual(skill["completed_items"], 10)
        self.assertEqual(skill["status"], "completed")

    def test_dashboard_metrics(self):
        metrics = self.service.get_dashboard_metrics()
        self.assertIn("overall_progress_pct", metrics)
        self.assertIn("level", metrics)
        self.assertIn("level_title", metrics)
        self.assertIn("current_streak", metrics)
        self.assertIn("overall_productivity", metrics)

if __name__ == "__main__":
    unittest.main()
