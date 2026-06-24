/**
 * Subscription — The user's billing and plan relationship.
 *
 * Replaces the simple Plan enum with a real subscription model.
 * Designed for future Stripe integration:
 *  - stripeCustomerId and stripeSubscriptionId are nullable
 *    (present only after Stripe integration)
 *  - Billing state, renewal dates, and status are first-class
 *
 * Feature access should be derived from the plan tier, not stored here.
 * Use a FeatureFlag service or PLAN_FEATURES map for that.
 *
 * Aggregate root: YES — has its own lifecycle independent of User.
 * Separating Subscription from User allows:
 *  - Subscription to be managed by a billing bounded context
 *  - User identity to remain stable across plan changes
 *  - Audit trail of plan changes
 */

import type { Plan, BillingCycle, SubscriptionStatus } from "../value-objects";

export interface Subscription {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Current plan tier */
  plan: Plan;

  /** Billing state */
  status: SubscriptionStatus;
  billingCycle: BillingCycle;

  /** Stripe integration (nullable until integrated) */
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  /** Dates */
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  canceledAt?: string;

  /** Price (for display/reference) */
  price: number;             // in cents (e.g. 999 = $9.99)
  currency: string;          // ISO 4217

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createSubscription(userId: string, overrides?: Partial<Subscription>): Subscription {
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 days
  return {
    id: crypto.randomUUID?.() ?? `sub-${Date.now()}`,
    userId,
    plan: "free",
    status: "active",
    billingCycle: "monthly",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    price: 0,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
