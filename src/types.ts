/**
 * Types and interfaces for Interview Quest Gamified Tracker
 */

export type SkillStatus = 'locked' | 'in_progress' | 'completed';

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  parentId?: string | null;
  completedItems: number;
  totalItems: number;
  status: SkillStatus;
  xpReward: number;
  orderIndex: number;
  subtopics?: Skill[];
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  orderIndex: number;
  skills: Skill[];
}

export interface DailySkillEntry {
  skillId: string;
  skillName: string;
  completed: boolean;
  timeSpentMinutes: number;
  problemsSolved: number;
  notes: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  entries: Record<string, DailySkillEntry>; // keyed by skillId
  updatedAt: string;
}

export interface UserProfile {
  xp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface ProductivityPoint {
  label: string;
  date: string;
  skillsCompleted: number;
  studySessions: number;
  timeSpentMinutes: number;
  problemsSolved: number;
}

export interface DashboardMetrics {
  overallProgressPct: number;
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  levelProgressPct: number;
  totalSkillsCompleted: number;
  totalSkillsCount: number;
  totalStudySessions: number;
  totalStudyHours: number;
  totalProblemsSolved: number;
  currentStreak: number;
  longestStreak: number;
  todaySkillsCount: number;
  todayTimeMinutes: number;
  todayProblemsSolved: number;
  overallProductivity: number;
}

export interface LevelThreshold {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}
