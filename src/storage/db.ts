/**
 * Persistent Storage & Business Logic Engine for Interview Quest
 * Mirrors the Python SQLite schema and provides offline local persistence.
 */

import { Category, Skill, DailyLog, DailySkillEntry, UserProfile, DashboardMetrics, ProductivityPoint, LevelThreshold } from '../types';

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, title: "Beginner", minXp: 0, maxXp: 500 },
  { level: 2, title: "Learner", minXp: 501, maxXp: 1200 },
  { level: 3, title: "Developer", minXp: 1201, maxXp: 2500 },
  { level: 4, title: "Problem Solver", minXp: 2501, maxXp: 4500 },
  { level: 5, title: "Interview Ready", minXp: 4501, maxXp: 7500 },
  { level: 6, title: "Expert", minXp: 7501, maxXp: 12000 },
  { level: 7, title: "Staff Engineer", minXp: 12001, maxXp: 20000 },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "java_mastery",
    name: "Java Language Mastery",
    description: "Core & advanced Java: Memory model, OOP in practice, Collections, Multithreading & Lambdas.",
    orderIndex: 1,
    skills: [
      { id: "java", categoryId: "java_mastery", name: "Java Language Mastery", completedItems: 4, totalItems: 10, status: "in_progress", xpReward: 150, orderIndex: 1 }
    ]
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms (DSA)",
    description: "Progressive coding mastery structured from Beginner to Intermediate to Expert tiers.",
    orderIndex: 2,
    skills: [
      { id: "dsa", categoryId: "dsa", name: "DSA Master Track", completedItems: 11, totalItems: 37, status: "in_progress", xpReward: 300, orderIndex: 2 },
      { id: "dsa_beginner", categoryId: "dsa", name: "DSA - Beginner", parentId: "dsa", completedItems: 8, totalItems: 10, status: "in_progress", xpReward: 100, orderIndex: 3 },
      { id: "dsa_intermediate", categoryId: "dsa", name: "DSA - Intermediate", parentId: "dsa", completedItems: 3, totalItems: 12, status: "in_progress", xpReward: 150, orderIndex: 4 },
      { id: "dsa_expert", categoryId: "dsa", name: "DSA - Expert", parentId: "dsa", completedItems: 0, totalItems: 15, status: "locked", xpReward: 250, orderIndex: 5 },
    ]
  },
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Core algorithmic patterns: Two Pointers, Sliding Window, Greedy, Dynamic Programming, and Graph Traversals.",
    orderIndex: 3,
    skills: [
      { id: "algorithms", categoryId: "algorithms", name: "Algorithms", completedItems: 4, totalItems: 12, status: "in_progress", xpReward: 180, orderIndex: 6 }
    ]
  },
  {
    id: "core_cs",
    name: "Core CS Subjects",
    description: "Fundamental systems: Data Structures, OOP, SQL, DBMS, and Computer Networks.",
    orderIndex: 4,
    skills: [
      { id: "data_structures", categoryId: "core_cs", name: "Data Structures", completedItems: 7, totalItems: 10, status: "in_progress", xpReward: 120, orderIndex: 7 },
      { id: "oop", categoryId: "core_cs", name: "OOP / OOPS", completedItems: 6, totalItems: 8, status: "in_progress", xpReward: 120, orderIndex: 8 },
      { id: "sql", categoryId: "core_cs", name: "SQL", completedItems: 5, totalItems: 10, status: "in_progress", xpReward: 120, orderIndex: 9 },
      { id: "dbms", categoryId: "core_cs", name: "DBMS", completedItems: 4, totalItems: 10, status: "in_progress", xpReward: 120, orderIndex: 10 },
      { id: "computer_networks", categoryId: "core_cs", name: "Computer Networks", completedItems: 3, totalItems: 10, status: "in_progress", xpReward: 120, orderIndex: 11 },
    ]
  },
  {
    id: "interview_prep",
    name: "Interview Preparation",
    description: "500 high-yield product company technical questions and system mock reviews.",
    orderIndex: 5,
    skills: [
      { id: "interview_questions", categoryId: "interview_prep", name: "500 Interview Questions", completedItems: 42, totalItems: 500, status: "in_progress", xpReward: 500, orderIndex: 12 }
    ]
  },
  {
    id: "communication",
    name: "Communication & Soft Skills",
    description: "Verbal articulation, STAR behavioral interview delivery, and professional grammar.",
    orderIndex: 6,
    skills: [
      { id: "speaking", categoryId: "communication", name: "Speaking", completedItems: 4, totalItems: 10, status: "in_progress", xpReward: 100, orderIndex: 13 },
      { id: "grammar", categoryId: "communication", name: "Grammar", completedItems: 5, totalItems: 10, status: "in_progress", xpReward: 80, orderIndex: 14 },
      { id: "soft_skills", categoryId: "communication", name: "Soft Skills", completedItems: 3, totalItems: 8, status: "in_progress", xpReward: 100, orderIndex: 15 },
    ]
  }
];

