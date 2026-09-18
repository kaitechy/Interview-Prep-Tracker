"""
Data models for the Interview Quest Gamified Tracker.
"""
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime

@dataclass
class Skill:
    id: str
    category_id: str
    name: str
    parent_id: Optional[str] = None
    completed_items: int = 0
    total_items: int = 10
    status: str = "in_progress"  # 'locked', 'in_progress', 'completed'
    xp_reward: int = 100
    order_index: int = 0
    subtopics: List['Skill'] = field(default_factory=list)

    @property
    def progress_percentage(self) -> float:
        if self.total_items <= 0:
            return 100.0 if self.status == "completed" else 0.0
        pct = (self.completed_items / self.total_items) * 100.0
        return min(100.0, max(0.0, pct))

@dataclass
class Category:
    id: str
    name: str
    description: str = ""
    order_index: int = 0
    skills: List[Skill] = field(default_factory=list)

    @property
    def progress_percentage(self) -> float:
        if not self.skills:
            return 0.0
        total_items = sum(s.total_items for s in self.skills)
        if total_items <= 0:
            return 0.0
        completed = sum(s.completed_items for s in self.skills)
        return min(100.0, (completed / total_items) * 100.0)

@dataclass
class DailySkillEntry:
    skill_id: str
    skill_name: str
    completed: bool = True
    time_spent_minutes: int = 0
    problems_solved: int = 0
    notes: str = ""

@dataclass
class DailyLog:
    date: str  # YYYY-MM-DD
    entries: List[DailySkillEntry] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())

    @property
    def total_time_minutes(self) -> int:
        return sum(e.time_spent_minutes for e in self.entries if e.completed)

    @property
    def total_problems_solved(self) -> int:
        return sum(e.problems_solved for e in self.entries if e.completed)

    @property
    def skills_completed_count(self) -> int:
        return sum(1 for e in self.entries if e.completed)

@dataclass
class UserProfile:
    id: int = 1
    xp: int = 0
    level: int = 1
    level_title: str = "Beginner"
    current_streak: int = 0
    longest_streak: int = 0
    last_active_date: Optional[str] = None

@dataclass
class ProductivityPoint:
    label: str
    skills_completed: int
    study_sessions: int
    time_spent_minutes: int
    problems_solved: int
