/**
 * Analytics — Historical snapshots of career metrics.
 *
 * Purpose: Track progression over time.
 *
 * Used by:
 *  - Dashboard
 *  - Timeline
 *  - AI Coach
 */

export interface AnalyticsSnapshot {
  id: string;
  date: string;
  careerScore: number;
  resumeScore: number;
  skillAverage: number;
  jobMatchRate: number;
  interviewSuccessRate: number;
  goalProgress: number;
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
}

// ── Factory ──

export function createAnalyticsSnapshot(overrides?: Partial<AnalyticsSnapshot>): AnalyticsSnapshot {
  return {
    id: crypto.randomUUID?.() ?? `analytics-${Date.now()}`,
    date: new Date().toISOString(),
    careerScore: 0,
    resumeScore: 0,
    skillAverage: 0,
    jobMatchRate: 0,
    interviewSuccessRate: 0,
    goalProgress: 0,
    totalApplications: 0,
    totalInterviews: 0,
    totalOffers: 0,
    ...overrides,
  };
}

// ── Trend Analysis ──

export interface TrendDirection {
  metric: string;
  direction: "up" | "down" | "stable";
  change: number;
  percentage: number;
}

export function calculateTrend(snapshots: AnalyticsSnapshot[]): TrendDirection[] {
  if (snapshots.length < 2) return [];

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  const metrics: { label: string; current: number; previous: number }[] = [
    { label: "Career Score", current: latest.careerScore, previous: previous.careerScore },
    { label: "Resume Score", current: latest.resumeScore, previous: previous.resumeScore },
    { label: "Skill Average", current: latest.skillAverage, previous: previous.skillAverage },
    { label: "Job Match Rate", current: latest.jobMatchRate, previous: previous.jobMatchRate },
    { label: "Interview Success", current: latest.interviewSuccessRate, previous: previous.interviewSuccessRate },
  ];

  return metrics.map((m) => {
    const change = m.current - m.previous;
    const percentage = m.previous > 0 ? Math.round((change / m.previous) * 100) : 0;
    const direction: "up" | "down" | "stable" =
      change > 2 ? "up" : change < -2 ? "down" : "stable";
    return { metric: m.label, direction, change, percentage };
  });
}
