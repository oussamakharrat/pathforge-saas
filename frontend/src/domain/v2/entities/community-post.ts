/**
 * CommunityPost — A user-generated post in the community.
 *
 * The community module allows users to share experiences,
 * ask questions, and celebrate wins. Posts support threaded
 * comments and reactions (likes, celebrations, etc.).
 *
 * Aggregate root: YES — posts have independent lifecycle
 * (creation, pinning, archiving, moderation).
 *
 * Relationships:
 *  - One-to-many with CommunityComment
 *  - One-to-many with CommunityReaction
 *
 * Design decisions:
 *  - commentCount and reactionCount are denormalized for
 *    feed performance (updated via domain events)
 *  - isArchived for soft deletion / moderation
 */

import type { ReactionType } from "../value-objects";

export interface CommunityPost {
  /** Primary key */
  id: string;

  /** Author */
  userId: string;

  /** Content */
  title: string;
  body: string;              // supports markdown

  /** Categorization */
  tags: string[];            // e.g. ["career", "interview", "success-story"]

  /** Computed: denormalized counts (updated via events) */
  commentCount: number;
  reactionCount: number;

  /** Moderation */
  isPinned: boolean;
  isArchived: boolean;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createCommunityPost(userId: string, overrides?: Partial<CommunityPost>): CommunityPost {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `post-${Date.now()}`,
    userId,
    title: "",
    body: "",
    tags: [],
    commentCount: 0,
    reactionCount: 0,
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ── Helpers ──

export function pinPost(post: CommunityPost): CommunityPost {
  return { ...post, isPinned: true, updatedAt: new Date().toISOString() };
}

export function unpinPost(post: CommunityPost): CommunityPost {
  return { ...post, isPinned: false, updatedAt: new Date().toISOString() };
}

export function archivePost(post: CommunityPost): CommunityPost {
  return { ...post, isArchived: true, updatedAt: new Date().toISOString() };
}
