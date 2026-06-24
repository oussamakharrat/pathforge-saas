/**
 * Application — A job application tracked by the user.
 *
 * Tracks the entire pipeline from "wishlist" through "accepted".
 * Applications reference Jobs rather than embedding job data.
 *
 * Relationships:
 *  - Belongs to a Job (foreign key)
 *  - May result in Interviews (one-to-many)
 *  - May result in an Offer (one-to-one)
 *
 * Aggregate root: YES — owns its pipeline lifecycle.
 */

import type { ApplicationStatus } from "../value-objects";

export interface Application {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Reference to the Job being applied for */
  jobId: string;

  /** Pipeline tracking */
  status: ApplicationStatus;
  appliedDate: string;

  /** User's notes about this application */
  notes: string;

  /** Optional: the goal this application supports */
  goalId?: string;

  /** IDs of interviews generated from this application */
  interviewIds: string[];

  /** Offer ID if an offer was received */
  offerId?: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createApplication(userId: string, jobId: string, overrides?: Partial<Application>): Application {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `app-${Date.now()}`,
    userId,
    jobId,
    status: "wishlist",
    appliedDate: now,
    notes: "",
    interviewIds: [],
    createdAt: now,
    updatedAt: now,
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

/** Determine the career event triggered by a status transition */
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