export const INITIAL_DAILY_LOGS: Record<string, DailyLog> = (() => {
  const logs: Record<string, DailyLog> = {};
  const today = new Date();
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const sampleData = [
    {
      daysAgo: 0,
      entries: [
        { skillId: "java", skillName: "Java Language Mastery", completed: true, timeSpentMinutes: 60, problemsSolved: 3, notes: "Java 17 sealed classes & streams pipeline" },
        { skillId: "dsa_beginner", skillName: "DSA - Beginner", completed: true, timeSpentMinutes: 90, problemsSolved: 4, notes: "Rotated sorted array binary search" },
        { skillId: "sql", skillName: "SQL", completed: true, timeSpentMinutes: 45, problemsSolved: 2, notes: "DENSE_RANK() & partition queries" }
      ]
    },
    {
      daysAgo: 1,
      entries: [
        { skillId: "dsa_intermediate", skillName: "DSA - Intermediate", completed: true, timeSpentMinutes: 75, problemsSolved: 2, notes: "Lowest Common Ancestor in BST" },
        { skillId: "dbms", skillName: "DBMS", completed: true, timeSpentMinutes: 50, problemsSolved: 0, notes: "ACID properties & 2PL concurrency locks" },
        { skillId: "interview_questions", skillName: "500 Interview Questions", completed: true, timeSpentMinutes: 40, problemsSolved: 5, notes: "Amazon/Google high frequency batch" }
      ]
    },
    {
      daysAgo: 2,
      entries: [
        { skillId: "algorithms", skillName: "Algorithms", completed: true, timeSpentMinutes: 80, problemsSolved: 3, notes: "Sliding window maximum deque algorithm" },
        { skillId: "speaking", skillName: "Speaking", completed: true, timeSpentMinutes: 30, problemsSolved: 0, notes: "STAR method interview answer for conflict resolution" }
      ]
    },
    {
      daysAgo: 3,
      entries: [
        { skillId: "oop", skillName: "OOP / OOPS", completed: true, timeSpentMinutes: 60, problemsSolved: 1, notes: "Liskov Substitution & Single Responsibility" },
        { skillId: "computer_networks", skillName: "Computer Networks", completed: true, timeSpentMinutes: 45, problemsSolved: 0, notes: "TCP 3-way handshake vs UDP flow control" }
      ]
    },
    {
      daysAgo: 4,
      entries: [
        { skillId: "java", skillName: "Java Language Mastery", completed: true, timeSpentMinutes: 60, problemsSolved: 2, notes: "JVM memory model: heap vs stack & garbage collectors" },
        { skillId: "interview_questions", skillName: "500 Interview Questions", completed: true, timeSpentMinutes: 50, problemsSolved: 6, notes: "Top 100 Liked coding questions" }
      ]
    },
    {
      daysAgo: 5,
      entries: [
        { skillId: "dsa_beginner", skillName: "DSA - Beginner", completed: true, timeSpentMinutes: 70, problemsSolved: 3, notes: "Two pointers container with most water" }
      ]
    }
  ];

  sampleData.forEach(({ daysAgo, entries }) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const dateStr = formatDate(d);
    const entryMap: Record<string, DailySkillEntry> = {};
    entries.forEach(e => {
      entryMap[e.skillId] = e;
    });
    logs[dateStr] = {
      date: dateStr,
      entries: entryMap,
      updatedAt: new Date().toISOString()
    };
  });

  return logs;
})();

const STORAGE_KEYS = {
  CATEGORIES: "iq_categories_v1",
  DAILY_LOGS: "iq_daily_logs_v1",
  USER_PROFILE: "iq_user_profile_v1"
};

