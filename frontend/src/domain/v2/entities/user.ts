/**
 * User — Root aggregate of the PathForge domain.
 *
 * The User is the top-level identity boundary. It owns:
 *  - A CareerProfile (1:1 identity)
 *  - A Subscription (1:1 billing)
 *  - All child aggregates (goals, applications, etc.)
 *
 * IMPORTANT: The User does NOT directly own entity arrays.
 * Each child aggregate has its own repository and lifecycle.
 * The User only holds ID references to them.
 *
 * Design rationale:
 *  - Avoids the God aggregate anti-pattern
 *  - Enables independent loading/persistence per aggregate
 *  - Follows DDD recommendation: keep aggregates small
 *  - Allows horizontal scaling via separate repositories
 */

import type { Plan } from "../value-objects";

export interface User {
  /** Primary key */
  id: string;

  /** Authentication (auth provider subject or internal identity) */
  authProviderId: string;       // e.g. Firebase UID, Auth0 sub
  email: string;
  displayName: string;

  /** Current subscription plan */
  plan: Plan;

  /** When the account was created */
  createdAt: string;

  /** Last login timestamp */
  lastLoginAt: string;

  /** Consecutive day streak */
  streakDays: number;

  /** Consecutive day streak history */
  longestStreak: number;

  /** Soft delete flag */
  isActive: boolean;
}

// ── Factory ──

export function createUser(overrides?: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `user-${Date.now()}`,
    authProviderId: "",
    email: "",
    displayName: "",
    plan: "free",
    createdAt: now,
    lastLoginAt: now,
    streakDays: 0,
    longestStreak: 0,
    isActive: true,
    ...overrides,
  };
}
