/**
 * Service Purchase — A paid service the user has bought.
 *
 * Paid services include:
 *  - Resume Review
 *  - LinkedIn Optimization
 *  - Career Coaching
 *  - Premium Mock Interview
 *
 * Relationships:
 *  Service → improves Resume
 *  Service → improves Interview Performance
 *  Service → updates Career Profile
 */

import type { ServiceType, ServiceStatus } from "../value-objects";

export interface ServiceImpact {
  resumeScoreBoost: number;
  skillBoost: number;
  careerScoreBoost: number;
  interviewScoreBoost: number;
}

export interface ServicePurchase {
  id: string;
  type: ServiceType;
  status: ServiceStatus;
  purchaseDate: string;
  completedDate?: string;

  /** Human-readable name */
  displayName: string;

  /** Price paid */
  price: string;

  /** Description of what was purchased */
  description: string;

  /** Computed: impact of this service on career metrics */
  impact: ServiceImpact;

  /** Tags for display */
  tags: string[];
}

// ── Factory ──

export function createServicePurchase(overrides?: Partial<ServicePurchase>): ServicePurchase {
  return {
    id: crypto.randomUUID?.() ?? `svc-${Date.now()}`,
    type: "resume-review",
    status: "purchased",
    purchaseDate: new Date().toISOString(),
    displayName: "",
    price: "$0",
    description: "",
    impact: { resumeScoreBoost: 0, skillBoost: 0, careerScoreBoost: 0, interviewScoreBoost: 0 },
    tags: [],
    ...overrides,
  };
}

// ── Service Catalog ──

export interface ServiceCatalogItem {
  type: ServiceType;
  name: string;
  price: string;
  description: string;
  tags: string[];
  impact: ServiceImpact;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    type: "resume-review",
    name: "Resume Review",
    price: "$49",
    description: "AI analysis with ATS optimization and actionable rewrites.",
    tags: ["48h turnaround", "ATS score"],
    impact: { resumeScoreBoost: 10, skillBoost: 3, careerScoreBoost: 3, interviewScoreBoost: 0 },
  },
  {
    type: "cv-full-rewrite",
    name: "CV Full Rewrite",
    price: "$149",
    description: "Complete CV transformation. Interview-ready in 72 hours.",
    tags: ["72h delivery", "3 revisions"],
    impact: { resumeScoreBoost: 20, skillBoost: 6, careerScoreBoost: 5, interviewScoreBoost: 0 },
  },
  {
    type: "linkedin-optimization",
    name: "LinkedIn Optimization",
    price: "$99",
    description: "AI-powered profile optimization to attract top recruiters.",
    tags: ["Profile rewrite", "Keyword boost"],
    impact: { resumeScoreBoost: 5, skillBoost: 0, careerScoreBoost: 3, interviewScoreBoost: 0 },
  },
  {
    type: "career-roadmap",
    name: "Career Roadmap",
    price: "$79",
    description: "Personalized 12-month AI-generated roadmap for your goals.",
    tags: ["Personalized", "Monthly milestones"],
    impact: { resumeScoreBoost: 0, skillBoost: 5, careerScoreBoost: 8, interviewScoreBoost: 0 },
  },
  {
    type: "salary-negotiation",
    name: "Salary Negotiation",
    price: "$129",
    description: "1-on-1 AI coaching with live counter-offer strategy.",
    tags: ["Live session", "Market data"],
    impact: { resumeScoreBoost: 0, skillBoost: 0, careerScoreBoost: 10, interviewScoreBoost: 0 },
  },
  {
    type: "interview-coaching",
    name: "Interview Coaching",
    price: "$99",
    description: "5 AI mock interviews with detailed feedback and scores.",
    tags: ["5 sessions", "Scorecard"],
    impact: { resumeScoreBoost: 0, skillBoost: 0, careerScoreBoost: 5, interviewScoreBoost: 15 },
  },
];
