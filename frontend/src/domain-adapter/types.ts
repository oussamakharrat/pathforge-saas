/**
 * Domain Adapter Types
 *
 * This file provides backward compatibility types that map
 * the new domain model to the existing UI code.
 * These types ensure existing pages continue to work.
 */

// ── Re-export domain types that match existing interfaces ──

export type {
  Goal,
  Skill,
  LearningPlan,
  LearningItem,
  JobApplication,
  Interview,
  InterviewAnswer,
  Negotiation,
  Portfolio,
  Achievement,
  Badge,
  Resume,
  CareerProfile,
  AnalyticsSnapshot,
  ServicePurchase,
} from "@/domain/entities";

export type {
  Plan,
  ApplicationStatus,
  InterviewType,
  InterviewStatus,
  NegotiationStatus,
  GoalStatus,
  SkillCategory,
  DemandLevel,
  BadgeRarity,
  ExperienceLevel,
  EducationLevel,
  NotificationType,
} from "@/domain/value-objects";

// ── Legacy types for backward compatibility ──

export type LegacySkill = {
  name: string;
  level: string;
  pct: number;
  cat: string;
};

export type LegacyGoal = {
  id: number;
  title: string;
  progress: number;
  deadline: string;
  steps: number;
  done: number;
};

export type LegacyLearningStep = {
  id: number;
  title: string;
  done: boolean;
  range: string;
  tag: string;
  active?: boolean;
};

export type LegacyKanbanCol = "saved" | "applied" | "screening" | "interview" | "final" | "offer" | "rejected";

export type LegacyKanbanCard = {
  id: string;
  company: string;
  role: string;
  salary: string;
  date: string;
  match: number;
  notes: string;
  logo: string;
};

export type LegacyKanbanData = Record<LegacyKanbanCol, LegacyKanbanCard[]>;

export type LegacyOutcomeMetrics = {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  interviewsCompleted: number;
  negotiationsCompleted: number;
};

export type LegacyQuizResult = {
  skillName: string;
  correct: number;
  total: number;
  pct: number;
  date: string;
};
