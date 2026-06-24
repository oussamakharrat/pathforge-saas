/**
 * Offer — A job offer received by the user.
 *
 * Separated from Negotiation as its own aggregate because:
 *  - An offer may exist without a negotiation
 *  - Multiple offers can be compared side-by-side
 *  - Offer data is needed for analytics regardless of negotiation outcome
 *
 * Relationships:
 *  - Belongs to an Application
 *  - May lead to a Negotiation (one-to-one)
 *
 * Aggregate root: YES — independent lifecycle.
 */

import type { OfferStatus, Money } from "../value-objects";

export interface Offer {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Reference to the application that produced this offer */
  applicationId: string;

  /** Company and role context */
  company: string;
  role: string;

  /** Compensation details */
  baseSalary: Money;
  equity: string;           // e.g. "0.05%", "$50k RSUs"
  bonus: string;            // e.g. "10% annual", "$10k signing"
  benefits: string[];       // e.g. ["Health", "401k match", "Unlimited PTO"]

  /** Offer details */
  status: OfferStatus;
  receivedDate: string;
  decisionDeadline: string;

  /** User's notes */
  notes: string;

  /** Reference to negotiation if one was started */
  negotiationId?: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createOffer(userId: string, applicationId: string, overrides?: Partial<Offer>): Offer {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `offer-${Date.now()}`,
    userId,
    applicationId,
    company: "",
    role: "",
    baseSalary: { amount: 0, currency: "USD" },
    equity: "",
    bonus: "",
    benefits: [],
    status: "pending",
    receivedDate: now,
    decisionDeadline: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
