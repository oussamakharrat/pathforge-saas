// ─────────────────────────────────────────────
// VALUE OBJECTS — Immutable shared domain types
// ─────────────────────────────────────────────
// Value objects are defined by their attributes,
// not by an identity. Two value objects with the
// same attributes are considered equal.

// ── Plan & Subscription ──

export type Plan = "free" | "pro" | "premium";
export const PLAN_HIERARCHY: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };
export const PLAN_LABELS: Record<Plan, string> = { free: "Free", pro: "Pro", premium: "Premium" };

export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "expired";

// ── Career ──

export type ExperienceLevel = "0-1" | "1-3" | "3-5" | "5-10" | "10+";
export type EducationLevel = "high-school" | "associate" | "bachelor" | "master" | "phd" | "bootcamp";

// ── Job Pipeline ──

export type ApplicationStatus =
  | "wishlist" | "planned" | "applied" | "screening"
  | "interview" | "offer" | "rejected" | "accepted";

export type InterviewType = "behavioral" | "technical" | "system_design" | "mock";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export type NegotiationStatus = "pending" | "active" | "accepted" | "rejected" | "withdrawn";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired";

// ── Goals & Learning ──

export type GoalStatus = "not-started" | "in-progress" | "completed" | "on-hold";
export type PlanStatus = "active" | "paused" | "completed" | "abandoned";
export type CompletionStatus = "not-started" | "in-progress" | "completed";

// ── Skills ──

export type SkillCategory =
  | "Language" | "Frontend" | "Backend" | "Database" | "API"
  | "DevOps" | "Cloud" | "Architecture" | "Quality" | "Mobile"
  | "AI/ML" | "Tools" | "Soft Skill";

export type DemandLevel = "high" | "medium" | "low" | "emerging";
export type VerificationStatus = "self-reported" | "quiz-verified" | "certified" | "project-demonstrated";

// ── Gamification ──

export type AchievementCategory = "learning" | "skills" | "jobs" | "social" | "streak" | "growth";
export type BadgeRarity = "bronze" | "silver" | "gold" | "platinum";

// ── Services ──

export type ServiceType =
  | "resume-review" | "cv-full-rewrite" | "linkedin-optimization"
  | "career-roadmap" | "salary-negotiation" | "interview-coaching";

export type ServiceStatus = "purchased" | "in-progress" | "completed" | "cancelled";

// ── AI ──

export type AIMessageRole = "user" | "assistant" | "system";

// ── Notifications ──

export type NotificationType =
  | "goal_created" | "goal_completed" | "step_completed"
  | "skill_improved" | "service_purchased" | "badge_earned"
  | "quiz_completed" | "application_tracked" | "interview_tracked"
  | "offer_received" | "milestone_reached" | "negotiation_completed"
  | "portfolio_added" | "achievement_unlocked" | "ai_recommendation"
  | "community_reply" | "community_reaction" | "welcome";

// ── Community ──

export type ReactionType = "like" | "celebrate" | "support" | "insightful" | "thanks";

// ── Money ──

export interface Money {
  amount: number;
  currency: string; // ISO 4217, e.g. "USD"
}

// ── Salary Range ──

export interface SalaryRange {
  min: Money;
  max: Money;
}

// ── Relationship Effect ──

export type RelationshipEffect =
  | "improves" | "unlocks" | "affects" | "determines"
  | "validates" | "generates" | "requires" | "triggers";
