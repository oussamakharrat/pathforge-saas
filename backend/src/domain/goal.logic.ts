import { GoalStatus } from '@prisma/client';
import type { Milestone } from './types';

export function recalculateGoalProgress(
  milestones: Milestone[],
  currentStatus: GoalStatus,
): { progress: number; status: GoalStatus; completedAt: Date | null } {
  const total = milestones.length;
  const done = milestones.filter((m) => m.completed).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  let status = currentStatus;
  if (progress >= 100) {
    status = GoalStatus.completed;
  } else if (currentStatus === GoalStatus.not_started && done > 0) {
    status = GoalStatus.in_progress;
  }

  return {
    progress,
    status,
    completedAt: progress >= 100 ? new Date() : null,
  };
}

export function parseMilestones(raw: unknown): Milestone[] {
  if (!Array.isArray(raw)) return [];
  return raw as Milestone[];
}
