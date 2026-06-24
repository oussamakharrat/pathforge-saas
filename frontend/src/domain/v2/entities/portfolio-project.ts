/**
 * PortfolioProject — A project that demonstrates the user's skills.
 *
 * Replaces the simplistic Portfolio entity. Each project is a
 * concrete artifact that validates specific skills.
 *
 * Relationships:
 *  - Many-to-many with Skill (via portfolio_project_skills junction)
 *
 * Aggregate root: YES — independent lifecycle.
 */

import type { CompletionStatus } from "../value-objects";

export interface PortfolioProject {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Core fields */
  title: string;
  description: string;
  technologies: string[];     // e.g. ["React", "Node.js", "PostgreSQL"]

  /** Links */
  repoUrl: string;
  demoUrl: string;
  imageUrl: string;

  /** Status */
  status: CompletionStatus;

  /** Whether this is a featured project */
  featured: boolean;

  /** Timestamps */
  createdAt: string;
  completedAt?: string;
}

// ── Factory ──

export function createPortfolioProject(userId: string, overrides?: Partial<PortfolioProject>): PortfolioProject {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `proj-${Date.now()}`,
    userId,
    title: "",
    description: "",
    technologies: [],
    repoUrl: "",
    demoUrl: "",
    imageUrl: "",
    status: "not-started",
    featured: false,
    createdAt: now,
    ...overrides,
  };
}
