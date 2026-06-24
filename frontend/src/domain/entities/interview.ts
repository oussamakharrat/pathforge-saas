/**
 * Interview — A job interview or mock interview session.
 *
 * Interviews originate from Applications.
 * Mock interviews reuse the same entity structure.
 *
 * Relationships:
 *  Interview → belongs to Application
 *  Interview → contributes to Career Score
 *  Interview → may create Offer
 *  Interview → may trigger Negotiation
 */

import type { InterviewType, InterviewStatus } from "../value-objects";

export interface InterviewAnswer {
  question: string;
  answer: string;
  score: number;
  feedback: string;
}

export interface Interview {
  id: string;
  applicationId?: string;
  type: InterviewType;
  status: InterviewStatus;

  /** Company and role context */
  company: string;
  role: string;

  /** Score from the interview (0–100) */
  score: number;

  /** AI-generated overall feedback */
  feedback: string;

  /** Scheduled or completed date */
  date: string;

  /** Per-question breakdown */
  answers: InterviewAnswer[];

  /** Whether this was a mock or real interview */
  isMock: boolean;

  /** If an offer resulted from this interview */
  offerGenerated: boolean;

  /** ID of the resulting negotiation if an offer was made */
  negotiationId?: string;
}

// ── Factory ──

export function createInterview(overrides?: Partial<Interview>): Interview {
  return {
    id: crypto.randomUUID?.() ?? `interview-${Date.now()}`,
    type: "technical",
    status: "scheduled",
    company: "",
    role: "",
    score: 0,
    feedback: "",
    date: new Date().toISOString(),
    answers: [],
    isMock: false,
    offerGenerated: false,
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
