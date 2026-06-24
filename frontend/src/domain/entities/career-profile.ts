/**
 * Career Profile — The user's professional identity.
 *
 * This is a derived entity: most values are computed from
 * related entities (skills, goals, applications, etc.).
 * Never store duplicated data here.
 */

import type { ExperienceLevel, EducationLevel } from "../value-objects";

export interface CareerProfile {
  /** Unique identifier */
  id: string;

  /** Personal info */
  displayName: string;
  email: string;
  avatarUrl?: string;

  /** Professional info */
  currentRole: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  bio?: string;
  location?: string;

  // ── Derived Metrics (computed by CareerProgressionService) ──

  /** Overall career health (0–100) */
  careerScore: number;

  /** Resume strength score (0–100) */
  resumeScore: number;

  /** Interview readiness score (0–100) */
  interviewScore: number;

  /** Portfolio strength score (0–100) */
  portfolioScore: number;

  /** Average skill level across all skills (0–100) */
  skillCoverage: number;

  /** How well skills match target roles (0–100) */
  jobMatchRate: number;

  /** Average goal progress (0–100) */
  goalProgress: number;

  /** Last time the profile was recalculated */
  lastCalculatedAt: string;

  /** Onboarding flag */
  onboardingComplete: boolean;
}

// ── Factory ──

export function createCareerProfile(overrides?: Partial<CareerProfile>): CareerProfile {
  return {
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
    ...overrides,
  };
}
