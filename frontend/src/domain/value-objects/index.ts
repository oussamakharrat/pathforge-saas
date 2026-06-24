// ──────────────────────────────────────
// VALUE OBJECTS — Immutable shared types
// ──────────────────────────────────────

export type Plan = "free" | "pro" | "premium";
export const PLAN_HIERARCHY: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

export type ExperienceLevel = "0-1" | "1-3" | "3-5" | "5-10" | "10+";
export type EducationLevel = "high-school" | "associate" | "bachelor" | "master" | "phd" | "bootcamp";

export type ApplicationStatus =
  | "wishlist" | "planned" | "applied" | "screening"
  | "interview" | "offer" | "rejected" | "accepted";

export type InterviewType = "behavioral" | "technical" | "system" | "mock";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no-show";

export type NegotiationStatus = "pending" | "active" | "accepted" | "rejected" | "completed";

export type GoalStatus = "not-started" | "in-progress" | "completed" | "on-hold";
export type PlanStatus = "active" | "paused" | "completed" | "abandoned";

export type SkillCategory =
  | "Language" | "Frontend" | "Backend" | "Database" | "API"
  | "DevOps" | "Cloud" | "Architecture" | "Quality" | "Mobile"
  | "AI/ML" | "Tools" | "Soft Skill";

export type DemandLevel = "high" | "medium" | "low" | "emerging";
export type VerificationStatus = "self-reported" | "quiz-verified" | "certified" | "project-demonstrated";

export type AchievementCategory = "learning" | "skills" | "jobs" | "social" | "streak" | "growth";

export type BadgeRarity = "bronze" | "silver" | "gold" | "platinum";

export type ServiceType =
  | "resume-review" | "cv-full-rewrite" | "linkedin-optimization"
  | "career-roadmap" | "salary-negotiation" | "interview-coaching";
export type ServiceStatus = "purchased" | "in-progress" | "completed" | "cancelled";

export type NotificationType =
  | "goal_created" | "goal_completed" | "step_completed"
  | "skill_improved" | "service_purchased" | "badge_earned"
  | "quiz_completed" | "application_tracked" | "interview_tracked"
  | "offer_received" | "milestone_reached" | "mission_completed"
  | "negotiation_completed" | "portfolio_added" | "achievement_unlocked";

export type RelationshipEffect = "improves" | "unlocks" | "affects" | "determines" | "validates" | "generates";
