// ──────────────────────────────────────
// TYPES — Legacy & Domain-Backed
// ──────────────────────────────────────
// This file maintains backward compatibility while the codebase
// transitions to the domain model in src/domain/.
// New code should import from src/domain/ directly.

import type { Plan as DomainPlan } from "@/domain/value-objects";

export type Page =
  | "landing" | "login" | "register"
  | "dashboard" | "goals" | "skills" | "resume"
  | "learning" | "tracker" | "coach" | "interview"
  | "negotiate" | "services" | "pricing" | "settings"
  | "portfolio" | "achievements" | "community" | "analytics" | "help";

export type Plan = DomainPlan;

/** RBAC: plan hierarchy — higher index = more access */
export const PLAN_HIERARCHY: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

/** RBAC: minimum plan required per page */
export const PAGE_ACCESS: Record<string, Plan> = {
  dashboard: "free",
  goals: "free",
  skills: "free",
  settings: "free",
  resume: "pro",
  learning: "pro",
  tracker: "pro",
  coach: "pro",
  interview: "premium",
  negotiate: "premium",
  services: "pro",
};

/** Display info for each plan tier — used for lock indicators */
export const PLAN_META: Record<Plan, { label: string; color: string; bg: string; ring: string }> = {
  free:    { label: "Free",    color: "#6B7280", bg: "rgba(107,114,128,0.1)",  ring: "rgba(107,114,128,0.3)" },
  pro:     { label: "Pro",     color: "#F59E0B", bg: "rgba(245,158,11,0.12)", ring: "rgba(245,158,11,0.3)" },
  premium: { label: "Premium", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", ring: "rgba(139,92,246,0.3)" },
};

/** Get the plan meta for the tier required by a page */
export function requiredPlanMeta(page: string) {
  const required = PAGE_ACCESS[page];
  if (!required || required === "free") return null;
  return PLAN_META[required];
}

/** Check if a plan can access a given page */
export function canAccessPage(plan: Plan, page: string): boolean {
  const required = PAGE_ACCESS[page];
  if (!required) return true; // unknown page → allow
  return PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[required];
}

export type KanbanCol = "saved" | "applied" | "screening" | "interview" | "final" | "offer" | "rejected";

export type KanbanCard = {
  id: string;
  company: string;
  role: string;
  salary: string;
  date: string;
  match: number;
  notes: string;
  logo: string;
};

export type Goal = {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  steps: number;
  done: number;
};

export type Skill = {
  name: string;
  level: string;
  pct: number;
  cat: string;
};

export type LearningStep = {
  id: number;
  title: string;
  done: boolean;
  range: string;
  tag: string;
  active?: boolean;
};

export type Message = {
  role: "ai" | "user";
  content: string;
  id: string;
  timestamp: Date;
};

export type Conversation = {
  id: string;
  title: string;
  date: string;
  preview: string;
};

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
};

export type QuizResult = {
  skillName: string;
  correct: number;
  total: number;
  pct: number;
  date: string;
};

export type OutcomeMetrics = {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  interviewsCompleted: number;
  negotiationsCompleted: number;
};

export type UserProfile = {
  name: string;
  email: string;
  targetRole: string;
  experienceLevel: "0-1" | "1-3" | "3-5" | "5-10" | "10+";
  educationLevel: "high-school" | "associate" | "bachelor" | "master" | "phd" | "bootcamp";
  referralSource: "social-media" | "google" | "friend" | "podcast" | "blog" | "other";
  biggestChallenges: string[];
  onboardingComplete: boolean;
};

export type KanbanData = Record<KanbanCol, KanbanCard[]>;

// ── Notification Types ──

export type NotificationType =
  | "goal_created"
  | "goal_completed"
  | "step_completed"
  | "skill_improved"
  | "service_purchased"
  | "badge_earned"
  | "quiz_completed"
  | "application_tracked"
  | "interview_tracked"
  | "offer_received"
  | "milestone_reached"
  | "mission_completed";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  icon?: string;
}

// ── Badge / Mission Types ──

export type BadgeRarity = "bronze" | "silver" | "gold" | "platinum";

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  rarity: BadgeRarity;
  category: "learning" | "skills" | "jobs" | "social" | "streak" | "growth";
  requirement: (data: MissionCheckData) => boolean;
  progress: (data: MissionCheckData) => { current: number; target: number };
}

export interface MissionCheckData {
  goals: Goal[];
  skills: Skill[];
  learningSteps: LearningStep[];
  outcomes: OutcomeMetrics;
  quizResults: QuizResult[];
  streakDays: number;
  purchasedServices: string[];
}

export interface EarnedBadge {
  missionId: string;
  earnedAt: string;
}

// ── Career Engine Types ──

export interface Recommendation {
  id: string;
  type: "learning" | "skill" | "resume" | "career" | "goal" | "market";
  priority: number; // 1 = highest
  title: string;
  reason: string;
  expectedOutcome: string;
  impact: {
    careerScore: number;
    jobsUnlocked: number;
    skillBoost: number;
  };
  actionLabel: string;
  actionPath: string;
}

export interface NextMove {
  id: string;
  what: string;
  why: string;
  outcome: string;
  unlocks: string;
  impact: number; // career score impact
  actionLabel: string;
  actionPath: string;
}

export interface TimelineEvent {
  id: string;
  type: "learning" | "goal" | "skill" | "offer" | "interview" | "application" | "milestone" | "service";
  title: string;
  description: string;
  date: string;
  icon: string;
  category: string;
}

export interface JobMatchDetail {
  matchScore: number;
  matchingSkills: { name: string; pct: number }[];
  missingSkills: { name: string; demandPct: number }[];
  salaryRange: { min: number; max: number };
  estimatedImprovement: number;
  suggestion: string;
}

export interface RelationshipLink {
  from: string;
  fromType: "skill" | "goal" | "learning" | "resume" | "interview" | "application";
  to: string;
  toType: "skill" | "goal" | "job" | "score" | "interview" | "offer";
  effect: "improves" | "unlocks" | "affects" | "determines";
  magnitude: number;
  description: string;
}
