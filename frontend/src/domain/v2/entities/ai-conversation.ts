/**
 * AIConversation — A conversation with the AI Career Coach.
 *
 * The AI Coach is an APPLICATION SERVICE, not a domain entity.
 * Conversations store the interaction history so the AI can
 * maintain context across sessions.
 *
 * Aggregate root: YES — conversations have independent lifecycle.
 *
 * Design decisions:
 *  - Messages are a separate entity (not a value object) because
 *    they have their own metadata (tokens, model, timing)
 *  - The AI Coach service orchestrates the interaction:
 *    1. Load conversation + messages
 *    2. Build prompt context from domain entities
 *    3. Call AI provider
 *    4. Store response as new message
 *    5. Update conversation metadata
 */

import type { AIMessageRole } from "../value-objects";

export interface AIConversation {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Display title (auto-generated or user-set) */
  title: string;

  /** Context summary (what entities are being discussed) */
  context: string;           // e.g. "Resume review for Senior Engineer role"

  /** Metadata */
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
}

// ── Factory ──

export function createAIConversation(userId: string, overrides?: Partial<AIConversation>): AIConversation {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `conv-${Date.now()}`,
    userId,
    title: "New Conversation",
    context: "",
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    messageCount: 0,
    ...overrides,
  };
}

// ── Helpers ──

export function updateConversationContext(
  conversation: AIConversation,
  context: string,
): AIConversation {
  return {
    ...conversation,
    context,
    updatedAt: new Date().toISOString(),
  };
}
