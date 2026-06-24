/**
 * Achievement — A milestone the user has reached.
 *
 * Achievements are unlocked when the user meets specific criteria.
 * They contribute to gamification (badges) and career scoring.
 *
 * Relationships:
 *  - May unlock Badges (one-to-many)
 *
 * Aggregate root: YES — definitions and user progress are separate concerns.
 * Achievement definitions are reference data; user achievements are records.
 */

import type { AchievementCategory } from "../value-objects";

export interface Achievement {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Display */
  title: string;
  description: string;
  icon: string;            // emoji
  category: AchievementCategory;

  /** Criteria and timing */
  criteria: string;        // human-readable description
  unlockedAt: string;
  seen: boolean;

  /** Score bonus */
  scoreBonus: number;

  /** Badges unlocked by this achievement */
  unlockedBadgeIds: string[];
}

// ── Factory ──

export function createAchievement(userId: string, overrides?: Partial<Achievement>): Achievement {
  return {
    id: crypto.randomUUID?.() ?? `ach-${Date.now()}`,
    userId,
    title: "",
    description: "",
    icon: "🏆",
    category: "growth",
    criteria: "",
    unlockedAt: new Date().toISOString(),
    seen: false,
    scoreBonus: 0,
    unlockedBadgeIds: [],
    ...overrides,
  };
}
