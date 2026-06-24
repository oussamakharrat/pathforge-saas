/**
 * Goal — A career objective the user wants to achieve.
 *
 * Goals own milestones and are linked to skills (through a
 * many-to-many relationship) and learning plans.
 *
 * Aggregate root: YES — Goal has its own lifecycle and
 * consistency boundary (milestones are within the aggregate).
 */

import type { GoalStatus } from "../value-objects";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface Goal {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Core fields */
  title: string;
  description: string;
  targetDate: string;
  status: GoalStatus;

  /** Career path category (e.g. "Senior Full-Stack", "Staff Engineer") */
  careerPath: string;

  /** Milestones owned by this Goal (within aggregate boundary) */
  milestones: Milestone[];

  /** Computed: progress percentage (0–100) */
  progress: number;

  /** Timestamps */
  createdAt: string;
  completedAt?: string;
}

// ── Factory ──

export function createGoal(userId: string, overrides?: Partial<Goal>): Goal {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `goal-${Date.now()}`,
    userId,
    title: "",
    description: "",
    targetDate: "",
    status: "not-started",
    careerPath: "",
    milestones: [],
    progress: 0,
    createdAt: now,
    ...overrides,
  };
}

// ── Helpers ──

export function recalculateGoalProgress(goal: Goal): Goal {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const status: GoalStatus =
    progress >= 100 ? "completed"
    : goal.status === "not-started" && done > 0 ? "in-progress"
    : goal.status;

  return {
    ...goal,
    progress,
    status,
    completedAt: progress >= 100 && !goal.completedAt ? new Date().toISOString() : goal.completedAt,
  };
}

export function addMilestone(goal: Goal, title: string, description?: string): Goal {
  const maxOrder = goal.milestones.reduce((max, m) => Math.max(max, m.order), 0);
  const milestone: Milestone = {
    id: crypto.randomUUID?.() ?? `ms-${Date.now()}`,
    title,
    description: description ?? "",
    completed: false,
    order: maxOrder + 1,
  };
  const updated = { ...goal, milestones: [...goal.milestones, milestone] };
  return recalculateGoalProgress(updated);
}

export function toggleMilestone(goal: Goal, milestoneId: string): Goal {
  const updated = {
    ...goal,
    milestones: goal.milestones.map((m) =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m,
    ),
  };
  return recalculateGoalProgress(updated);
}
