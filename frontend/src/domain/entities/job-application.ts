/**
 * Job Application — A user-tracked job application.
 *
 * Users manually add applications. Displayed in a Kanban board.
 * Drag-and-drop updates status.
 *
 * Relationships:
 *  Job Application → belongs to Goal
 *  Job Application → requires Skills
 *  Job Application → generates Interviews
 */

import type { ApplicationStatus } from "../value-objects";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  status: ApplicationStatus;
  appliedDate: string;
  source: string;
  notes: string;

  /** Company logo initial */
  logo: string;

  /** The goal this application supports */
  goalId?: string;

  /** Skills required for this role (user's current levels used for match) */
  requiredSkillIds: string[];

  /** Computed: match score based on user skills vs requirements (0–100) */
  matchScore: number;

  /** IDs of interviews generated from this application */
  interviewIds: string[];

  /** If an offer was received, the offer/negotiation ID */
  offerId?: string;

  /** URL to job posting */
  url?: string;
}

// ── Factory ──

export function createJobApplication(overrides?: Partial<JobApplication>): JobApplication {
  return {
    id: crypto.randomUUID?.() ?? `app-${Date.now()}`,
    company: "",
    role: "",
    salary: "$—",
    status: "wishlist",
    appliedDate: new Date().toISOString(),
    source: "manual",
    notes: "",
    logo: "?",
    requiredSkillIds: [],
    matchScore: 50,
    interviewIds: [],
    ...overrides,
  };
}

// ── Helpers ──

export const APPLICATION_STATUS_DISPLAY: Record<ApplicationStatus, string> = {
  wishlist: "Wishlist",
  planned: "Planned",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer 🎉",
  rejected: "Rejected",
  accepted: "Accepted",
};

export const APPLICATION_PIPELINE_ORDER: ApplicationStatus[] = [
  "wishlist",
  "planned",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "accepted",
];

/** Determine if moving an application to a new status triggers a career event */
export function getStatusTransitionEvent(
  from: ApplicationStatus,
  to: ApplicationStatus,
): "application" | "interview" | "offer" | "rejection" | null {
  if (to === "applied" && from !== "applied") return "application";
  if (to === "interview" && from !== "interview") return "interview";
  if (to === "offer" && from !== "offer") return "offer";
  if (to === "rejected" && from !== "rejected") return "rejection";
  return null;
}
