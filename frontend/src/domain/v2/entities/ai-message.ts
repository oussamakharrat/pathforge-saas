/**
 * AIMessage — A single message within an AI Coach conversation.
 *
 * Messages belong to a Conversation (parent aggregate). They are
 * NOT aggregate roots themselves — they are always accessed through
 * their parent conversation.
 *
 * Relationships:
 *  - Belongs to AIConversation (foreign key: conversationId)
 *
 * Design decisions:
 *  - Content is stored as a string (may be large — consider
 *    compression or separate storage for production)
 *  - metadata field allows flexible extension (model params,
 *    confidence scores, cited entities, etc.)
 *  - tokensUsed enables usage tracking and billing
 */

import type { AIMessageRole } from "../value-objects";

export interface AIMessage {
  /** Primary key */
  id: string;

  /** Parent conversation */
  conversationId: string;

  /** Who sent this message */
  role: AIMessageRole;

  /** Message content (may include markdown formatting) */
  content: string;

  /** AI metadata (model, parameters, citations) */
  metadata: Record<string, unknown>;

  /** Token usage */
  tokensUsed: number;

  /** Order within conversation */
  order: number;

  /** Timestamps */
  createdAt: string;
}

// ── Factory ──

export function createAIMessage(
  conversationId: string,
  role: AIMessageRole,
  content: string,
  order: number,
  overrides?: Partial<AIMessage>,
): AIMessage {
  return {
    id: crypto.randomUUID?.() ?? `msg-${Date.now()}`,
    conversationId,
    role,
    content,
    metadata: {},
    tokensUsed: 0,
    order,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
