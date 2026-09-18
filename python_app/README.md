# INTERVIEW QUEST: Python Desktop Gamified Productivity & Interview Tracker

A futuristic, RPG-style developer training dashboard and productivity tracker engineered in **Python** with **PySide6/PyQt** and **SQLite** for product-based company interview preparation.

---

## 🎯 Architecture & Structure

```
python_app/
├── tracker.db               # Local SQLite database (persistent storage)
├── database.py              # SQLite schema, indices, queries, migrations
├── models.py                # Data classes for Skills, Categories, Logs, Profile
├── business_logic.py        # XP formulas, Level progression, Streak calculation
├── sample_data.py           # Product company roadmap initial seed data
├── test_tracker.py          # Complete unit and integration test suite
├── requirements.txt         # PySide6 dependency
├── main.py                  # Main launcher (supports GUI & CLI modes)
└── ui/
    ├── cyber_theme.py       # Futuristic dark theme stylesheet (QSS)
    ├── main_window.py       # Main desktop window, sidebar & header stats
    ├── roadmap_view.py      # Interactive skill tree, status badges & updater
    ├── daily_tracker_view.py# Parallel multi-checkbox tracker with time/notes
    └── productivity_graph.py# Dynamic graph (Daily/Weekly/Monthly)
```

---

## 🚀 Quick Start Instructions

### 1. Prerequisites
- Python 3.9+ installed
- Pip package manager

### 2. Installation
Navigate to the `python_app` folder and install dependencies:

```bash
cd python_app
pip install -r requirements.txt
```

### 3. Running the Application

#### To launch the Futuristic Desktop GUI (PySide6):
```bash
python main.py
```

#### To run the Terminal CLI Mode (works offline, over SSH, or in headless environments):
```bash
python main.py --cli
```

### 4. Running the Tests
To execute the automated verification test suite:
```bash
python test_tracker.py
```

---

## 🎮 Gamification & Core Features

### 1. Futuristic Header & Level Progression
- **Levels**:
  - Level 1: *Beginner* (0 – 500 XP)
  - Level 2: *Learner* (501 – 1,200 XP)
  - Level 3: *Developer* (1,201 – 2,500 XP)
  - Level 4: *Problem Solver* (2,501 – 4,500 XP)
  - Level 5: *Interview Ready* (4,501 – 7,500 XP)
  - Level 6: *Expert* (7,501 – 12,000 XP)
  - Level 7: *Staff Engineer* (12,001+ XP)
- **XP Rewards**:
  - Skills studied: +30 XP per skill
  - DSA & Interview questions solved: +20 XP each
  - Study duration: +15 XP per 30 minutes
  - Active daily streak: +40 XP × streak days
  - Full skill mastery: +50 XP bonus

### 2. Complete Roadmap / Skill Tree
- Java Language Mastery
- DSA (Beginner → Intermediate → Expert)
- Algorithms (Two Pointers, Sliding Window, Greedy, DP, Graph)
- Core CS Subjects (Data Structures, OOP, SQL, DBMS, Computer Networks)
- Interview Preparation (500 Questions milestone)
- Communication (Speaking, Grammar, Soft Skills)
- *Expandable*: Easily add custom subtopics (e.g., Arrays, Strings, Trees) directly from the UI.

### 3. Parallel Daily Tracker
- Date picker (select today, yesterday, or any past calendar date)
- Checkboxes for all 12 skills simultaneously
- Expandable fields per checked skill:
  - Time spent in minutes
  - Problems/Questions solved counter
  - Short notes
- Instant auto-save to `tracker.db` SQLite database

### 4. Dynamic Productivity Analytics
- Positioned directly below the daily tracker
- Toggles for **Daily**, **Weekly**, and **Monthly**
- Metrics for:
  - Skills completed
  - Study sessions
  - Time spent
  - Problems solved
