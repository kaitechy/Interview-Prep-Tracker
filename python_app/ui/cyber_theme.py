"""
Cyberpunk / Futuristic Dark Theme Stylesheet (QSS) for Interview Quest.
Combines deep space dark tones (#080b11, #0f172a) with neon cyan (#00f0ff),
neon emerald (#00ff9d), and purple (#a855f7) accents.
"""

CYBER_STYLE = """
QMainWindow, QDialog {
    background-color: #080b11;
    color: #e2e8f0;
    font-family: 'Segoe UI', 'SF Pro Display', 'Space Grotesk', sans-serif;
}

QWidget {
    background-color: transparent;
    color: #e2e8f0;
    font-size: 13px;
}

/* Sidebar navigation */
QFrame#Sidebar {
    background-color: #0c111d;
    border-right: 1px solid #1e293b;
}

QPushButton.nav-btn {
    background-color: transparent;
    color: #94a3b8;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 13px;
}

QPushButton.nav-btn:hover {
    background-color: #1e293b;
    color: #00f0ff;
}

QPushButton.nav-btn:checked {
    background-color: rgba(0, 240, 255, 0.12);
    color: #00f0ff;
    border-left: 3px solid #00f0ff;
}

/* Top game stats header */
QFrame#HeaderCard {
    background-color: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
}

/* Rounded Cards */
QFrame.card {
    background-color: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
}

QFrame.card:hover {
    border: 1px solid rgba(0, 240, 255, 0.4);
}

/* Standard Buttons */
QPushButton.primary-btn {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #00d2ff, stop:1 #00f0ff);
    color: #040814;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    padding: 8px 18px;
}

QPushButton.primary-btn:hover {
    background: #38bdf8;
}

QPushButton.secondary-btn {
    background-color: #1e293b;
    color: #f1f5f9;
    font-weight: 600;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 8px 16px;
}

QPushButton.secondary-btn:hover {
    border-color: #00f0ff;
    color: #00f0ff;
}

/* Checkboxes */
QCheckBox {
    spacing: 10px;
    color: #f1f5f9;
    font-weight: 500;
    font-size: 13px;
}

QCheckBox::indicator {
    width: 20px;
    height: 20px;
    border: 2px solid #334155;
    border-radius: 6px;
    background-color: #090d16;
}

QCheckBox::indicator:hover {
    border-color: #00f0ff;
}

QCheckBox::indicator:checked {
    background-color: #00f0ff;
    border-color: #00f0ff;
}

/* Inputs & Spinners */
QLineEdit, QSpinBox, QDateEdit, QTextEdit {
    background-color: #0b1120;
    border: 1px solid #273549;
    border-radius: 8px;
    color: #f8fafc;
    padding: 6px 12px;
    font-size: 13px;
}

QLineEdit:focus, QSpinBox:focus, QDateEdit:focus, QTextEdit:focus {
    border: 1px solid #00f0ff;
}

/* Progress Bars */
QProgressBar {
    background-color: #090d16;
    border: 1px solid #1e293b;
    border-radius: 6px;
    text-align: center;
    color: #f8fafc;
    font-weight: 600;
    font-size: 11px;
    height: 14px;
}

QProgressBar::chunk {
    background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #00f0ff, stop:1 #00ff9d);
    border-radius: 5px;
}

/* Scrollbars */
QScrollBar:vertical {
    border: none;
    background: #080b11;
    width: 8px;
    margin: 0px;
}

QScrollBar::handle:vertical {
    background: #1e293b;
    min-height: 20px;
    border-radius: 4px;
}

QScrollBar::handle:vertical:hover {
    background: #334155;
}

QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
    height: 0px;
}
"""
