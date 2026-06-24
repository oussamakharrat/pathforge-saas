/**
 * Skill — A technical or professional competency.
 *
 * Skills are the central connective tissue of the domain:
 *  - Required by Goals (via goal_skills junction)
 *  - Improved by LearningPlans (via learning_plan_skills junction)
 *  - Validated by PortfolioProjects (via portfolio_project_skills junction)
 *  - Required by Jobs (via job_skills junction)
 *  - Listed on Resumes (via resume_skills junction)
 *
 * Design: Skill is a shared entity referenced by many aggregates.
 * The current level is per-user and stored in a user_skills table
 * rather than on the Skill entity itself, because skills are
 * reference data (many users have the same skill at different levels).
 *
 * However, for simplicity in this model, Skill represents the
 * user's relationship with a skill (user-specific level data).
 * In production, a SkillDefinition reference table would sit alongside.
 */

import type { SkillCategory, DemandLevel, VerificationStatus } from "../value-objects";

export interface Skill {
  /** Primary key (user-specific skill record) */
  id: string;

  /** Reference to a SkillDefinition in production */
  name: string;
  category: SkillCategory;

  /** User's current proficiency (0–100) */
  currentLevel: number;

  /** User's target proficiency (0–100) */
  targetLevel: number;

  /** Market demand level */
  marketDemand: DemandLevel;

  /** How this level was verified */
  verificationStatus: VerificationStatus;

  /** Last assessment date */
  lastAssessed: string;
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
