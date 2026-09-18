"""
Sample Initial Roadmap and Seed Data for Interview Quest.
Matches the requested curriculum for product-based company interview preparation.
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from typing import Dict, Any, List
from database import Database

CATEGORIES: List[Dict[str, Any]] = [
    {
        "id": "java_mastery",
        "name": "Java Language Mastery",
        "description": "Core and advanced Java language constructs, memory management, and OOP in practice.",
        "order_index": 1
    },
    {
        "id": "dsa",
        "name": "Data Structures & Algorithms (DSA)",
        "description": "Progressive problem solving mastery from Beginner to Intermediate to Expert.",
        "order_index": 2
    },
    {
        "id": "algorithms",
        "name": "Algorithms",
        "description": "Core algorithmic techniques, complexity analysis, and pattern recognition.",
        "order_index": 3
    },
    {
        "id": "core_cs",
        "name": "Core CS Subjects",
        "description": "Computer Science foundational systems: OS, DBMS, Networks, OOP, and SQL.",
        "order_index": 4
    },
    {
        "id": "interview_prep",
        "name": "Interview Preparation",
        "description": "500 high-frequency product company coding and behavioral questions.",
        "order_index": 5
    },
    {
        "id": "communication",
        "name": "Communication & Soft Skills",
        "description": "Speaking, professional grammar, and technical articulation for interviews.",
        "order_index": 6
    }
]

# The initial roadmap skills
SKILLS: List[Dict[str, Any]] = [
    # 1. Java Mastery
    {
        "id": "java",
        "category_id": "java_mastery",
        "name": "Java Language Mastery",
        "parent_id": None,
        "completed_items": 4,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 150,
        "order_index": 1
    },

    # 2. DSA Progression
    {
        "id": "dsa",
        "category_id": "dsa",
        "name": "DSA Master Track",
        "parent_id": None,
        "completed_items": 6,
        "total_items": 30,
        "status": "in_progress",
        "xp_reward": 300,
        "order_index": 2
    },
    {
        "id": "dsa_beginner",
        "category_id": "dsa",
        "name": "DSA - Beginner",
        "parent_id": "dsa",
        "completed_items": 8,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 100,
        "order_index": 3
    },
    {
        "id": "dsa_intermediate",
        "category_id": "dsa",
        "name": "DSA - Intermediate",
        "parent_id": "dsa",
        "completed_items": 3,
        "total_items": 12,
        "status": "in_progress",
        "xp_reward": 150,
        "order_index": 4
    },
    {
        "id": "dsa_expert",
        "category_id": "dsa",
        "name": "DSA - Expert",
        "parent_id": "dsa",
        "completed_items": 0,
        "total_items": 15,
        "status": "locked",
        "xp_reward": 250,
        "order_index": 5
    },

    # 3. Algorithms
    {
        "id": "algorithms",
        "category_id": "algorithms",
        "name": "Algorithms",
        "parent_id": None,
        "completed_items": 4,
        "total_items": 12,
        "status": "in_progress",
        "xp_reward": 180,
        "order_index": 6
    },

    # 4. Core CS Subjects
    {
        "id": "data_structures",
        "category_id": "core_cs",
        "name": "Data Structures",
        "parent_id": None,
        "completed_items": 7,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 120,
        "order_index": 7
    },
    {
        "id": "oop",
        "category_id": "core_cs",
        "name": "OOP / OOPS",
        "parent_id": None,
        "completed_items": 6,
        "total_items": 8,
        "status": "in_progress",
        "xp_reward": 120,
        "order_index": 8
    },
    {
        "id": "sql",
        "category_id": "core_cs",
        "name": "SQL",
        "parent_id": None,
        "completed_items": 5,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 120,
        "order_index": 9
    },
    {
        "id": "dbms",
        "category_id": "core_cs",
        "name": "DBMS",
        "parent_id": None,
        "completed_items": 4,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 120,
        "order_index": 10
    },
    {
        "id": "computer_networks",
        "category_id": "core_cs",
        "name": "Computer Networks",
        "parent_id": None,
        "completed_items": 3,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 120,
        "order_index": 11
    },

    # 5. Interview Preparation
    {
        "id": "interview_questions",
        "category_id": "interview_prep",
        "name": "500 Interview Questions",
        "parent_id": None,
        "completed_items": 42,
        "total_items": 500,
        "status": "in_progress",
        "xp_reward": 500,
        "order_index": 12
    },

    # 6. Communication
    {
        "id": "speaking",
        "category_id": "communication",
        "name": "Speaking",
        "parent_id": None,
        "completed_items": 4,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 100,
        "order_index": 13
    },
    {
        "id": "grammar",
        "category_id": "communication",
        "name": "Grammar",
        "parent_id": None,
        "completed_items": 5,
        "total_items": 10,
        "status": "in_progress",
        "xp_reward": 80,
        "order_index": 14
    },
    {
        "id": "soft_skills",
        "category_id": "communication",
        "name": "Soft Skills",
        "parent_id": None,
        "completed_items": 3,
        "total_items": 8,
        "status": "in_progress",
        "xp_reward": 100,
        "order_index": 15
    }
]

def seed_database(db: Database, force: bool = False):
    """Seeds initial roadmap and sample activity if database is empty or force=True."""
    existing_skills = db.get_all_skills()
    if existing_skills and not force:
        return

    # Seed categories
    for cat in CATEGORIES:
        db.insert_category(cat["id"], cat["name"], cat["description"], cat["order_index"])

    # Seed skills
    for skill in SKILLS:
        db.insert_skill(
            id=skill["id"],
            category_id=skill["category_id"],
            name=skill["name"],
            parent_id=skill.get("parent_id"),
            completed_items=skill["completed_items"],
            total_items=skill["total_items"],
            status=skill["status"],
            xp_reward=skill["xp_reward"],
            order_index=skill["order_index"]
        )

    # Seed some sample activity history so charts and streak calculations immediately reflect realistic progress
    import datetime
    today = datetime.date.today()
    sample_logs = [
        # Today
        (today.strftime("%Y-%m-%d"), [
            {"skill_id": "java", "completed": 1, "time_spent_minutes": 60, "problems_solved": 3, "notes": "Java 17 sealed classes & streams"},
            {"skill_id": "dsa_beginner", "completed": 1, "time_spent_minutes": 90, "problems_solved": 4, "notes": "Binary search on rotated sorted array"},
            {"skill_id": "sql", "completed": 1, "time_spent_minutes": 45, "problems_solved": 2, "notes": "Dense rank and partition by queries"}
        ]),
        # Yesterday
        ((today - datetime.timedelta(days=1)).strftime("%Y-%m-%d"), [
            {"skill_id": "dsa_intermediate", "completed": 1, "time_spent_minutes": 75, "problems_solved": 2, "notes": "Inverting BST and LCA"},
            {"skill_id": "dbms", "completed": 1, "time_spent_minutes": 50, "problems_solved": 0, "notes": "ACID properties & 2PL locking protocol"},
            {"skill_id": "interview_questions", "completed": 1, "time_spent_minutes": 40, "problems_solved": 5, "notes": "Product company mock question batch 1"}
        ]),
        # 2 days ago
        ((today - datetime.timedelta(days=2)).strftime("%Y-%m-%d"), [
            {"skill_id": "algorithms", "completed": 1, "time_spent_minutes": 80, "problems_solved": 3, "notes": "Sliding window maximum"},
            {"skill_id": "speaking", "completed": 1, "time_spent_minutes": 30, "problems_solved": 0, "notes": "STAR method answer for challenging bug"}
        ]),
        # 3 days ago
        ((today - datetime.timedelta(days=3)).strftime("%Y-%m-%d"), [
            {"skill_id": "oop", "completed": 1, "time_spent_minutes": 60, "problems_solved": 1, "notes": "Liskov substitution and Open-Closed principles"},
            {"skill_id": "computer_networks", "completed": 1, "time_spent_minutes": 45, "problems_solved": 0, "notes": "3-way TCP handshake vs UDP"}
        ]),
        # 4 days ago
        ((today - datetime.timedelta(days=4)).strftime("%Y-%m-%d"), [
            {"skill_id": "java", "completed": 1, "time_spent_minutes": 60, "problems_solved": 2, "notes": "JVM memory model: heap vs stack"},
            {"skill_id": "interview_questions", "completed": 1, "time_spent_minutes": 50, "problems_solved": 6, "notes": "Top 100 Liked problems"}
        ]),
        # 5 days ago
        ((today - datetime.timedelta(days=5)).strftime("%Y-%m-%d"), [
            {"skill_id": "dsa_beginner", "completed": 1, "time_spent_minutes": 70, "problems_solved": 3, "notes": "Two Pointers container with most water"}
        ])
    ]

    for log_date, entries in sample_logs:
        db.save_daily_entries(log_date, entries)

    # Calculate streaks and update profile
    db.calculate_streaks()
