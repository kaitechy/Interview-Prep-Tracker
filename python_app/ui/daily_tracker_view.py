"""
Daily Parallel Skill Checkbox Tracker View for Interview Quest.
Allows selecting any calendar date, parallel ticking of all 12 skills with time, problems, and notes,
and auto-saves immediately to SQLite.
"""
from typing import Dict, Any, List
import os
import sys
from datetime import date, datetime, timedelta

try:
    from PySide6.QtWidgets import (
        QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
        QScrollArea, QFrame, QCheckBox, QSpinBox, QLineEdit,
        QDateEdit, QGridLayout
    )
    from PySide6.QtCore import Qt, Signal, QDate
except ImportError:
    class QWidget: pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import Database
from business_logic import TrackerService

# The 12 core parallel skills defined in the user prompt
TRACKER_SKILLS = [
    ("java", "Java Language Mastery", "#38bdf8"),
    ("dsa", "DSA (Data Structures & Algorithms)", "#00f0ff"),
    ("algorithms", "Algorithms", "#818cf8"),
    ("data_structures", "Data Structures", "#a855f7"),
    ("oop", "OOP / OOPS", "#c084fc"),
    ("sql", "SQL", "#2dd4bf"),
    ("dbms", "DBMS", "#00ff9d"),
    ("computer_networks", "Computer Networks", "#4ade80"),
    ("interview_questions", "500 Interview Questions", "#f59e0b"),
    ("speaking", "Speaking", "#fb7185"),
    ("grammar", "Grammar", "#f43f5e"),
    ("soft_skills", "Soft Skills", "#e879f9"),
]

