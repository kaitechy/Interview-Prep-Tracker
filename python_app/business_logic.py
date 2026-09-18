"""
Business Logic Engine for Interview Quest.
Handles XP calculation, Level Progression, Streaks, and Analytics Aggregation.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from typing import Dict, Any, List, Tuple
from database import Database

# Level Configuration - Easy to modify or extend
LEVELS = [
    (1, "Beginner", 0, 500),
    (2, "Learner", 501, 1200),
    (3, "Developer", 1201, 2500),
    (4, "Problem Solver", 2501, 4500),
    (5, "Interview Ready", 4501, 7500),
    (6, "Expert", 7501, 12000),
    (7, "Staff Engineer", 12001, 20000),
    (8, "System Architect", 20001, 999999)
]

class TrackerService:
    def __init__(self, db: Database):
        self.db = db

    def recalculate_user_xp_and_level(self) -> Dict[str, Any]:
        """Calculates total XP from completed skills, problem solving, study time, and streaks."""
        skills = self.db.get_all_skills()
        active_dates = self.db.get_active_dates()
        streaks = self.db.calculate_streaks()

        xp = 0

        # XP from skill item progress
        for s in skills:
            if s["total_items"] > 0:
                pct = s["completed_items"] / s["total_items"]
                xp += int(pct * s.get("xp_reward", 100))
                if s["status"] == "completed":
                    xp += 50  # Completion mastery bonus

        # XP from daily activities
        for act in active_dates:
            xp += (act["skills_count"] or 0) * 30  # 30 XP per skill studied
            xp += (act["total_problems"] or 0) * 20  # 20 XP per problem solved
            xp += int(((act["total_time"] or 0) / 30) * 15)  # 15 XP per 30 minutes

        # Streak bonus
        xp += streaks["current_streak"] * 40

        # Determine level
        level = 1
        level_title = "Beginner"
        min_xp = 0
        max_xp = 500

        for lvl, title, low, high in LEVELS:
            if xp >= low:
                level = lvl
                level_title = title
                min_xp = low
                max_xp = high

        self.db.update_user_profile(xp, level, level_title)

        return {
            "xp": xp,
            "level": level,
            "level_title": level_title,
            "min_xp": min_xp,
            "max_xp": max_xp,
            "progress_to_next_level": min(100.0, max(0.0, ((xp - min_xp) / max(1, (max_xp - min_xp))) * 100.0)),
            "current_streak": streaks["current_streak"],
            "longest_streak": streaks["longest_streak"]
        }

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Gathers all 8 core dashboard indicators requested."""
        categories = self.db.get_all_categories()
        skills = self.db.get_all_skills()
        streaks = self.db.calculate_streaks()
        profile = self.recalculate_user_xp_and_level()

        total_items = sum(s["total_items"] for s in skills if s["parent_id"] != "dsa" or s["id"] != "dsa")
        completed_items = sum(s["completed_items"] for s in skills if s["parent_id"] != "dsa" or s["id"] != "dsa")
        overall_progress_pct = (completed_items / total_items * 100.0) if total_items > 0 else 0.0

        total_completed_skills = sum(1 for s in skills if s["status"] == "completed" or (s["total_items"] > 0 and s["completed_items"] >= s["total_items"]))

        active_dates = self.db.get_active_dates()
        total_sessions = sum(1 for _ in active_dates)
        total_time_minutes = sum(d["total_time"] or 0 for d in active_dates)
        total_problems = sum(d["total_problems"] or 0 for d in active_dates)

        # Today's activity
        import datetime
        today_str = datetime.date.today().strftime("%Y-%m-%d")
        today_logs = self.db.get_daily_logs_for_date(today_str)
        today_completed_count = sum(1 for l in today_logs if l["completed"])
        today_time = sum(l["time_spent_minutes"] for l in today_logs if l["completed"])
        today_problems = sum(l["problems_solved"] for l in today_logs if l["completed"])

        # Overall productivity score (composite index 0-100)
        productivity_score = min(100, int((overall_progress_pct * 0.4) + (streaks["current_streak"] * 5) + (total_sessions * 2)))

        return {
            "overall_progress_pct": round(overall_progress_pct, 1),
            "level": profile["level"],
            "level_title": profile["level_title"],
            "xp": profile["xp"],
            "next_level_xp": profile["max_xp"],
            "level_progress_pct": round(profile["progress_to_next_level"], 1),
            "total_skills_completed": total_completed_skills,
            "total_skills_count": len(skills),
            "total_study_sessions": total_sessions,
            "total_study_hours": round(total_time_minutes / 60.0, 1),
            "total_problems_solved": total_problems,
            "current_streak": streaks["current_streak"],
            "longest_streak": streaks["longest_streak"],
            "today_skills_count": today_completed_count,
            "today_time_minutes": today_time,
            "today_problems_solved": today_problems,
            "overall_productivity": productivity_score
        }

    def get_structured_roadmap(self) -> List[Dict[str, Any]]:
        """Returns categories with structured hierarchical skills."""
        categories = self.db.get_all_categories()
        all_skills = self.db.get_all_skills()

        cat_map = {c["id"]: {**c, "skills": []} for c in categories}
        skill_map = {s["id"]: {**s, "children": []} for s in all_skills}

        # Build hierarchy
        for s in all_skills:
            if s["parent_id"] and s["parent_id"] in skill_map:
                skill_map[s["parent_id"]]["children"].append(skill_map[s["id"]])
            else:
                cat_id = s["category_id"]
                if cat_id in cat_map:
                    cat_map[cat_id]["skills"].append(skill_map[s["id"]])

        # Calculate category progress
        result = []
        for cat in categories:
            cat_obj = cat_map[cat["id"]]
            flat_skills = [s for s in all_skills if s["category_id"] == cat["id"]]
            tot = sum(s["total_items"] for s in flat_skills)
            comp = sum(s["completed_items"] for s in flat_skills)
            cat_obj["total_items"] = tot
            cat_obj["completed_items"] = comp
            cat_obj["progress_pct"] = round((comp / tot * 100.0) if tot > 0 else 0.0, 1)
            result.append(cat_obj)

        return result
