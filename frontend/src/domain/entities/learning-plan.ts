/**
 * Learning Plan — A structured plan to improve skills and progress goals.
 *
 * Every Learning Plan must expose:
 *  - Expected impact on Career Score
 *  - Skills improved
 *  - Opportunities unlocked
 *
 * Relationships:
 *  Learning Plan → improves Skills
 *  Learning Plan → progresses Goals
 *  Learning Plan → increases Career Score
 *  Learning Plan → unlocks Job Matches
 */

import type { PlanStatus } from "../value-objects";

export interface LearningItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  range: string; // e.g. "Week 1–2"
  tag: string;
  order: number;

  /** Skill IDs this item will improve */
  improvedSkillIds: string[];

  /** How much this item improves each skill when completed (percentage points) */
  skillBoostAmount: number;
}

export interface LearningPlan {
  id: string;
  title: string;
  description: string;

  /** The goal this plan is associated with */
  goalId?: string;

  /** Ordered learning items */
  items: LearningItem[];

  /** Skills that will be improved by completing this plan */
  improvedSkillIds: string[];

  /** Computed: fraction of items completed (0–100) */
  progress: number;

  /** Estimated total duration (human-readable) */
  estimatedDuration: string;

  status: PlanStatus;

  /** Expected Career Score impact upon completion */
  expectedCareerImpact: number;

  /** Job roles/opportunities unlocked by completing this plan */
  opportunitiesUnlocked: string[];

  /** When this plan was created */
  createdAt: string;
}

// ── Factory ──

export function createLearningPlan(overrides?: Partial<LearningPlan>): LearningPlan {
  return {
    id: crypto.randomUUID?.() ?? `lp-${Date.now()}`,
    title: "",
    description: "",
    items: [],
    improvedSkillIds: [],
    progress: 0,
    estimatedDuration: "",
    status: "active",
    expectedCareerImpact: 0,
    opportunitiesUnlocked: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Helpers ──

export function recalculateLearningPlanProgress(plan: LearningPlan): LearningPlan {
  const total = plan.items.length;
  const done = plan.items.filter((i) => i.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const status: PlanStatus = progress >= 100 ? "completed" : plan.status;
  return { ...plan, progress, status };
}

export function toggleLearningItem(plan: LearningPlan, itemId: string): LearningPlan {
  const updated = {
    ...plan,
    items: plan.items.map((item) =>
      item.id === itemId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
        : item,
    ),
  };
  return recalculateLearningPlanProgress(updated);
}

/** Generate placeholder learning items for a new goal */
export function generateLearningItemsForGoal(
  goalTitle: string,
  skillIds: string[],
  startOrder: number = 0,
): LearningItem[] {
  const phases = [
    "Foundation & Core Concepts",
    "Hands-on Practice",
    "Advanced Techniques",
    "Real-world Application",
    "Review & Polish",
  ];

  return phases.map((phase, i) => ({
    id: crypto.randomUUID?.() ?? `li-${Date.now()}-${i}`,
    title: `${goalTitle} — ${phase}`,
    completed: false,
    range: `Phase ${i + 1}`,
    tag: "Custom",
    order: startOrder + i,
    improvedSkillIds: skillIds,
    skillBoostAmount: 5,
  }));
}
