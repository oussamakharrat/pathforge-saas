/**
 * Skill — A technical or professional competency.
 *
 * Skills are central to the platform. Every skill has visible
 * consequences across the career ecosystem:
 *  → Career Score
 *  → Job Matching
 *  → Interview Readiness
 *  → Resume Quality
 *  → Career Path Progression
 *
 * Skills are improved through:
 *  - Learning Plans
 *  - Portfolio Projects
 *  - Certifications
 *  - Community Contributions
 */

import type { SkillCategory, DemandLevel, VerificationStatus } from "../value-objects";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;

  /** Self-assessed or verified level (0–100) */
  currentLevel: number;

  /** Where the user wants to be (0–100) */
  targetLevel: number;

  /** Market demand level (from MarketIntelligence) */
  marketDemand: DemandLevel;

  /** How this skill level was verified */
  verificationStatus: VerificationStatus;

  /** Last date this skill was assessed */
  lastAssessed: string;

  /** IDs of learning plans that target this skill */
  learningPlanIds: string[];

  /** IDs of portfolio projects that demonstrate this skill */
  portfolioIds: string[];

  /** IDs of goals that require this skill */
  goalIds: string[];
}

// ── Factory ──

export function createSkill(overrides?: Partial<Skill>): Skill {
  return {
    id: crypto.randomUUID?.() ?? `skill-${Date.now()}`,
    name: "",
    category: "Language",
    currentLevel: 25,
    targetLevel: 80,
    marketDemand: "medium",
    verificationStatus: "self-reported",
    lastAssessed: new Date().toISOString(),
    learningPlanIds: [],
    portfolioIds: [],
    goalIds: [],
    ...overrides,
  };
}

// ── Helpers ──

export function getSkillLevelLabel(pct: number): string {
  if (pct >= 80) return "Advanced";
  if (pct >= 55) return "Intermediate";
  return "Beginner";
}

export function improveSkill(skill: Skill, amount: number): Skill {
  const newLevel = Math.min(100, Math.max(0, skill.currentLevel + amount));
  return {
    ...skill,
    currentLevel: newLevel,
    lastAssessed: new Date().toISOString(),
    verificationStatus: newLevel >= 80 ? "quiz-verified" : skill.verificationStatus,
  };
}

/** List of known skill → job mappings for impact calculation */
export const SKILL_JOB_MAP: Record<string, string[]> = {
  TypeScript: ["Senior SWE", "Full-Stack Engineer", "Frontend Lead"],
  React: ["Senior SWE", "Frontend Lead", "Full-Stack Engineer"],
  Node: ["Senior SWE", "Backend Engineer", "Full-Stack Engineer"],
  Docker: ["Platform Engineer", "DevOps Lead", "Senior SWE"],
  Kubernetes: ["Staff Engineer", "Platform Engineer", "SRE"],
  "System Design": ["Staff Engineer", "Principal Engineer", "Tech Lead"],
  AWS: ["Cloud Architect", "DevOps Lead", "Senior SWE"],
  GraphQL: ["API Engineer", "Full-Stack Engineer", "Senior SWE"],
  PostgreSQL: ["Backend Engineer", "Data Engineer", "Senior SWE"],
  Python: ["Backend Engineer", "Data Engineer", "ML Engineer"],
  Go: ["Backend Engineer", "Platform Engineer", "DevOps Lead"],
  Testing: ["SDET", "QA Lead", "Senior SWE"],
  AI: ["ML Engineer", "AI Engineer", "Data Scientist"],
  Rust: ["Systems Engineer", "Blockchain Engineer", "Performance Engineer"],
};

/** Known skill → goal mappings */
export const SKILL_GOAL_MAP: Record<string, string[]> = {
  TypeScript: ["Senior Full-Stack Engineer"],
  React: ["Senior Full-Stack Engineer"],
  Docker: ["Senior Full-Stack Engineer", "Staff Engineering Role"],
  Kubernetes: ["Staff Engineering Role"],
  "System Design": ["Senior Full-Stack Engineer", "Staff Engineering Role"],
  AWS: ["Senior Full-Stack Engineer"],
  GraphQL: ["Senior Full-Stack Engineer"],
  PostgreSQL: ["Senior Full-Stack Engineer"],
};
