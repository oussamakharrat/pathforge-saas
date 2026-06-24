/**
 * Notification — A system notification delivered to the user.
 *
 * Notifications originate from domain events across the system:
 *  - Goal created / completed
 *  - Skill improved
 *  - Badge earned
 *  - Interview scheduled / completed
 *  - Offer received
 *  - Application status changed
 *  - AI recommendation generated
 *
 * Aggregate root: YES — notifications have their own lifecycle
 * (creation, delivery, read state, archival).
 *
 * Design decisions:
 *  - sourceEntityType/sourceEntityId allow polymorphic references
 *    without foreign keys (e.g. "goal" / goal-123)
 *  - Notifications are created by application services, not directly
 *    by domain entities, to keep the domain clean
 */

import type { NotificationType } from "../value-objects";

export interface Notification {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Classification */
  type: NotificationType;

  /** Display content */
  title: string;
  message: string;
  icon: string;              // emoji or icon identifier

  /** Read state */
  read: boolean;
  readAt?: string;

  /** Polymorphic source reference */
  sourceEntityType: string;  // e.g. "goal", "skill", "achievement", "interview"
  sourceEntityId: string;    // the ID of the source entity

  /** Deep link (e.g. /goals/goal-123) */
  link: string;

  /** Timestamps */
  createdAt: string;
}

// ── Factory ──

export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  overrides?: Partial<Notification>,
): Notification {
  return {
    id: crypto.randomUUID?.() ?? `notif-${Date.now()}`,
    userId,
    type,
    title,
    message,
    icon: "🔔",
    read: false,
    sourceEntityType: "",
    sourceEntityId: "",
    link: "",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Helpers ──

export function markAsRead(notification: Notification): Notification {
  return {
    ...notification,
    read: true,
    readAt: new Date().toISOString(),
  };
}

export function markAsUnread(notification: Notification): Notification {
  return {
    ...notification,
    read: false,
    readAt: undefined,
  };
}
