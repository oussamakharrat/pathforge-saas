/**
 * Job — A job or position that the user is targeting.
 *
 * Previously, job data was embedded inline in Application.
 * Separating Job as its own entity enables:
 *  - Reusable job definitions (multiple users can target same job)
 *  - Rich job metadata (salary range, location, required skills)
 *  - Market intelligence (demand data, company info)
 *
 * Relationships:
 *  - Many-to-many with Skill (via job_skills junction table)
 *  - One-to-many with Application
 *
 * Aggregate root: YES — jobs have independent lifecycle and can
 * be enriched with market data without affecting applications.
 */

import type { SalaryRange } from "../value-objects";

export interface Job {
  /** Primary key */
  id: string;

  /** Who created/added this job */
  userId: string;

  /** Core fields */
  company: string;
  title: string;
  description: string;
  location: string;
  url: string;

  /** Compensation */
  salaryRange?: SalaryRange;

  /** Source (manual, linkedin, indeed, etc.) */
  source: string;

  /** Company metadata */
  companyLogo: string;
  companySize: string;        // e.g. "50-200", "1000+"
  industry: string;

  /** Computed: how well the user's skills match (0–100) */
  matchScore: number;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createJob(userId: string, overrides?: Partial<Job>): Job {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `job-${Date.now()}`,
    userId,
    company: "",
    title: "",
    description: "",
    location: "",
    url: "",
    source: "manual",
    companyLogo: "",
    companySize: "",
    industry: "",
    matchScore: 50,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
