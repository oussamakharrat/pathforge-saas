/**
 * CareerProfile — The user's professional identity and preferences.
 *
 * This entity holds INTENT data (what the user wants), not
 * computed analytics. Scores and metrics belong in CareerMetrics (DTO).
 *
 * Separated from User to allow:
 *  - Different update cadence (profile updates vs auth changes)
 *  - Independent validation rules
 *  - Clearer ownership boundaries
 */

import type { ExperienceLevel, EducationLevel } from "../value-objects";

export interface CareerProfile {
  /** Primary key (same as User.id for 1:1) */
  userId: string;

  /** Professional identity */
  currentRole: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  bio: string;
  location: string;
  avatarUrl: string;

  /** URLs (portfolio, LinkedIn, GitHub, personal site) */
  portfolioUrl: string;
  linkedInUrl: string;
  githubUrl: string;
  personalSiteUrl: string;

  /** Career preferences */
  preferredIndustries: string[];    // e.g. ["FinTech", "HealthTech"]
  preferredWorkModels: string[];     // e.g. ["Remote", "Hybrid", "On-site"]
  preferredSalaryRange: string;      // e.g. "$120k–$180k"
  openToRelocation: boolean;
  openToContract: boolean;

  /** Career objectives (free-form) */
  shortTermObjective: string;       // 6–12 months
  longTermObjective: string;        // 3–5 years

  /** Onboarding completion */
  onboardingComplete: boolean;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createCareerProfile(userId: string, overrides?: Partial<CareerProfile>): CareerProfile {
  const now = new Date().toISOString();
  return {
    userId,
    currentRole: "",
    targetRole: "",
    experienceLevel: "1-3",
    educationLevel: "bachelor",
    bio: "",
    location: "",
    avatarUrl: "",
    portfolioUrl: "",
    linkedInUrl: "",
    githubUrl: "",
    personalSiteUrl: "",
    preferredIndustries: [],
    preferredWorkModels: [],
    preferredSalaryRange: "",
    openToRelocation: false,
    openToContract: false,
    shortTermObjective: "",
    longTermObjective: "",
    onboardingComplete: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