export class StorageService {
  private static instance: StorageService;

  private categories: Category[] = [];
  private dailyLogs: Record<string, DailyLog> = {};
  private profile: UserProfile = {
    xp: 0,
    level: 1,
    levelTitle: "Beginner",
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null
  };

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadFromStorage() {
    try {
      const savedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCats) {
        this.categories = JSON.parse(savedCats);
      } else {
        this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
        this.saveCategories();
      }

      const savedLogs = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (savedLogs) {
        this.dailyLogs = JSON.parse(savedLogs);
      } else {
        this.dailyLogs = JSON.parse(JSON.stringify(INITIAL_DAILY_LOGS));
        this.saveDailyLogs();
      }

      this.recalculateStreaksAndXP();
    } catch (e) {
      console.warn("Error loading from localStorage, resetting to seed:", e);
      this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
      this.dailyLogs = JSON.parse(JSON.stringify(INITIAL_DAILY_LOGS));
    }
  }

  public resetToDefaults() {
    this.categories = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    this.dailyLogs = JSON.parse(JSON.stringify(INITIAL_DAILY_LOGS));
    this.saveCategories();
    this.saveDailyLogs();
    this.recalculateStreaksAndXP();
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getAllSkills(): Skill[] {
    const skills: Skill[] = [];
    this.categories.forEach(c => {
      c.skills.forEach(s => skills.push(s));
    });
    return skills;
  }

  public updateSkillProgress(skillId: string, completedItems: number, totalItems?: number, status?: Skill['status']) {
    for (const cat of this.categories) {
      for (const s of cat.skills) {
        if (s.id === skillId) {
          if (totalItems !== undefined) s.totalItems = totalItems;
          s.completedItems = Math.max(0, Math.min(completedItems, s.totalItems));
          if (status) {
            s.status = status;
          } else {
            if (s.completedItems >= s.totalItems && s.totalItems > 0) {
              s.status = 'completed';
            } else if (s.completedItems > 0) {
              s.status = 'in_progress';
            }
          }
          this.saveCategories();
          this.recalculateStreaksAndXP();
          return;
        }
      }
    }
  }

  public addSubtopic(parentSkillId: string, name: string, totalItems: number = 10) {
    for (const cat of this.categories) {
      const parent = cat.skills.find(s => s.id === parentSkillId);
      if (parent) {
        const newId = `sub_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newSkill: Skill = {
          id: newId,
          categoryId: cat.id,
          name,
          parentId: parentSkillId,
          completedItems: 0,
          totalItems,
          status: 'in_progress',
          xpReward: 100,
          orderIndex: cat.skills.length + 1
        };
        cat.skills.push(newSkill);
        this.saveCategories();
        this.recalculateStreaksAndXP();
        return newSkill;
      }
    }
    return null;
  }

  public getDailyLog(dateStr: string): DailyLog {
    if (!this.dailyLogs[dateStr]) {
      this.dailyLogs[dateStr] = {
        date: dateStr,
        entries: {},
        updatedAt: new Date().toISOString()
      };
    }
    return this.dailyLogs[dateStr];
  }

  public saveDailySkillEntry(dateStr: string, entry: DailySkillEntry) {
    if (!this.dailyLogs[dateStr]) {
      this.dailyLogs[dateStr] = {
        date: dateStr,
        entries: {},
        updatedAt: new Date().toISOString()
      };
    }
    if (entry.completed) {
      this.dailyLogs[dateStr].entries[entry.skillId] = entry;
    } else {
      delete this.dailyLogs[dateStr].entries[entry.skillId];
    }
    this.dailyLogs[dateStr].updatedAt = new Date().toISOString();
    this.saveDailyLogs();
    this.recalculateStreaksAndXP();
  }

  public saveBatchDailySkills(dateStr: string, entries: DailySkillEntry[]) {
    if (!this.dailyLogs[dateStr]) {
      this.dailyLogs[dateStr] = {
        date: dateStr,
        entries: {},
        updatedAt: new Date().toISOString()
      };
    }
    entries.forEach(e => {
      if (e.completed) {
        this.dailyLogs[dateStr].entries[e.skillId] = e;
      } else {
        delete this.dailyLogs[dateStr].entries[e.skillId];
      }
    });
    this.dailyLogs[dateStr].updatedAt = new Date().toISOString();
    this.saveDailyLogs();
    this.recalculateStreaksAndXP();
  }

  public recalculateStreaksAndXP(): UserProfile {
    // 1. Calculate active dates
    const activeDates = new Set<string>();
    let totalProblems = 0;
    let totalTime = 0;
    let totalSkillsLogged = 0;

    Object.values(this.dailyLogs).forEach(log => {
      const activeEntries = Object.values(log.entries).filter(e => e.completed);
      if (activeEntries.length > 0) {
        activeDates.add(log.date);
        totalSkillsLogged += activeEntries.length;
        activeEntries.forEach(e => {
          totalProblems += (e.problemsSolved || 0);
          totalTime += (e.timeSpentMinutes || 0);
        });
      }
    });

    // 2. Streaks
    const sortedDates = Array.from(activeDates).sort();
    let longestStreak = 0;
    let curRun = 0;
    let prevDate: Date | null = null;

    sortedDates.forEach(dStr => {
      const curDate = new Date(dStr + "T00:00:00");
      if (!prevDate) {
        curRun = 1;
      } else {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          curRun += 1;
        } else if (diffDays > 1) {
          curRun = 1;
        }
      }
      if (curRun > longestStreak) longestStreak = curRun;
      prevDate = curDate;
    });

    // Current streak ending today or yesterday
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentStreak = 0;
    let checkDate = activeDates.has(todayStr) ? today : (activeDates.has(yesterdayStr) ? yesterday : null);

    if (checkDate) {
      while (true) {
        const dStr = checkDate.toISOString().split("T")[0];
        if (activeDates.has(dStr)) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 3. XP Formula
    let xp = 0;
    this.getAllSkills().forEach(s => {
      if (s.totalItems > 0) {
        const ratio = s.completedItems / s.totalItems;
        xp += Math.floor(ratio * (s.xpReward || 100));
        if (s.status === 'completed') xp += 50;
      }
    });

    xp += totalSkillsLogged * 30;
    xp += totalProblems * 20;
    xp += Math.floor((totalTime / 30) * 15);
    xp += currentStreak * 40;

    // Determine Level
    let level = 1;
    let levelTitle = "Beginner";
    for (const t of LEVEL_THRESHOLDS) {
      if (xp >= t.minXp) {
        level = t.level;
        levelTitle = t.title;
      }
    }

    this.profile = {
      xp,
      level,
      levelTitle,
      currentStreak,
      longestStreak,
      lastActiveDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null
    };

    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.profile));
    return this.profile;
  }

  public getDashboardMetrics(): DashboardMetrics {
    const allSkills = this.getAllSkills();
    const nonDsaParent = allSkills.filter(s => s.id !== "dsa" || !s.parentId);
    const totalItems = nonDsaParent.reduce((sum, s) => sum + s.totalItems, 0);
    const completedItems = nonDsaParent.reduce((sum, s) => sum + s.completedItems, 0);
    const overallProgressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    const totalSkillsCompleted = allSkills.filter(s => s.status === 'completed' || s.completedItems >= s.totalItems).length;

    let totalSessions = 0;
    let totalProblems = 0;
    let totalMinutes = 0;

    Object.values(this.dailyLogs).forEach(log => {
      const active = Object.values(log.entries).filter(e => e.completed);
      if (active.length > 0) {
        totalSessions += 1;
        active.forEach(e => {
          totalProblems += (e.problemsSolved || 0);
          totalMinutes += (e.timeSpentMinutes || 0);
        });
      }
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const todayLog = this.dailyLogs[todayStr];
    const todayEntries = todayLog ? Object.values(todayLog.entries).filter(e => e.completed) : [];
    const todaySkillsCount = todayEntries.length;
    const todayTimeMinutes = todayEntries.reduce((sum, e) => sum + (e.timeSpentMinutes || 0), 0);
    const todayProblemsSolved = todayEntries.reduce((sum, e) => sum + (e.problemsSolved || 0), 0);

    const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === this.profile.level) || LEVEL_THRESHOLDS[0];
    const levelRange = Math.max(1, currentThreshold.maxXp - currentThreshold.minXp);
    const levelProgressPct = Math.min(100, Math.max(0, ((this.profile.xp - currentThreshold.minXp) / levelRange) * 100));

    const overallProductivity = Math.min(100, Math.round((overallProgressPct * 0.4) + (this.profile.currentStreak * 5) + (totalSessions * 2)));

    return {
      overallProgressPct: Math.round(overallProgressPct * 10) / 10,
      level: this.profile.level,
      levelTitle: this.profile.levelTitle,
      xp: this.profile.xp,
      nextLevelXp: currentThreshold.maxXp,
      levelProgressPct: Math.round(levelProgressPct * 10) / 10,
      totalSkillsCompleted,
      totalSkillsCount: allSkills.length,
      totalStudySessions: totalSessions,
      totalStudyHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalProblemsSolved: totalProblems,
      currentStreak: this.profile.currentStreak,
      longestStreak: this.profile.longestStreak,
      todaySkillsCount,
      todayTimeMinutes,
      todayProblemsSolved,
      overallProductivity
    };
  }

  public getProductivityData(period: 'daily' | 'weekly' | 'monthly'): ProductivityPoint[] {
    const today = new Date();
    const result: ProductivityPoint[] = [];

    if (period === 'daily') {
      // Last 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const log = this.dailyLogs[dateStr];
        const active = log ? Object.values(log.entries).filter(e => e.completed) : [];
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        result.push({
          label,
          date: dateStr,
          skillsCompleted: active.length,
          studySessions: active.length > 0 ? 1 : 0,
          timeSpentMinutes: active.reduce((acc, e) => acc + (e.timeSpentMinutes || 0), 0),
          problemsSolved: active.reduce((acc, e) => acc + (e.problemsSolved || 0), 0)
        });
      }
    } else if (period === 'weekly') {
      // Last 8 weeks
      for (let w = 7; w >= 0; w--) {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (w * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);

        let skills = 0;
        let sessions = 0;
        let time = 0;
        let problems = 0;

        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          const dStr = d.toISOString().split("T")[0];
          const log = this.dailyLogs[dStr];
          const active = log ? Object.values(log.entries).filter(e => e.completed) : [];
          if (active.length > 0) {
            sessions += 1;
            skills += active.length;
            time += active.reduce((acc, e) => acc + (e.timeSpentMinutes || 0), 0);
            problems += active.reduce((acc, e) => acc + (e.problemsSolved || 0), 0);
          }
        }

        result.push({
          label: `Wk ${8 - w}`,
          date: weekStart.toISOString().split("T")[0],
          skillsCompleted: skills,
          studySessions: sessions,
          timeSpentMinutes: time,
          problemsSolved: problems
        });
      }
    } else if (period === 'monthly') {
      // Last 6 months
      for (let m = 5; m >= 0; m--) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const y = targetDate.getFullYear();
        const monthNum = targetDate.getMonth();
        const monthLabel = targetDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

        let skills = 0;
        let sessions = 0;
        let time = 0;
        let problems = 0;

        Object.values(this.dailyLogs).forEach(log => {
          const logDate = new Date(log.date + "T00:00:00");
          if (logDate.getFullYear() === y && logDate.getMonth() === monthNum) {
            const active = Object.values(log.entries).filter(e => e.completed);
            if (active.length > 0) {
              sessions += 1;
              skills += active.length;
              time += active.reduce((acc, e) => acc + (e.timeSpentMinutes || 0), 0);
              problems += active.reduce((acc, e) => acc + (e.problemsSolved || 0), 0);
            }
          }
        });

        result.push({
          label: monthLabel,
          date: `${y}-${String(monthNum + 1).padStart(2, '0')}`,
          skillsCompleted: skills,
          studySessions: sessions,
          timeSpentMinutes: time,
          problemsSolved: problems
        });
      }
    }

    return result;
  }

  public exportBackup(): string {
    return JSON.stringify({
      categories: this.categories,
      dailyLogs: this.dailyLogs,
      profile: this.profile,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  public importBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.categories && data.dailyLogs) {
        this.categories = data.categories;
        this.dailyLogs = data.dailyLogs;
        this.saveCategories();
        this.saveDailyLogs();
        this.recalculateStreaksAndXP();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to import backup:", e);
      return false;
    }
  }

  private saveCategories() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
  }

  private saveDailyLogs() {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(this.dailyLogs));
  }
}
