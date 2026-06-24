/**
 * LearningPlan — A structured plan to improve skills and reach goals.
 *
 * A LearningPlan belongs to a User and optionally targets a Goal.
 * It owns LearningItems (ordered steps within the plan).
 *
 * Relationships:
 *  - Many-to-many with Skill (via learning_plan_skills junction table)
 *  - Optional foreign key to Goal
 *
 * Aggregate root: YES — owns its LearningItems within the aggregate boundary.
 */

import type { PlanStatus } from "../value-objects";

export interface LearningItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  range: string;            // e.g. "Week 1–2"
  tag: string;              // e.g. "Video", "Reading", "Practice"
  order: number;
  skillBoostAmount: number; // percentage points per linked skill on completion
}

export interface LearningPlan {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Core fields */
  title: string;
  description: string;

  /** Optional: the goal this plan supports */
  goalId?: string;

  /** Ordered steps (within aggregate boundary) */
  items: LearningItem[];

  /** Computed: progress (0–100) */
  progress: number;

  /** Estimated duration (human-readable) */
  estimatedDuration: string;

  status: PlanStatus;

  /** Expected Career Score impact upon completion */
  expectedCareerImpact: number;

  /** Job roles/opportunities unlocked by completing this plan */
  opportunitiesUnlocked: string[];

  /** Timestamps */
  createdAt: string;
  completedAt?: string;
}

// ── Factory ──

export function createLearningPlan(userId: string, overrides?: Partial<LearningPlan>): LearningPlan {
  return {
    id: crypto.randomUUID?.() ?? `lp-${Date.now()}`,
    userId,
    title: "",
    description: "",
    items: [],
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

export function recalculatePlanProgress(plan: LearningPlan): LearningPlan {
  const total = plan.items.length;
  const done = plan.items.filter((i) => i.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const status: PlanStatus = progress >= 100 ? "completed" : plan.status;
  return {
    ...plan,
    progress,
    status,
    completedAt: progress >= 100 && !plan.completedAt ? new Date().toISOString() : plan.completedAt,
  };
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
  return recalculatePlanProgress(updated);
}
