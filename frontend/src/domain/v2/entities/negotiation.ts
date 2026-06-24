/**
 * Negotiation — A salary negotiation for a received offer.
 *
 * Depends on an Offer being present. The negotiation tracks
 * the strategy, timeline, and outcome of salary discussions.
 *
 * Relationships:
 *  - Belongs to an Offer (foreign key)
 *
 * Aggregate root: YES — independent lifecycle.
 */

import type { NegotiationStatus, Money } from "../value-objects";

export interface Negotiation {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Reference to the offer being negotiated */
  offerId: string;

  /** Company and role context */
  company: string;
  role: string;

  /** Financial details */
  offeredSalary: Money;
  targetSalary: Money;
  finalSalary?: Money;

  /** Status */
  status: NegotiationStatus;

  /** AI-generated strategy */
  strategy: string;

  /** Key talking points */
  talkingPoints: string[];

  /** Counter-offer timeline */
  timeline: string;

  /** Timestamps */
  createdAt: string;
  completedAt?: string;
}

// ── Factory ──

export function createNegotiation(userId: string, offerId: string, offeredSalary: Money, overrides?: Partial<Negotiation>): Negotiation {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `neg-${Date.now()}`,
    userId,
    offerId,
    company: "",
    role: "",
    offeredSalary,
    targetSalary: offeredSalary,
    status: "pending",
    strategy: "",
    talkingPoints: [],
    timeline: "",
    createdAt: now,
    ...overrides,
  };
}

// ── Helpers ──

export function calculateSalaryImprovement(negotiation: Negotiation): number {
  if (!negotiation.finalSalary) return 0;
  return negotiation.finalSalary.amount - negotiation.offeredSalary.amount;
}

export function calculateSalaryImprovementPercent(negotiation: Negotiation): number {
  if (negotiation.offeredSalary.amount === 0) return 0;
  const improvement = calculateSalaryImprovement(negotiation);
  return Math.round((improvement / negotiation.offeredSalary.amount) * 100);
}
