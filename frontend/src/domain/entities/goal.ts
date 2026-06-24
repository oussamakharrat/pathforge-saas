/**
 * Goal — A career objective the user wants to achieve.
 *
 * A Goal owns:
 *  - Milestones (sub-steps)
 *  - Learning Plans (auto-generated)
 *  - Required Skills
 *
 * Relationships:
 *  Goal → generates Learning Plans
 *  Goal → requires Skills
 *  Goal → contributes to Career Score
 *  Goal → determines Career Path progression
 */

import type { GoalStatus } from "../value-objects";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  order: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: GoalStatus;

  /** Ordered list of milestones making up this goal */
  milestones: Milestone[];

  /** Skills that must be improved to achieve this goal */
  requiredSkillIds: string[];

  /** IDs of Learning Plans generated for this goal */
  learningPlanIds: string[];

  /** Career path category (e.g. "Senior Full-Stack", "Staff Engineer") */
  careerPath: string;

  /** Computed: fraction of milestones completed (0–100) */
  progress: number;

  /** Computed: completed milestone count */
  completedMilestoneCount: number;

  /** Total milestone count */
  totalMilestoneCount: number;

  /** When the goal was created */
  createdAt: string;

  /** When the goal was completed (if status === "completed") */
  completedAt?: string;
}

// ── Factory ──

export function createGoal(overrides?: Partial<Goal>): Goal {
  const now = new Date().toISOString();
  const milestones: Milestone[] = [];
  return {
    id: crypto.randomUUID?.() ?? `goal-${Date.now()}`,
    title: "",
    description: "",
    targetDate: "",
    status: "not-started",
    milestones,
    requiredSkillIds: [],
    learningPlanIds: [],
    careerPath: "",
    progress: 0,
    completedMilestoneCount: 0,
    totalMilestoneCount: 0,
    createdAt: now,
    ...overrides,
  };
}

// ── Helpers ──

export function recalculateGoalProgress(goal: Goal): Goal {
  const total = goal.milestones.length;
  const done = goal.milestones.filter((m) => m.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const status: GoalStatus = progress >= 100 ? "completed" : goal.status === "not-started" && done > 0 ? "in-progress" : goal.status;

  return {
    ...goal,
    progress,
    completedMilestoneCount: done,
    totalMilestoneCount: total,
    status,
    completedAt: progress >= 100 && !goal.completedAt ? new Date().toISOString() : goal.completedAt,
  };
}

export function addMilestone(goal: Goal, title: string, description?: string): Goal {
  const maxOrder = goal.milestones.reduce((max, m) => Math.max(max, m.order), 0);
  const milestone: Milestone = {
    id: crypto.randomUUID?.() ?? `ms-${Date.now()}`,
    title,
    description,
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
      m.id === milestoneId ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined } : m,
    ),
  };
  return recalculateGoalProgress(updated);
}
