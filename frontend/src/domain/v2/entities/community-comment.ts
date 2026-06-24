/**
 * CommunityComment — A comment on a community post.
 *
 * Comments belong to a Post (parent aggregate). They support
 * threading via parentCommentId for nested replies.
 *
 * Relationships:
 *  - Belongs to CommunityPost (foreign key: postId)
 *  - Optional: belongs to a parent CommunityComment (for threading)
 *
 * NOT an aggregate root — always accessed through its parent Post.
 * However, it has identity because comments can be edited, deleted,
 * and reacted to independently.
 */

export interface CommunityComment {
  /** Primary key */
  id: string;

  /** Parent post */
  postId: string;

  /** Author */
  userId: string;

  /** Content */
  body: string;

  /** Threading: parent comment for nested replies */
  parentCommentId?: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createCommunityComment(
  postId: string,
  userId: string,
  body: string,
  overrides?: Partial<CommunityComment>,
): CommunityComment {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `comment-${Date.now()}`,
    postId,
    userId,
    body,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
