/**
 * Resume — A versioned resume document owned by the user.
 *
 * A user may have multiple resume versions. Resumes are
 * analyzed for ATS compatibility and keyword coverage.
 *
 * Relationships:
 *  - Many-to-many with Skill (via resume_skills junction table)
 *
 * Aggregate root: YES — has its own lifecycle independent of User.
 */

export interface ResumeSection {
  id: string;
  type: "header" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "custom";
  title: string;
  content: string;
  order: number;
}

export interface Resume {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Version info */
  version: number;
  title: string;            // e.g. "Senior Engineer v3"

  /** Sections (within aggregate boundary) */
  sections: ResumeSection[];

  /** ATS analysis results */
  atsScore: number;         // 0–100
  detectedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createResume(userId: string, overrides?: Partial<Resume>): Resume {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `resume-${Date.now()}`,
    userId,
    version: 1,
    title: "Resume v1",
    sections: [],
    atsScore: 0,
    detectedKeywords: [],
    missingKeywords: [],
    suggestions: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
