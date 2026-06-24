/**
 * Badge — A recognition mechanism.
 *
 * Badges are derived from achievements and displayed on
 * the user's profile and in the community.
 *
 * Relationships:
 *  Badge → derived from Achievements
 *  Badge → displayed in Profile
 *  Badge → displayed in Community
 */

import type { BadgeRarity } from "../value-objects";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  rarity: BadgeRarity;
  category: string;

  /** Human-readable requirements */
  requirements: string;

  /** Current progress toward earning (0–100) */
  progress: number;

  /** When it was earned (undefined if not yet earned) */
  earnedAt?: string;

  /** Whether the user has seen this badge notification */
  seen: boolean;
}

// ── Factory ──

export function createBadge(overrides?: Partial<Badge>): Badge {
  return {
    id: crypto.randomUUID?.() ?? `badge-${Date.now()}`,
    name: "",
    description: "",
    icon: "🏅",
    rarity: "bronze",
    category: "growth",
    requirements: "",
    progress: 0,
    seen: false,
    ...overrides,
  };
}

// ── Badge Definitions ──

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: string;
  requirements: string;
  check: (data: BadgeCheckData) => boolean;
  progress: (data: BadgeCheckData) => { current: number; target: number };
}

export interface BadgeCheckData {
  goalsCompleted: number;
  skillsAtAdvanced: number;
  learningItemsDone: number;
  totalLearningItems: number;
  quizzesWithPerfect: number;
  quizzesHighScore: number;
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  negotiationsCompleted: number;
  streakDays: number;
  categoriesCovered: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Learning ──
  {
    id: "first-step",
    name: "First Step",
    description: "Complete your first learning step",
    icon: "📘",
    rarity: "bronze",
    category: "learning",
    requirements: "Complete one learning item",
    check: (d) => d.learningItemsDone >= 1,
    progress: (d) => ({ current: Math.min(d.learningItemsDone, 1), target: 1 }),
  },
  {
    id: "halfway-there",
    name: "Halfway There",
    description: "Complete 50% of your learning plan",
    icon: "📚",
    rarity: "silver",
    category: "learning",
    requirements: "Complete half of all learning items",
    check: (d) => d.totalLearningItems > 0 && d.learningItemsDone / d.totalLearningItems >= 0.5,
    progress: (d) => ({
      current: Math.min(d.learningItemsDone, Math.ceil(d.totalLearningItems * 0.5)),
      target: Math.max(Math.ceil(d.totalLearningItems * 0.5), 1),
    }),
  },
  {
    id: "learning-complete",
    name: "Knowledge Seeker",
    description: "Complete all learning steps in your plan",
    icon: "🎓",
    rarity: "gold",
    category: "learning",
    requirements: "Finish all learning items",
    check: (d) => d.totalLearningItems > 0 && d.learningItemsDone >= d.totalLearningItems,
    progress: (d) => ({ current: d.learningItemsDone, target: d.totalLearningItems }),
  },
  {
    id: "quiz-ace",
    name: "Quiz Ace",
    description: "Score 100% on any skill quiz",
    icon: "💯",
    rarity: "silver",
    category: "learning",
    requirements: "Get a perfect quiz score",
    check: (d) => d.quizzesWithPerfect >= 1,
    progress: (d) => ({ current: Math.min(d.quizzesWithPerfect, 1), target: 1 }),
  },
  // ── Skills ──
  {
    id: "skill-collector",
    name: "Skill Collector",
    description: "Add 5 skills to your profile",
    icon: "🔧",
    rarity: "bronze",
    category: "skills",
    requirements: "Have at least 5 skills",
    check: (d) => d.skillsAtAdvanced >= 5,
    progress: (d) => ({ current: Math.min(d.skillsAtAdvanced, 5), target: 5 }),
  },
  {
    id: "advanced-master",
    name: "Advanced Master",
    description: "Reach Advanced level in 3 skills",
    icon: "⭐",
    rarity: "gold",
    category: "skills",
    requirements: "Have 3 skills at Advanced level",
    check: (d) => d.skillsAtAdvanced >= 3,
    progress: (d) => ({ current: Math.min(d.skillsAtAdvanced, 3), target: 3 }),
  },
  // ── Jobs ──
  {
    id: "first-application",
    name: "Foot in the Door",
    description: "Track your first job application",
    icon: "📋",
    rarity: "bronze",
    category: "jobs",
    requirements: "Submit your first application",
    check: (d) => d.totalApplications >= 1,
    progress: (d) => ({ current: Math.min(d.totalApplications, 1), target: 1 }),
  },
  {
    id: "interview-ready",
    name: "Interview Ready",
    description: "Get your first interview",
    icon: "🤝",
    rarity: "silver",
    category: "jobs",
    requirements: "Secure your first interview",
    check: (d) => d.totalInterviews >= 1,
    progress: (d) => ({ current: Math.min(d.totalInterviews, 1), target: 1 }),
  },
  {
    id: "offer-secured",
    name: "Offer Secured",
    description: "Receive your first job offer",
    icon: "💼",
    rarity: "gold",
    category: "jobs",
    requirements: "Get your first offer",
    check: (d) => d.totalOffers >= 1,
    progress: (d) => ({ current: Math.min(d.totalOffers, 1), target: 1 }),
  },
  {
    id: "serial-negotiator",
    name: "Serial Negotiator",
    description: "Complete 3 salary negotiations",
    icon: "💎",
    rarity: "platinum",
    category: "jobs",
    requirements: "Finish 3 negotiations",
    check: (d) => d.negotiationsCompleted >= 3,
    progress: (d) => ({ current: Math.min(d.negotiationsCompleted, 3), target: 3 }),
  },
  // ── Streak ──
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Log in for 3 consecutive days",
    icon: "🔥",
    rarity: "bronze",
    category: "streak",
    requirements: "3-day streak",
    check: (d) => d.streakDays >= 3,
    progress: (d) => ({ current: Math.min(d.streakDays, 3), target: 3 }),
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Log in for 7 consecutive days",
    icon: "🔥",
    rarity: "silver",
    category: "streak",
    requirements: "7-day streak",
    check: (d) => d.streakDays >= 7,
    progress: (d) => ({ current: Math.min(d.streakDays, 7), target: 7 }),
  },
  {
    id: "streak-30",
    name: "Monthly Champion",
    description: "Log in for 30 consecutive days",
    icon: "🔥",
    rarity: "platinum",
    category: "streak",
    requirements: "30-day streak",
    check: (d) => d.streakDays >= 30,
    progress: (d) => ({ current: Math.min(d.streakDays, 30), target: 30 }),
  },
];
