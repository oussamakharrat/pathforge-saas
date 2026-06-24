/**
 * Mappers — Entity relationship mappings.
 *
 * These maps define how legacy entities connect to each other.
 * For the full domain relationship graph, see:
 *  - src/domain/entities/skill.ts (SKILL_JOB_MAP, SKILL_GOAL_MAP)
 *  - src/domain/services/relationship-graph.service.ts
 */

// ── Legacy learning step → skill mappings ──
export const STEP_SKILL_MAP: Record<number, string> = {
  1: "TypeScript", 2: "System Design", 3: "Docker",
  4: "AWS", 5: "Kubernetes", 6: "GraphQL",
};

// ── Legacy learning step → goal mappings ──
export const STEP_GOAL_MAP: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 1, 7: 4, 8: 1,
};

// ── Legacy job match mappings ──
// Note: Domain equivalents live in SKILL_JOB_MAP in src/domain/entities/skill.ts
export const SKILL_JOBS_MAP: Record<string, string[]> = {
  TypeScript: ["Vercel", "Linear", "Figma"],
  Docker: ["Vercel", "Stripe", "Planetscale"],
  Kubernetes: ["Planetscale", "Stripe"],
  "System Design": ["Vercel", "Notion"],
  AWS: ["Stripe", "Planetscale"],
  GraphQL: ["Linear"],
  React: ["Vercel", "Figma", "Linear"],
};

// ── Legacy goal mappings ──
export const SKILL_GOAL_MAP: Record<string, string[]> = {
  TypeScript: ["Senior Full-Stack Engineer"],
  Docker: ["Senior Full-Stack Engineer", "Staff Engineering Role"],
  Kubernetes: ["Staff Engineering Role"],
  "System Design": ["Senior Full-Stack Engineer", "Staff Engineering Role"],
  AWS: ["Senior Full-Stack Engineer"],
  React: ["Senior Full-Stack Engineer"],
};
