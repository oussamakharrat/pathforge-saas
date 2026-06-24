/**
 * Badge — A recognition badge earned by the user.
 *
 * Badges are derived from achievements and displayed on
 * profiles and in the community.
 *
 * Relationships:
 *  - Derived from Achievements
 *
 * Aggregate root: Depends on Achievement definitions (within the
 * gamification bounded context).
 */

import type { BadgeRarity } from "../value-objects";

export interface Badge {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Display */
  name: string;
  description: string;
  icon: string;            // emoji
  rarity: BadgeRarity;
  category: string;        // "learning" | "skills" | "jobs" | "streak" | "growth"

  /** Requirements and progress */
  requirements: string;
  progress: number;        // 0–100
  earnedAt?: string;
  seen: boolean;
}

// ── Factory ──

export function createBadge(userId: string, overrides?: Partial<Badge>): Badge {
  return {
    id: crypto.randomUUID?.() ?? `badge-${Date.now()}`,
    userId,
    name: "",
    description: "",
    icon: "🏅",
    rarity: "bronze",
    category: "growth",
    requirements: "",
    progress: 0,
    seen: false,
    ...overrides,
  };
}
