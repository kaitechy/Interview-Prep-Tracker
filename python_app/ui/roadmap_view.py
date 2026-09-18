"""
Roadmap & Skill Tree Interactive View for Interview Quest.
Presents the entire curriculum from Java Mastery -> DSA -> Algorithms -> Core CS -> 500 Qs -> Communication.
"""
from typing import Optional
import os
import sys

try:
    from PySide6.QtWidgets import (
        QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
        QScrollArea, QFrame, QProgressBar, QDialog, QSpinBox,
        QComboBox, QTextEdit, QMessageBox
    )
    from PySide6.QtCore import Qt, Signal
    from PySide6.QtGui import QFont, QColor
except ImportError:
    # Graceful fallback if PySide6 not installed in current environment
    class QWidget: pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import Database
from business_logic import TrackerService

class UpdateProgressDialog(QDialog):
    """Dialog allowing user to update completed items, total items, and status."""
    def __init__(self, skill: dict, parent=None):
        super().__init__(parent)
        self.skill = skill
        self.setWindowTitle(f"Update Skill: {skill['name']}")
        self.setMinimumWidth(380)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(14)

        title = QLabel(f"⬡ {self.skill['name']}")
        title.setStyleSheet("font-size: 16px; font-weight: 700; color: #00f0ff;")
        layout.addWidget(title)

        # Completed items
        h1 = QHBoxLayout()
        h1.addWidget(QLabel("Completed Topics/Problems:"))
        self.spin_completed = QSpinBox()
        self.spin_completed.setRange(0, 5000)
        self.spin_completed.setValue(self.skill.get("completed_items", 0))
        h1.addWidget(self.spin_completed)
        layout.addLayout(h1)

        # Total items
        h2 = QHBoxLayout()
        h2.addWidget(QLabel("Total Required:"))
        self.spin_total = QSpinBox()
        self.spin_total.setRange(1, 5000)
        self.spin_total.setValue(self.skill.get("total_items", 10))
        h2.addWidget(self.spin_total)
        layout.addLayout(h2)

        # Status
        h3 = QHBoxLayout()
        h3.addWidget(QLabel("Current Status:"))
        self.combo_status = QComboBox()
        self.combo_status.addItems(["in_progress", "completed", "locked"])
        self.combo_status.setCurrentText(self.skill.get("status", "in_progress"))
        h3.addWidget(self.combo_status)
        layout.addLayout(h3)

        # Buttons
        btn_layout = QHBoxLayout()
        cancel_btn = QPushButton("Cancel")
        cancel_btn.setProperty("class", "secondary-btn")
        cancel_btn.clicked.connect(self.reject)

        save_btn = QPushButton("Save Progress")
        save_btn.setProperty("class", "primary-btn")
        save_btn.clicked.connect(self.accept)

        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addLayout(btn_layout)


