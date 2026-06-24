/**
 * User — The root aggregate of the PathForge domain.
 *
 * A User owns ALL entities in the system.
 * Every other entity belongs directly or indirectly to a user.
 *
 * The User aggregate enforces consistency across entities:
 *  - When a Skill improves → Career Profile updates
 *  - When a Goal completes → Career Score recalculates
 *  - When an Application moves → related entities update
 */

import type { CareerProfile } from "./career-profile";
import type { Goal } from "./goal";
import type { Skill } from "./skill";
import type { LearningPlan } from "./learning-plan";
import type { Resume } from "./resume";
import type { JobApplication } from "./job-application";
import type { Interview } from "./interview";
import type { Negotiation } from "./negotiation";
import type { Portfolio } from "./portfolio";
import type { Achievement } from "./achievement";
import type { Badge } from "./badge";
import type { ServicePurchase } from "./service-purchase";
import type { AnalyticsSnapshot } from "./analytics";
import type { Plan } from "../value-objects";

export interface User {
  id: string;

  /** Subscription plan */
  plan: Plan;

  /** Core profile */
  profile: CareerProfile;

  /** Career objectives */
  goals: Goal[];

  /** Technical & professional competencies */
  skills: Skill[];

  /** Structured learning paths */
  learningPlans: LearningPlan[];

  /** Resume versions */
  resumes: Resume[];

  /** Job applications (Kanban) */
  applications: JobApplication[];

  /** Interview sessions (real + mock) */
  interviews: Interview[];

  /** Salary negotiations */
  negotiations: Negotiation[];

  /** Portfolio projects */
  portfolio: Portfolio[];

  /** Unlocked achievements */
  achievements: Achievement[];

  /** Earned badges */
  badges: Badge[];

  /** Purchased services */
  services: ServicePurchase[];

  /** Historical metric snapshots */
  analytics: AnalyticsSnapshot[];

  /** When the account was created */
  createdAt: string;

  /** Last login date */
  lastLoginAt: string;

  /** Consecutive day streak */
  streakDays: number;
}

// ── Factory ──

export function createUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID?.() ?? `user-${Date.now()}`,
    plan: "free",
    profile: {
      id: crypto.randomUUID?.() ?? `profile-${Date.now()}`,
      displayName: "",
      email: "",
      currentRole: "",
      targetRole: "",
      experienceLevel: "1-3",
      educationLevel: "bachelor",
      careerScore: 0,
      resumeScore: 0,
      interviewScore: 0,
      portfolioScore: 0,
      skillCoverage: 0,
      jobMatchRate: 0,
      goalProgress: 0,
      lastCalculatedAt: new Date().toISOString(),
      onboardingComplete: false,
    },
    goals: [],
    skills: [],
    learningPlans: [],
    resumes: [],
    applications: [],
    interviews: [],
    negotiations: [],
    portfolio: [],
    achievements: [],
    badges: [],
    services: [],
    analytics: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    streakDays: 0,
    ...overrides,
  };
}
