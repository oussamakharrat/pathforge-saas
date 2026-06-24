/**
 * CommunityReaction — A reaction (like, celebrate, etc.) on a post or comment.
 *
 * Reactions belong to either a Post or a Comment (but not both).
 * The postId/commentId pattern allows polymorphic association.
 *
 * NOT an aggregate root — always accessed through its parent Post or Comment.
 * Constraint: A user can only react once per post/comment (upsert behavior).
 *
 * Relationships:
 *  - Belongs to CommunityPost (via postId — mutually exclusive with commentId)
 *  - Belongs to CommunityComment (via commentId — mutually exclusive with postId)
 */

import type { ReactionType } from "../value-objects";

export interface CommunityReaction {
  /** Primary key */
  id: string;

  /** Author */
  userId: string;

  /** Polymorphic target: exactly one of postId or commentId must be set */
  postId?: string;
  commentId?: string;

  /** Reaction type */
  type: ReactionType;

  /** Timestamps */
  createdAt: string;
}

// ── Factory ──

export function createCommunityReaction(
  userId: string,
  type: ReactionType,
  target: { postId?: string; commentId?: string },
  overrides?: Partial<CommunityReaction>,
): CommunityReaction {
  return {
    id: crypto.randomUUID?.() ?? `reaction-${Date.now()}`,
    userId,
    type,
    postId: target.postId,
    commentId: target.commentId,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
