"""
Productivity Graph View for Interview Quest.
Visualizes productivity trends over time:
- Skills completed
- Study sessions
- Time spent
- Problems/questions solved
With Daily / Weekly / Monthly view mode switching.
"""
from typing import List, Dict, Any
import os
import sys

try:
    from PySide6.QtWidgets import (
        QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
        QFrame, QButtonGroup, QComboBox
    )
    from PySide6.QtCore import Qt, QRectF, QPointF
    from PySide6.QtGui import QPainter, QPen, QBrush, QColor, QFont, QLinearGradient, QPainterPath
except ImportError:
    class QWidget: pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from database import Database

class ProductivityCanvas(QWidget):
    """Custom high-performance vector chart rendered via QPainter."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.data_points: List[Dict[str, Any]] = []
        self.selected_metric = "skills_completed"  # 'skills_completed', 'study_sessions', 'time_spent_minutes', 'problems_solved'
        self.setMinimumHeight(240)
        self.setStyleSheet("background-color: #0b1120; border-radius: 10px;")

    def set_data(self, data: List[Dict[str, Any]], metric: str):
        self.data_points = data
        self.selected_metric = metric
        self.update()

    def paintEvent(self, event):
        if not self.data_points:
            return

        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        w = self.width()
        h = self.height()
        padding_left = 50
        padding_right = 30
        padding_top = 30
        padding_bottom = 40

        chart_w = w - padding_left - padding_right
        chart_h = h - padding_top - padding_bottom

        # Extract values for selected metric
        values = [p.get(self.selected_metric, 0) for p in self.data_points]
        labels = [p.get("label", "") for p in self.data_points]

        max_val = max(values) if values else 1
        if max_val <= 0:
            max_val = 5

        # Metric colors
        metric_colors = {
            "skills_completed": (QColor("#00f0ff"), "Skills Completed"),
            "study_sessions": (QColor("#818cf8"), "Study Sessions"),
            "time_spent_minutes": (QColor("#00ff9d"), "Time Spent (min)"),
            "problems_solved": (QColor("#f59e0b"), "Problems Solved")
        }
        line_color, metric_name = metric_colors.get(self.selected_metric, (QColor("#00f0ff"), "Metric"))

        # Draw Grid Lines
        grid_pen = QPen(QColor("#1e293b"), 1, Qt.PenStyle.DashLine)
        painter.setPen(grid_pen)
        font = QFont("Space Grotesk", 9)
        painter.setFont(font)

        num_ticks = 4
        for i in range(num_ticks + 1):
            y_ratio = i / num_ticks
            y = padding_top + chart_h - (y_ratio * chart_h)
            painter.drawLine(int(padding_left), int(y), int(w - padding_right), int(y))
            # Label
            tick_val = int(y_ratio * max_val)
            painter.setPen(QColor("#64748b"))
            painter.drawText(10, int(y + 4), f"{tick_val}")
            painter.setPen(grid_pen)

        # Draw Data Points & Gradient Area
        if len(self.data_points) < 2:
            return

        step_x = chart_w / (len(self.data_points) - 1)
        points: List[QPointF] = []

        for i, val in enumerate(values):
            x = padding_left + (i * step_x)
            y = padding_top + chart_h - ((val / max_val) * chart_h)
            points.append(QPointF(x, y))

        # Gradient polygon path
        grad_path = QPainterPath()
        grad_path.moveTo(points[0].x(), padding_top + chart_h)
        for pt in points:
            grad_path.lineTo(pt)
        grad_path.lineTo(points[-1].x(), padding_top + chart_h)
        grad_path.closeSubpath()

        gradient = QLinearGradient(0, padding_top, 0, padding_top + chart_h)
        fill_col = QColor(line_color)
        fill_col.setAlpha(45)
        gradient.setColorAt(0, fill_col)
        gradient.setColorAt(1, QColor(0, 0, 0, 0))
        painter.fillPath(grad_path, QBrush(gradient))

        # Draw Glowing Line
        line_pen = QPen(line_color, 2.5)
        painter.setPen(line_pen)
        for i in range(len(points) - 1):
            painter.drawLine(points[i], points[i + 1])

        # Draw Nodes & X-Axis Labels
        node_brush = QBrush(line_color)
        painter.setBrush(node_brush)

        for i, pt in enumerate(points):
            # Outer ring
            painter.setPen(QPen(QColor("#080b11"), 2))
            painter.drawEllipse(pt, 4.5, 4.5)

            # X Axis Label (draw every 1 or 2 labels if too crowded)
            if len(labels) > 10 and i % 2 != 0:
                continue
            painter.setPen(QColor("#94a3b8"))
            lbl = labels[i]
            painter.drawText(int(pt.x() - 18), int(h - 14), lbl)

        painter.end()


class ProductivityGraphWidget(QFrame):
    def __init__(self, db: Database, parent=None):
        super().__init__(parent)
        self.db = db
        self.period = "daily"  # 'daily', 'weekly', 'monthly'
        self.current_metric = "skills_completed"
        self.init_ui()

    def init_ui(self):
        self.setProperty("class", "card")
        self.setStyleSheet("""
            QFrame {
                background-color: #0f172a;
                border: 1px solid #1e293b;
                border-radius: 12px;
            }
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(18, 16, 18, 16)
        layout.setSpacing(12)

        # Header Row: Title and Filter Controls
        header = QHBoxLayout()
        title_box = QVBoxLayout()
        title = QLabel("OVERALL PRODUCTIVITY CURVE")
        title.setStyleSheet("font-size: 15px; font-weight: 800; color: #00f0ff; letter-spacing: 0.5px;")
        sub = QLabel("Dynamic progression analytics tracked automatically from SQLite.")
        sub.setStyleSheet("color: #94a3b8; font-size: 11px;")
        title_box.addWidget(title)
        title_box.addWidget(sub)
        header.addLayout(title_box)

        header.addStretch()

        # Metric Selector
        self.metric_combo = QComboBox()
        self.metric_combo.addItem("Skills Completed", "skills_completed")
        self.metric_combo.addItem("Study Sessions", "study_sessions")
        self.metric_combo.addItem("Time Spent (Minutes)", "time_spent_minutes")
        self.metric_combo.addItem("Problems Solved", "problems_solved")
        self.metric_combo.currentIndexChanged.connect(self.on_metric_changed)
        header.addWidget(self.metric_combo)

        # Daily / Weekly / Monthly Buttons
        self.btn_daily = QPushButton("Daily")
        self.btn_daily.setProperty("class", "primary-btn")
        self.btn_daily.clicked.connect(lambda: self.set_period("daily"))

        self.btn_weekly = QPushButton("Weekly")
        self.btn_weekly.setProperty("class", "secondary-btn")
        self.btn_weekly.clicked.connect(lambda: self.set_period("weekly"))

        self.btn_monthly = QPushButton("Monthly")
        self.btn_monthly.setProperty("class", "secondary-btn")
        self.btn_monthly.clicked.connect(lambda: self.set_period("monthly"))

        header.addWidget(self.btn_daily)
        header.addWidget(self.btn_weekly)
        header.addWidget(self.btn_monthly)

        layout.addLayout(header)

        # Canvas
        self.canvas = ProductivityCanvas()
        layout.addWidget(self.canvas)

        self.refresh_graph()

    def set_period(self, p: str):
        self.period = p
        self.btn_daily.setProperty("class", "primary-btn" if p == "daily" else "secondary-btn")
        self.btn_weekly.setProperty("class", "primary-btn" if p == "weekly" else "secondary-btn")
        self.btn_monthly.setProperty("class", "primary-btn" if p == "monthly" else "secondary-btn")
        self.refresh_graph()

    def on_metric_changed(self):
        self.current_metric = self.metric_combo.currentData()
        self.refresh_graph()

    def refresh_graph(self):
        data = self.db.get_productivity_data(self.period)
        self.canvas.set_data(data, self.current_metric)
