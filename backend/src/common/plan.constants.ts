import { Plan } from '@prisma/client';

export type PlanTier = Plan;

export const PLAN_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

export type PlanQuota = 'aiMessages' | 'resumes' | 'jobApplications';

export const PLAN_LIMITS: Record<
  PlanTier,
  Record<PlanQuota, number>
> = {
  free: {
    aiMessages: 5,
    resumes: 1,
    jobApplications: 10,
  },
  pro: {
    aiMessages: Number.MAX_SAFE_INTEGER,
    resumes: Number.MAX_SAFE_INTEGER,
    jobApplications: Number.MAX_SAFE_INTEGER,
  },
  premium: {
    aiMessages: Number.MAX_SAFE_INTEGER,
    resumes: Number.MAX_SAFE_INTEGER,
    jobApplications: Number.MAX_SAFE_INTEGER,
  },
};

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

export function planMeetsMin(current: PlanTier, required: PlanTier): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}
