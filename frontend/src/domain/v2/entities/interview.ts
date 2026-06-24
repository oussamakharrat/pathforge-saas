/**
 * Interview — A job interview or mock interview session.
 *
 * Interviews originate from Applications but have their own
 * lifecycle (scheduling, completion, scoring).
 *
 * Aggregate root: YES — has independent lifecycle.
 */

import type { InterviewType, InterviewStatus } from "../value-objects";

export interface InterviewAnswer {
  id: string;
  question: string;
  answer: string;
  score: number;        // 0–100 per answer
  feedback: string;
  order: number;
}

export interface Interview {
  /** Primary key */
  id: string;

  /** Owner */
  userId: string;

  /** Reference to the application (optional for mock interviews) */
  applicationId?: string;

  /** Type and status */
  type: InterviewType;
  status: InterviewStatus;

  /** Context */
  company: string;
  role: string;

  /** Scoring */
  score: number;              // 0–100 overall
  feedback: string;           // AI-generated overall feedback
  answers: InterviewAnswer[]; // per-question breakdown

  /** Whether this was a mock interview */
  isMock: boolean;

  /** Did this interview lead to an offer */
  offerGenerated: boolean;

  /** Scheduled or completed date */
  date: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ── Factory ──

export function createInterview(userId: string, overrides?: Partial<Interview>): Interview {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID?.() ?? `interview-${Date.now()}`,
    userId,
    type: "technical",
    status: "scheduled",
    company: "",
    role: "",
    score: 0,
    feedback: "",
    answers: [],
    isMock: false,
    offerGenerated: false,
    date: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ── Helpers ──

export function calculateInterviewScore(answers: InterviewAnswer[]): number {
  if (answers.length === 0) return 0;
  const total = answers.reduce((sum, a) => sum + a.score, 0);
  return Math.round(total / answers.length);
}

export function generateInterviewFeedback(score: number): string {
  if (score >= 85) return "Strong performance — ready for real interviews!";
  if (score >= 70) return "Good foundation — a few more sessions will sharpen you.";
  if (score >= 50) return "Decent start. Focus on structuring answers and using concrete examples.";
  return "Needs significant improvement. Practice with STAR method and technical depth.";
}
