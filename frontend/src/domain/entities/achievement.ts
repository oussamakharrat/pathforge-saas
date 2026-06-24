/**
 * Achievement — A milestone the user has reached.
 *
 * Achievements represent non-trivial milestones:
 *  - First Interview
 *  - First Offer
 *  - 100 Applications
 *  - Senior Engineer Goal Complete
 *
 * Relationships:
 *  Achievements → increase Career Score
 *  Achievements → unlock Badges
 *  Achievements → appear in Timeline
 */

import type { AchievementCategory } from "../value-objects";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  category: AchievementCategory;

  /** When this was unlocked */
  unlockedAt: string;

  /** Human-readable criteria description */
  criteria: string;

  /** Whether the user has seen this achievement */
  seen: boolean;

  /** Badge IDs unlocked by this achievement */
  unlockedBadgeIds: string[];

  /** Career Score bonus from this achievement */
  scoreBonus: number;
}

// ── Factory ──

export function createAchievement(overrides?: Partial<Achievement>): Achievement {
  return {
    id: crypto.randomUUID?.() ?? `ach-${Date.now()}`,
    title: "",
    description: "",
    icon: "🏆",
    category: "growth",
    unlockedAt: new Date().toISOString(),
    criteria: "",
    seen: false,
    unlockedBadgeIds: [],
    scoreBonus: 0,
    ...overrides,
  };
}

// ── Known Achievement Definitions ──

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria: string;
  check: (data: AchievementCheckData) => boolean;
  scoreBonus: number;
}

export interface AchievementCheckData {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  goalsCompleted: number;
  skillsAtAdvanced: number;
  quizzesPassed: number;
  streakDays: number;
  negotiationsCompleted: number;
  portfolioProjects: number;
  communityPosts: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-application",
    title: "Foot in the Door",
    description: "Track your first job application",
    icon: "📋",
    category: "jobs",
    criteria: "Submit your first job application",
    check: (d) => d.totalApplications >= 1,
    scoreBonus: 2,
  },
  {
    id: "ten-applications",
    title: "Active Seeker",
    description: "Apply to 10 jobs",
    icon: "🎯",
    category: "jobs",
    criteria: "Submit 10 job applications",
    check: (d) => d.totalApplications >= 10,
    scoreBonus: 5,
  },
  {
    id: "first-interview",
    title: "Interview Ready",
    description: "Get your first interview",
    icon: "🤝",
    category: "jobs",
    criteria: "Secure your first interview",
    check: (d) => d.totalInterviews >= 1,
    scoreBonus: 5,
  },
  {
    id: "first-offer",
    title: "Offer Secured",
    description: "Receive your first job offer",
    icon: "💼",
    category: "jobs",
    criteria: "Get your first job offer",
    check: (d) => d.totalOffers >= 1,
    scoreBonus: 10,
  },
  {
    id: "goal-complete",
    title: "Goal Crusher",
    description: "Complete your first career goal",
    icon: "🎯",
    category: "growth",
    criteria: "Complete a career goal",
    check: (d) => d.goalsCompleted >= 1,
    scoreBonus: 8,
  },
  {
    id: "skill-advanced",
    title: "Skill Master",
    description: "Reach Advanced level in any skill",
    icon: "⭐",
    category: "skills",
    criteria: "Get a skill to Advanced level (80%+)",
    check: (d) => d.skillsAtAdvanced >= 1,
    scoreBonus: 3,
  },
  {
    id: "quiz-pass",
    title: "Knowledge Seeker",
    description: "Pass your first skill quiz",
    icon: "🧠",
    category: "learning",
    criteria: "Complete a skill quiz",
    check: (d) => d.quizzesPassed >= 1,
    scoreBonus: 2,
  },
  {
    id: "negotiation-complete",
    title: "Negotiator",
    description: "Complete your first salary negotiation",
    icon: "💎",
    category: "growth",
    criteria: "Complete a salary negotiation",
    check: (d) => d.negotiationsCompleted >= 1,
    scoreBonus: 10,
  },
  {
    id: "first-portfolio",
    title: "Builder",
    description: "Add your first portfolio project",
    icon: "🚀",
    category: "skills",
    criteria: "Add a portfolio project",
    check: (d) => d.portfolioProjects >= 1,
    scoreBonus: 3,
  },
];
