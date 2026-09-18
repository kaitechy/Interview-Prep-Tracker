"""
Main Window for Interview Quest PySide6 Desktop Application.
Houses the top futuristic gamer header, sidebar navigation, and views.
"""
import os
import sys
from typing import Optional

try:
    from PySide6.QtWidgets import (
        QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
        QPushButton, QStackedWidget, QFrame, QProgressBar,
        QScrollArea, QGridLayout, QMessageBox, QFileDialog
    )
    from PySide6.QtCore import Qt, QSize
    from PySide6.QtGui import QIcon, QFont
except ImportError:
    class QMainWindow: pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import Database
from business_logic import TrackerService
from ui.cyber_theme import CYBER_STYLE
from ui.roadmap_view import RoadmapView
from ui.daily_tracker_view import DailyTrackerView
from ui.productivity_graph import ProductivityGraphWidget

class MainWindow(QMainWindow):
    def __init__(self, db: Database):
        super().__init__()
        self.db = db
        self.service = TrackerService(db)
        self.setWindowTitle("INTERVIEW QUEST // Product Company Preparation System")
        self.resize(1280, 840)
        self.setStyleSheet(CYBER_STYLE)
        self.init_ui()

    def init_ui(self):
        root = QWidget()
        self.setCentralWidget(root)
        root_layout = QHBoxLayout(root)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # 1. Left Sidebar Navigation
        sidebar = QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setFixedWidth(220)
        s_layout = QVBoxLayout(sidebar)
        s_layout.setContentsMargins(14, 20, 14, 20)
        s_layout.setSpacing(8)

        # Logo / Brand
        brand = QLabel("INTERVIEW QUEST")
        brand.setStyleSheet("font-size: 16px; font-weight: 900; color: #00f0ff; letter-spacing: 1.5px;")
        sub_brand = QLabel("RPG INTERVIEW TRACKER")
        sub_brand.setStyleSheet("font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px;")
        s_layout.addWidget(brand)
        s_layout.addWidget(sub_brand)
        s_layout.addSpacing(16)

        # Nav Buttons
        self.nav_buttons = []
        nav_items = [
            ("⬡ Dashboard", 0),
            ("🗺 Roadmap", 1),
            ("📅 Daily Tracker", 2),
            ("📊 Analytics", 3),
            ("⚔ Skills", 4),
            ("⚙ Settings", 5)
        ]

        for text, index in nav_items:
            btn = QPushButton(text)
            btn.setProperty("class", "nav-btn")
            btn.setCheckable(True)
            btn.clicked.connect(lambda _, idx=index: self.switch_page(idx))
            s_layout.addWidget(btn)
            self.nav_buttons.append(btn)

        self.nav_buttons[0].setChecked(True)
        s_layout.addStretch()

        # Offline / DB Indicator
        db_badge = QLabel("● SQLite: tracker.db\n✓ Offline Active")
        db_badge.setStyleSheet("color: #00ff9d; font-size: 11px; font-weight: 600; padding: 6px; background: #111c2e; border-radius: 6px;")
        s_layout.addWidget(db_badge)

        root_layout.addWidget(sidebar)

        # 2. Right Content Area
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)
        content_layout.setContentsMargins(20, 16, 20, 20)
        content_layout.setSpacing(14)

        # Top Gamer Header Card
        self.header_card = self.create_gamer_header()
        content_layout.addWidget(self.header_card)

        # Main Stacked Pages
        self.pages = QStackedWidget()

        # Page 0: Dashboard
        self.dashboard_page = self.create_dashboard_page()
        self.pages.addWidget(self.dashboard_page)

        # Page 1: Roadmap
        self.roadmap_view = RoadmapView(self.db)
        self.roadmap_view.progress_updated.connect(self.on_data_updated)
        self.pages.addWidget(self.roadmap_view)

        # Page 2: Daily Tracker (Includes Productivity Graph below it)
        self.daily_tracker_page = self.create_daily_tracker_page()
        self.pages.addWidget(self.daily_tracker_page)

        # Page 3: Analytics Page
        self.analytics_page = self.create_analytics_page()
        self.pages.addWidget(self.analytics_page)

        # Page 4: Skills Catalog
        self.skills_page = self.create_skills_catalog_page()
        self.pages.addWidget(self.skills_page)

        # Page 5: Settings
        self.settings_page = self.create_settings_page()
        self.pages.addWidget(self.settings_page)

        content_layout.addWidget(self.pages)
        root_layout.addWidget(content_area)

        self.refresh_all_views()

    def create_gamer_header(self) -> QFrame:
        card = QFrame()
        card.setObjectName("HeaderCard")
        layout = QHBoxLayout(card)
        layout.setContentsMargins(18, 12, 18, 12)
        layout.setSpacing(20)

        # Level Badge
        lvl_box = QVBoxLayout()
        self.lbl_level_badge = QLabel("LEVEL 1")
        self.lbl_level_badge.setStyleSheet("color: #00f0ff; font-weight: 800; font-size: 14px; letter-spacing: 1px;")
        self.lbl_level_title = QLabel("Beginner")
        self.lbl_level_title.setStyleSheet("color: #f8fafc; font-weight: 700; font-size: 16px;")
        lvl_box.addWidget(self.lbl_level_badge)
        lvl_box.addWidget(self.lbl_level_title)
        layout.addLayout(lvl_box)

        # XP Progress Bar
        xp_box = QVBoxLayout()
        xp_header = QHBoxLayout()
        self.lbl_xp_text = QLabel("XP: 0 / 500")
        self.lbl_xp_text.setStyleSheet("color: #94a3b8; font-size: 12px; font-weight: 600;")
        xp_header.addWidget(self.lbl_xp_text)
        xp_header.addStretch()
        xp_box.addLayout(xp_header)

        self.xp_bar = QProgressBar()
        self.xp_bar.setFixedHeight(10)
        self.xp_bar.setValue(0)
        xp_box.addWidget(self.xp_bar)
        layout.addLayout(xp_box, stretch=2)

        # Streak Counter
        streak_box = QVBoxLayout()
        lbl_s_title = QLabel("CURRENT STREAK")
        lbl_s_title.setStyleSheet("color: #94a3b8; font-size: 11px; font-weight: 600;")
        self.lbl_streak = QLabel("🔥 0 DAYS")
        self.lbl_streak.setStyleSheet("color: #f59e0b; font-size: 15px; font-weight: 800;")
        streak_box.addWidget(lbl_s_title)
        streak_box.addWidget(self.lbl_streak)
        layout.addLayout(streak_box)

        # Overall Progress
        ov_box = QVBoxLayout()
        lbl_ov_title = QLabel("OVERALL PROGRESS")
        lbl_ov_title.setStyleSheet("color: #94a3b8; font-size: 11px; font-weight: 600;")
        self.lbl_overall_pct = QLabel("0.0%")
        self.lbl_overall_pct.setStyleSheet("color: #00ff9d; font-size: 15px; font-weight: 800;")
        ov_box.addWidget(lbl_ov_title)
        ov_box.addWidget(self.lbl_overall_pct)
        layout.addLayout(ov_box)

        return card

    def create_dashboard_page(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(14)

        # Quick stats grid (8 core indicators)
        self.stats_grid = QGridLayout()
        self.stats_grid.setSpacing(12)

        self.metric_cards = {}
        indicators = [
            ("overall_progress_pct", "Overall Progress", "0%", "#00ff9d"),
            ("level", "Current Level", "1", "#00f0ff"),
            ("total_skills_completed", "Skills Completed", "0", "#38bdf8"),
            ("total_study_sessions", "Study Sessions", "0", "#818cf8"),
            ("current_streak", "Current Streak", "0 Days", "#f59e0b"),
            ("longest_streak", "Longest Streak", "0 Days", "#fbbf24"),
            ("today_skills_count", "Today's Progress", "0 Skills", "#ec4899"),
            ("overall_productivity", "Productivity Score", "0/100", "#10b981"),
        ]

        for i, (key, title, val, color) in enumerate(indicators):
            row = i // 4
            col = i % 4
            card = QFrame()
            card.setProperty("class", "card")
            c_layout = QVBoxLayout(card)
            c_layout.setContentsMargins(14, 12, 14, 12)
            c_layout.setSpacing(4)

            lbl_t = QLabel(title)
            lbl_t.setStyleSheet("color: #94a3b8; font-size: 11px; font-weight: 600;")
            lbl_v = QLabel(val)
            lbl_v.setStyleSheet(f"color: {color}; font-size: 18px; font-weight: 800;")

            c_layout.addWidget(lbl_t)
            c_layout.addWidget(lbl_v)
            self.metric_cards[key] = lbl_v
            self.stats_grid.addWidget(card, row, col)

        layout.addLayout(self.stats_grid)

        # Dashboard productivity graph
        self.dash_graph = ProductivityGraphWidget(self.db)
        layout.addWidget(self.dash_graph)

        return widget

    def create_daily_tracker_page(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(14)

        # Daily Tracker Component
        self.daily_tracker = DailyTrackerView(self.db)
        self.daily_tracker.activity_saved.connect(self.on_data_updated)
        layout.addWidget(self.daily_tracker, stretch=3)

        # Below the daily tracker: Overall Productivity Graph (Core Requirement #5)
        self.daily_tracker_graph = ProductivityGraphWidget(self.db)
        layout.addWidget(self.daily_tracker_graph, stretch=2)

        return widget

    def create_analytics_page(self) -> QWidget:
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: transparent; }")

        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(16)

        title = QLabel("SYSTEM ANALYTICS & INSIGHTS")
        title.setStyleSheet("font-size: 18px; font-weight: 800; color: #00f0ff;")
        layout.addWidget(title)

        self.analytics_text = QLabel("Calculating metrics from SQLite...")
        self.analytics_text.setStyleSheet("font-size: 13px; color: #cbd5e1; line-height: 1.6;")
        layout.addWidget(self.analytics_text)

        analytics_graph = ProductivityGraphWidget(self.db)
        layout.addWidget(analytics_graph)

        scroll.setWidget(container)
        return scroll

    def create_skills_catalog_page(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(10, 10, 10, 10)
        title = QLabel("SKILLS CATALOG & STATUS")
        title.setStyleSheet("font-size: 18px; font-weight: 800; color: #00f0ff;")
        layout.addWidget(title)

        # Simply show the roadmap tree view here as well
        skills_tree = RoadmapView(self.db)
        skills_tree.progress_updated.connect(self.on_data_updated)
        layout.addWidget(skills_tree)
        return widget

    def create_settings_page(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        title = QLabel("SYSTEM SETTINGS & DATA CONTROLS")
        title.setStyleSheet("font-size: 18px; font-weight: 800; color: #00f0ff;")
        layout.addWidget(title)

        # Reset button
        btn_reset = QPushButton("⚠ Reset All Progress to Initial Baseline")
        btn_reset.setProperty("class", "secondary-btn")
        btn_reset.setStyleSheet("color: #f43f5e; border-color: #f43f5e55;")
        btn_reset.clicked.connect(self.reset_data)
        layout.addWidget(btn_reset)

        # Database info
        info = QLabel(f"SQLite Location: {self.db.db_path}\nStorage Engine: Persistent SQLite3\nData updates commit synchronously on each change.")
        info.setStyleSheet("color: #94a3b8; font-size: 12px;")
        layout.addWidget(info)

        layout.addStretch()
        return widget

    def switch_page(self, index: int):
        for i, btn in enumerate(self.nav_buttons):
            btn.setChecked(i == index)
        self.pages.setCurrentIndex(index)

    def on_data_updated(self):
        self.refresh_all_views()

    def refresh_all_views(self):
        metrics = self.service.get_dashboard_metrics()

        # Update Header
        self.lbl_level_badge.setText(f"LEVEL {metrics['level']}")
        self.lbl_level_title.setText(metrics['level_title'])
        self.lbl_xp_text.setText(f"XP: {metrics['xp']} / {metrics['next_level_xp']}")
        self.xp_bar.setValue(int(metrics['level_progress_pct']))
        self.lbl_streak.setText(f"🔥 {metrics['current_streak']} DAYS")
        self.lbl_overall_pct.setText(f"{metrics['overall_progress_pct']}%")

        # Update Dashboard Cards
        if "overall_progress_pct" in self.metric_cards:
            self.metric_cards["overall_progress_pct"].setText(f"{metrics['overall_progress_pct']}%")
            self.metric_cards["level"].setText(f"Lvl {metrics['level']} ({metrics['level_title']})")
            self.metric_cards["total_skills_completed"].setText(f"{metrics['total_skills_completed']} / {metrics['total_skills_count']}")
            self.metric_cards["total_study_sessions"].setText(str(metrics["total_study_sessions"]))
            self.metric_cards["current_streak"].setText(f"{metrics['current_streak']} Days")
            self.metric_cards["longest_streak"].setText(f"{metrics['longest_streak']} Days")
            self.metric_cards["today_skills_count"].setText(f"{metrics['today_skills_count']} Skills ({metrics['today_time_minutes']} min)")
            self.metric_cards["overall_productivity"].setText(f"{metrics['overall_productivity']} / 100")

        # Refresh Graphs
        self.dash_graph.refresh_graph()
        self.daily_tracker_graph.refresh_graph()

    def reset_data(self):
        reply = QMessageBox.question(
            self, "Reset Progress",
            "Are you sure you want to reset all progress? This will reset tracker.db to the initial roadmap.",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            from sample_data import seed_database
            self.db.reset_database()
            seed_database(self.db, force=True)
            self.roadmap_view.refresh_roadmap()
            self.refresh_all_views()
            QMessageBox.information(self, "Reset Complete", "Database reinitialized successfully!")
