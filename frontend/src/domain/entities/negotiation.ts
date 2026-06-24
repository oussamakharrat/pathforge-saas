/**
 * Salary Negotiation — Negotiation after an offer is received.
 *
 * Relationships:
 *  Interview → Offer
 *  Offer → Negotiation
 *  Negotiation → Career Progression
 */

import type { NegotiationStatus } from "../value-objects";

export interface Negotiation {
  id: string;
  interviewId: string;
  company: string;
  role: string;
  offeredSalary: number;
  targetSalary: number;
  finalSalary?: number;
  status: NegotiationStatus;

  /** AI-generated negotiation strategy */
  strategy: string;

  /** Key talking points */
  talkingPoints: string[];

  /** Counter-offer timeline */
  timeline: string;

  /** When the negotiation was initiated */
  createdAt: string;

  /** When the negotiation concluded */
  completedAt?: string;
}

// ── Factory ──

export function createNegotiation(overrides?: Partial<Negotiation>): Negotiation {
  return {
    id: crypto.randomUUID?.() ?? `neg-${Date.now()}`,
    interviewId: "",
    company: "",
    role: "",
    offeredSalary: 0,
    targetSalary: 0,
    status: "pending",
    strategy: "",
    talkingPoints: [],
    timeline: "",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Helpers ──

export function calculateSalaryImprovement(negotiation: Negotiation): number {
  if (!negotiation.finalSalary) return 0;
  return negotiation.finalSalary - negotiation.offeredSalary;
}

export function calculateSalaryImprovementPercent(negotiation: Negotiation): number {
  if (negotiation.offeredSalary === 0) return 0;
  const improvement = calculateSalaryImprovement(negotiation);
  return Math.round((improvement / negotiation.offeredSalary) * 100);
}
