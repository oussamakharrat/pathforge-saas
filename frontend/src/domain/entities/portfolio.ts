/**
 * Portfolio — A project that proves skills.
 *
 * Relationships:
 *  Portfolio → validates Skills
 *  Portfolio → improves Resume Score
 *  Portfolio → improves Job Match Rate
 *  Portfolio → contributes to Career Score
 */

export interface Portfolio {
  id: string;
  title: string;
  description: string;

  /** Technologies / skills demonstrated by this project */
  technologies: string[];

  /** Skill IDs validated by this project */
  validatedSkillIds: string[];

  /** Links */
  repoUrl?: string;
  demoUrl?: string;

  /** Optional project image */
  imageUrl?: string;

  /** When this project was added */
  createdAt: string;

  /** When this project was completed */
  completedAt?: string;

  /** Whether this is a featured project */
  featured: boolean;
}

// ── Factory ──

export function createPortfolio(overrides?: Partial<Portfolio>): Portfolio {
  return {
    id: crypto.randomUUID?.() ?? `port-${Date.now()}`,
    title: "",
    description: "",
    technologies: [],
    validatedSkillIds: [],
    createdAt: new Date().toISOString(),
    featured: false,
    ...overrides,
  };
}