class RoadmapView(QWidget):
    progress_updated = Signal()

    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.service = TrackerService(db)
        self.init_ui()

    def init_ui(self):
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(16)

        # Header Title
        header_row = QHBoxLayout()
        title_box = QVBoxLayout()
        title = QLabel("SYSTEM ROADMAP & SKILL TREE")
        title.setStyleSheet("font-size: 20px; font-weight: 800; color: #f8fafc; letter-spacing: 1px;")
        subtitle = QLabel("Click any node to update mastery, toggle locks, or inspect curriculum progression.")
        subtitle.setStyleSheet("color: #94a3b8; font-size: 12px;")
        title_box.addWidget(title)
        title_box.addWidget(subtitle)
        header_row.addLayout(title_box)

        header_row.addStretch()

        add_btn = QPushButton("+ Add Custom Subtopic")
        add_btn.setProperty("class", "secondary-btn")
        add_btn.clicked.connect(self.on_add_custom_subtopic)
        header_row.addWidget(add_btn)

        main_layout.addLayout(header_row)

        # Scrollable area for categories and tree nodes
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")

        self.container = QWidget()
        self.cards_layout = QVBoxLayout(self.container)
        self.cards_layout.setSpacing(16)
        scroll.setWidget(self.container)

        main_layout.addWidget(scroll)
        self.refresh_roadmap()

    def refresh_roadmap(self):
        # Clear existing
        while self.cards_layout.count():
            item = self.cards_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        categories = self.service.get_structured_roadmap()

        for cat in categories:
            cat_frame = QFrame()
            cat_frame.setProperty("class", "card")
            cat_layout = QVBoxLayout(cat_frame)
            cat_layout.setContentsMargins(18, 16, 18, 16)
            cat_layout.setSpacing(12)

            # Category Header
            cat_header = QHBoxLayout()
            name_label = QLabel(cat["name"])
            name_label.setStyleSheet("font-size: 16px; font-weight: 700; color: #00f0ff;")
            cat_header.addWidget(name_label)

            cat_header.addStretch()

            stats_label = QLabel(f"{cat['completed_items']} / {cat['total_items']} items ({cat['progress_pct']}%)")
            stats_label.setStyleSheet("color: #38bdf8; font-weight: 600; font-size: 12px;")
            cat_header.addWidget(stats_label)
            cat_layout.addLayout(cat_header)

            # Category Progress Bar
            pbar = QProgressBar()
            pbar.setValue(int(cat["progress_pct"]))
            pbar.setFixedHeight(8)
            cat_layout.addWidget(pbar)

            # Skills under Category
            for skill in cat["skills"]:
                self._render_skill_card(cat_layout, skill, depth=0)

            self.cards_layout.addWidget(cat_frame)

        self.cards_layout.addStretch()

    def _render_skill_card(self, parent_layout: QVBoxLayout, skill: dict, depth: int = 0):
        skill_frame = QFrame()
        bg_col = "#111827" if depth == 0 else "#0d1524"
        indent = depth * 24
        skill_frame.setStyleSheet(f"""
            QFrame {{
                background-color: {bg_col};
                border: 1px solid #1e293b;
                border-radius: 8px;
                margin-left: {indent}px;
            }}
            QFrame:hover {{
                border-color: #00f0ff;
            }}
        """)

        s_layout = QHBoxLayout(skill_frame)
        s_layout.setContentsMargins(14, 10, 14, 10)

        # Status Icon & Name
        status_icons = {
            "completed": ("✓", "#00ff9d"),
            "in_progress": ("▶", "#00f0ff"),
            "locked": ("🔒", "#64748b")
        }
        icon, color = status_icons.get(skill["status"], ("•", "#94a3b8"))

        icon_label = QLabel(icon)
        icon_label.setStyleSheet(f"font-size: 14px; font-weight: 800; color: {color};")
        s_layout.addWidget(icon_label)

        name_label = QLabel(skill["name"])
        name_label.setStyleSheet("font-size: 13px; font-weight: 600; color: #f1f5f9;")
        s_layout.addWidget(name_label)

        s_layout.addStretch()

        # Item Progress & Bar
        tot = skill["total_items"]
        comp = skill["completed_items"]
        pct = (comp / tot * 100.0) if tot > 0 else 0.0

        p_info = QLabel(f"{comp}/{tot} ({int(pct)}%)")
        p_info.setStyleSheet("color: #94a3b8; font-size: 11px;")
        s_layout.addWidget(p_info)

        spbar = QProgressBar()
        spbar.setValue(int(pct))
        spbar.setFixedWidth(100)
        spbar.setFixedHeight(6)
        s_layout.addWidget(spbar)

        # Status Badge
        badge = QLabel(skill["status"].replace("_", " ").upper())
        badge.setStyleSheet(f"""
            background-color: rgba(30, 41, 59, 0.7);
            color: {color};
            border: 1px solid {color}44;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 700;
        """)
        s_layout.addWidget(badge)

        # Update button
        update_btn = QPushButton("Update")
        update_btn.setProperty("class", "secondary-btn")
        update_btn.setStyleSheet("padding: 4px 10px; font-size: 11px;")
        update_btn.clicked.connect(lambda _, s=skill: self.on_update_skill(s))
        s_layout.addWidget(update_btn)

        parent_layout.addWidget(skill_frame)

        # Render children / subtopics recursively
        for child in skill.get("children", []):
            self._render_skill_card(parent_layout, child, depth + 1)

    def on_update_skill(self, skill: dict):
        dlg = UpdateProgressDialog(skill, self)
        if dlg.exec():
            new_comp = dlg.spin_completed.value()
            new_tot = dlg.spin_total.value()
            new_status = dlg.combo_status.currentText()
            self.db.update_skill_progress(skill["id"], new_comp, new_tot, new_status)
            self.service.recalculate_user_xp_and_level()
            self.refresh_roadmap()
            self.progress_updated.emit()

    def on_add_custom_subtopic(self):
        dlg = QDialog(self)
        dlg.setWindowTitle("Add Subtopic to Roadmap")
        dlg.setMinimumWidth(360)
        layout = QVBoxLayout(dlg)

        layout.addWidget(QLabel("Parent Skill / Category:"))
        combo = QComboBox()
        skills = self.db.get_all_skills()
        for s in skills:
            combo.addItem(s["name"], s["id"])
        layout.addWidget(combo)

        layout.addWidget(QLabel("New Subtopic Name (e.g. 'Dynamic Programming', 'Trie'):"))
        name_input = QTextEdit()
        name_input.setFixedHeight(36)
        layout.addWidget(name_input)

        btn_row = QHBoxLayout()
        add_btn = QPushButton("Add to Roadmap")
        add_btn.setProperty("class", "primary-btn")
        btn_row.addWidget(add_btn)
        layout.addLayout(btn_row)

        def save():
            text = name_input.toPlainText().strip()
            if not text:
                return
            parent_id = combo.currentData()
            parent_skill = self.db.get_skill_by_id(parent_id)
            cat_id = parent_skill["category_id"] if parent_skill else "dsa"
            import uuid
            new_id = "sub_" + str(uuid.uuid4())[:8]
            self.db.insert_skill(
                id=new_id,
                category_id=cat_id,
                name=text,
                parent_id=parent_id,
                completed_items=0,
                total_items=10,
                status="in_progress",
                xp_reward=100
            )
            dlg.accept()
            self.refresh_roadmap()
            self.progress_updated.emit()

        add_btn.clicked.connect(save)
        dlg.exec()
