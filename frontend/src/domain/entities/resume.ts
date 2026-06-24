/**
 * Resume — A versioned resume document.
 *
 * A user may have multiple resume versions.
 *
 * Relationships:
 *  Resume → affects Job Match Rate
 *  Resume → affects Interview Probability
 *  Resume → contributes to Career Score
 *  Resume → can be reviewed through Services
 */

export interface Resume {
  id: string;
  version: number;
  title: string; // e.g. "Senior Engineer v3"

  /** ATS score (0–100) */
  atsScore: number;

  /** Overall resume quality score (0–100) */
  resumeScore: number;

  /** Last AI analysis date */
  lastAnalysisDate: string;

  /** Keywords/skills detected on the resume */
  detectedKeywords: string[];

  /** Missing keywords that would improve ATS matching */
  missingKeywords: string[];

  /** AI-generated suggestions for improvement */
  suggestions: string[];

  /** Raw content / sections */
  sections: ResumeSection[];

  /** When this version was created */
  createdAt: string;
}

export interface ResumeSection {
  id: string;
  type: "header" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications" | "custom";
  title: string;
  content: string;
  order: number;
}

// ── Factory ──

export function createResume(overrides?: Partial<Resume>): Resume {
  return {
    id: crypto.randomUUID?.() ?? `resume-${Date.now()}`,
    version: 1,
    title: "Resume v1",
    atsScore: 0,
    resumeScore: 0,
    lastAnalysisDate: new Date().toISOString(),
    detectedKeywords: [],
    missingKeywords: [],
    suggestions: [],
    sections: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