class SkillEntryWidget(QFrame):
    entry_changed = Signal()

    def __init__(self, skill_id: str, skill_name: str, accent_color: str, parent=None):
        super().__init__(parent)
        self.skill_id = skill_id
        self.skill_name = skill_name
        self.accent_color = accent_color
        self.init_ui()

    def init_ui(self):
        self.setProperty("class", "card")
        self.setStyleSheet(f"""
            QFrame {{
                background-color: #0f172a;
                border: 1px solid #1e293b;
                border-radius: 10px;
                padding: 4px;
            }}
            QFrame:hover {{
                border-color: {self.accent_color}66;
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 10, 12, 10)
        layout.setSpacing(8)

        # Top row: Checkbox and title
        top_row = QHBoxLayout()
        self.check_box = QCheckBox(f"☐ {self.skill_name}")
        self.check_box.setStyleSheet(f"""
            QCheckBox {{
                font-size: 14px;
                font-weight: 600;
                color: #f1f5f9;
            }}
            QCheckBox:hover {{
                color: {self.accent_color};
            }}
            QCheckBox::indicator:checked {{
                background-color: {self.accent_color};
                border-color: {self.accent_color};
            }}
        """)
        self.check_box.stateChanged.connect(self.on_toggle)
        top_row.addWidget(self.check_box)

        top_row.addStretch()

        self.status_label = QLabel("Inactive")
        self.status_label.setStyleSheet("color: #64748b; font-size: 11px;")
        top_row.addWidget(self.status_label)

        layout.addLayout(top_row)

        # Expandable inputs frame (time, problems, notes)
        self.details_frame = QFrame()
        self.details_frame.setVisible(False)
        d_layout = QGridLayout(self.details_frame)
        d_layout.setContentsMargins(0, 4, 0, 0)
        d_layout.setSpacing(8)

        # Time spent
        lbl_time = QLabel("Time Spent (min):")
        lbl_time.setStyleSheet("color: #94a3b8; font-size: 11px;")
        self.spin_time = QSpinBox()
        self.spin_time.setRange(0, 1440)
        self.spin_time.setSingleStep(15)
        self.spin_time.setValue(45)
        self.spin_time.valueChanged.connect(lambda: self.entry_changed.emit())

        # Problems solved
        lbl_probs = QLabel("Problems Solved:")
        lbl_probs.setStyleSheet("color: #94a3b8; font-size: 11px;")
        self.spin_problems = QSpinBox()
        self.spin_problems.setRange(0, 200)
        self.spin_problems.setValue(0)
        self.spin_problems.valueChanged.connect(lambda: self.entry_changed.emit())

        # Short notes
        lbl_notes = QLabel("Short Notes:")
        lbl_notes.setStyleSheet("color: #94a3b8; font-size: 11px;")
        self.txt_notes = QLineEdit()
        self.txt_notes.setPlaceholderText("e.g. Solved two-sum with HashMap, revised deadlock conditions...")
        self.txt_notes.textChanged.connect(lambda: self.entry_changed.emit())

        d_layout.addWidget(lbl_time, 0, 0)
        d_layout.addWidget(self.spin_time, 0, 1)
        d_layout.addWidget(lbl_probs, 0, 2)
        d_layout.addWidget(self.spin_problems, 0, 3)
        d_layout.addWidget(lbl_notes, 1, 0)
        d_layout.addWidget(self.txt_notes, 1, 1, 1, 3)

        layout.addWidget(self.details_frame)

    def on_toggle(self, state):
        is_checked = (state == 2 or state == Qt.CheckState.Checked)
        self.details_frame.setVisible(is_checked)
        if is_checked:
            self.check_box.setText(f"☑ {self.skill_name}")
            self.status_label.setText("ACTIVE TODAY")
            self.status_label.setStyleSheet(f"color: {self.accent_color}; font-weight: 700; font-size: 11px;")
            self.setStyleSheet(f"""
                QFrame {{
                    background-color: #111c30;
                    border: 1px solid {self.accent_color};
                    border-radius: 10px;
                }}
            """)
        else:
            self.check_box.setText(f"☐ {self.skill_name}")
            self.status_label.setText("Inactive")
            self.status_label.setStyleSheet("color: #64748b; font-size: 11px;")
            self.setStyleSheet("""
                QFrame {{
                    background-color: #0f172a;
                    border: 1px solid #1e293b;
                    border-radius: 10px;
                }}
            """)
        self.entry_changed.emit()

    def get_data(self) -> Dict[str, Any]:
        return {
            "skill_id": self.skill_id,
            "completed": self.check_box.isChecked(),
            "time_spent_minutes": self.spin_time.value(),
            "problems_solved": self.spin_problems.value(),
            "notes": self.txt_notes.text().strip()
        }

    def set_data(self, completed: bool, time_spent: int, problems: int, notes: str):
        self.check_box.blockSignals(True)
        self.check_box.setChecked(completed)
        self.check_box.setText(f"☑ {self.skill_name}" if completed else f"☐ {self.skill_name}")
        self.details_frame.setVisible(completed)
        self.spin_time.setValue(time_spent)
        self.spin_problems.setValue(problems)
        self.txt_notes.setText(notes)
        if completed:
            self.status_label.setText("ACTIVE TODAY")
            self.status_label.setStyleSheet(f"color: {self.accent_color}; font-weight: 700; font-size: 11px;")
            self.setStyleSheet(f"""
                QFrame {{
                    background-color: #111c30;
                    border: 1px solid {self.accent_color};
                    border-radius: 10px;
                }}
            """)
        else:
            self.status_label.setText("Inactive")
            self.status_label.setStyleSheet("color: #64748b; font-size: 11px;")
            self.setStyleSheet("""
                QFrame {{
                    background-color: #0f172a;
                    border: 1px solid #1e293b;
                    border-radius: 10px;
                }}
            """)
        self.check_box.blockSignals(False)


class DailyTrackerView(QWidget):
    activity_saved = Signal()

    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.service = TrackerService(db)
        self.skill_widgets: List[SkillEntryWidget] = []
        self.current_date = date.today()
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(14)

        # Date Selector & Quick Toggles
        date_bar = QFrame()
        date_bar.setProperty("class", "card")
        d_layout = QHBoxLayout(date_bar)
        d_layout.setContentsMargins(14, 10, 14, 10)
        d_layout.setSpacing(12)

        title = QLabel("PARALLEL DAILY SKILL TRACKER")
        title.setStyleSheet("font-size: 16px; font-weight: 800; color: #00f0ff; letter-spacing: 0.5px;")
        d_layout.addWidget(title)

        d_layout.addStretch()

        prev_btn = QPushButton("◀ Prev Day")
        prev_btn.setProperty("class", "secondary-btn")
        prev_btn.clicked.connect(self.go_prev_day)
        d_layout.addWidget(prev_btn)

        self.date_picker = QDateEdit()
        self.date_picker.setDisplayFormat("yyyy-MM-dd")
        self.date_picker.setCalendarPopup(True)
        today = date.today()
        self.date_picker.setDate(QDate(today.year, today.month, today.day))
        self.date_picker.dateChanged.connect(self.on_date_changed)
        d_layout.addWidget(self.date_picker)

        next_btn = QPushButton("Next Day ▶")
        next_btn.setProperty("class", "secondary-btn")
        next_btn.clicked.connect(self.go_next_day)
        d_layout.addWidget(next_btn)

        today_btn = QPushButton("Today")
        today_btn.setProperty("class", "primary-btn")
        today_btn.clicked.connect(self.go_today)
        d_layout.addWidget(today_btn)

        self.save_status = QLabel("⚡ Auto-saved to SQLite")
        self.save_status.setStyleSheet("color: #00ff9d; font-size: 11px; font-weight: 600;")
        d_layout.addWidget(self.save_status)

        main_layout.addWidget(date_bar)

        # Instruction info banner
        banner = QLabel("💡 Multiple skills can be ticked simultaneously for the same day. All progress, study minutes, and solved problems are automatically written to tracker.db.")
        banner.setStyleSheet("color: #94a3b8; font-size: 12px; padding: 0 4px;")
        main_layout.addWidget(banner)

        # Scrollable grid of the 12 parallel skills
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")

        grid_container = QWidget()
        grid_layout = QVBoxLayout(grid_container)
        grid_layout.setSpacing(10)

        for skill_id, skill_name, color in TRACKER_SKILLS:
            w = SkillEntryWidget(skill_id, skill_name, color)
            w.entry_changed.connect(self.auto_save)
            self.skill_widgets.append(w)
            grid_layout.addWidget(w)

        scroll.setWidget(grid_container)
        main_layout.addWidget(scroll)

        self.load_date_logs(self.current_date.strftime("%Y-%m-%d"))

    def go_prev_day(self):
        self.current_date -= timedelta(days=1)
        self.date_picker.setDate(QDate(self.current_date.year, self.current_date.month, self.current_date.day))

    def go_next_day(self):
        self.current_date += timedelta(days=1)
        self.date_picker.setDate(QDate(self.current_date.year, self.current_date.month, self.current_date.day))

    def go_today(self):
        self.current_date = date.today()
        self.date_picker.setDate(QDate(self.current_date.year, self.current_date.month, self.current_date.day))

    def on_date_changed(self, qdate: QDate):
        self.current_date = date(qdate.year(), qdate.month(), qdate.day())
        self.load_date_logs(self.current_date.strftime("%Y-%m-%d"))

    def load_date_logs(self, date_str: str):
        logs = self.db.get_daily_logs_for_date(date_str)
        log_map = {l["skill_id"]: l for l in logs}

        for w in self.skill_widgets:
            if w.skill_id in log_map:
                l = log_map[w.skill_id]
                w.set_data(
                    completed=bool(l["completed"]),
                    time_spent=l["time_spent_minutes"],
                    problems=l["problems_solved"],
                    notes=l.get("notes", "")
                )
            else:
                w.set_data(completed=False, time_spent=45, problems=0, notes="")

        self.save_status.setText(f"Loaded: {date_str}")
        self.save_status.setStyleSheet("color: #38bdf8; font-size: 11px;")

    def auto_save(self):
        """Immediately writes active daily skills to SQLite."""
        date_str = self.current_date.strftime("%Y-%m-%d")
        entries = []
        for w in self.skill_widgets:
            d = w.get_data()
            if d["completed"]:
                entries.append(d)
            else:
                self.db.delete_daily_entry(date_str, w.skill_id)

        if entries:
            self.db.save_daily_entries(date_str, entries)

        # Recalculate streaks and XP
        self.service.recalculate_user_xp_and_level()
        self.save_status.setText("⚡ Auto-saved to SQLite")
        self.save_status.setStyleSheet("color: #00ff9d; font-size: 11px; font-weight: 600;")
        self.activity_saved.emit()
