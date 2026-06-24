/**
 * Career Progression Service
 *
 * The central scoring and metrics engine for PathForge.
 * ALL derived metrics are computed here — never stored redundantly.
 *
 * This service answers:
 *  - What is the user's Career Score?
 *  - What is their Resume Score?
 *  - What is their Interview Readiness?
 *  - How close are they to their target role?
 *  - What is their skill coverage?
 *  - What is their job match rate?
 */

import type { Goal } from "../entities/goal";
import type { Skill } from "../entities/skill";
import type { LearningPlan } from "../entities/learning-plan";
import type { JobApplication } from "../entities/job-application";
import type { Interview } from "../entities/interview";
import type { Negotiation } from "../entities/negotiation";
import type { Portfolio } from "../entities/portfolio";
import type { Achievement } from "../entities/achievement";
import type { CareerProfile } from "../entities/career-profile";
import { SKILL_JOB_MAP } from "../entities/skill";

// ── Input data required for computation ──

export interface ProgressionInput {
  skills: Skill[];
  goals: Goal[];
  learningPlans: LearningPlan[];
  applications: JobApplication[];
  interviews: Interview[];
  negotiations: Negotiation[];
  portfolio: Portfolio[];
  achievements: Achievement[];
}

export interface ComputedMetrics {
  careerScore: number;
  resumeScore: number;
  interviewScore: number;
  portfolioScore: number;
  skillCoverage: number;
  jobMatchRate: number;
  goalProgress: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  skills: number;       // 0–100
  goals: number;        // 0–100
  applications: number; // 0–100
  interviews: number;   // 0–100
  portfolio: number;    // 0–100
  achievements: number; // 0–100
}

// ── Main Computation ──

export function computeCareerMetrics(data: ProgressionInput): ComputedMetrics {
  const skills = computeSkillScore(data.skills);
  const goals = computeGoalScore(data.goals);
  const applications = computeApplicationScore(data.applications);
  const interviews = computeInterviewScore(data.interviews);
  const portfolioScore = computePortfolioScore(data.portfolio);
  const achievements = computeAchievementScore(data.achievements);

  const breakdown: ScoreBreakdown = {
    skills,
    goals,
    applications,
    interviews,
    portfolio: portfolioScore,
    achievements,
  };

  // Weighted composite: Skills matter most for technical roles
  const careerScore = Math.min(100, Math.round(
    skills * 0.30 +
    goals * 0.20 +
    applications * 0.15 +
    interviews * 0.15 +
    portfolioScore * 0.10 +
    achievements * 0.10
  ));

  // Derived metrics
  const resumeScore = computeResumeScore(data.skills, data.portfolio, data.applications);
  const interviewScore = computeInterviewReadiness(data.skills, data.interviews);
  const skillCoverage = computeSkillCoverage(data.skills);
  const jobMatchRate = computeJobMatchRate(data.skills, data.applications);
  const goalProgress = computeGoalProgress(data.goals);

  return {
    careerScore,
    resumeScore,
    interviewScore,
    portfolioScore,
    skillCoverage,
    jobMatchRate,
    goalProgress,
    scoreBreakdown: breakdown,
  };
}

// ── Individual Score Components ──

function computeSkillScore(skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const avg = skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length;
  return Math.round(avg);
}

function computeGoalScore(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const avg = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;
  return Math.round(avg);
}

function computeApplicationScore(applications: JobApplication[]): number {
  if (applications.length === 0) return 0;
  const stages = ["wishlist", "planned", "applied", "screening", "interview", "offer", "accepted"];
  const totalWeight = applications.reduce((sum, app) => {
    const stageIndex = stages.indexOf(app.status);
    return sum + (stageIndex >= 0 ? (stageIndex / (stages.length - 1)) * 100 : 0);
  }, 0);
  return Math.round(totalWeight / applications.length);
}

function computeInterviewScore(interviews: Interview[]): number {
  const completed = interviews.filter((i) => i.status === "completed");
  if (completed.length === 0) return 0;
  const avgScore = completed.reduce((sum, i) => sum + i.score, 0) / completed.length;
  return Math.round(avgScore);
}

function computePortfolioScore(portfolio: Portfolio[]): number {
  if (portfolio.length === 0) return 0;
  // Each project contributes up to 100 points, weighted by tech diversity
  const projectCount = Math.min(portfolio.length, 10);
  const baseScore = (projectCount / 10) * 100;
  // Bonus for having repo/demo links
  const hasLinks = portfolio.filter((p) => p.repoUrl || p.demoUrl).length;
  const linkBonus = portfolio.length > 0 ? Math.round((hasLinks / portfolio.length) * 20) : 0;
  return Math.min(100, Math.round(baseScore + linkBonus));
}

function computeAchievementScore(achievements: Achievement[]): number {
  if (achievements.length === 0) return 0;
  const totalBonus = achievements.reduce((sum, a) => sum + (a.scoreBonus || 0), 0);
  return Math.min(100, totalBonus * 5);
}

// ── Derived Metrics ──

function computeResumeScore(skills: Skill[], portfolio: Portfolio[], applications: JobApplication[]): number {
  // Resume score is based on skill level breadth + portfolio + application signals
  const skillAvg = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.currentLevel, 0) / skills.length)
    : 0;
  const portfolioBonus = Math.min(15, portfolio.length * 3);
  const applicationBonus = Math.min(10, applications.length);
  return Math.min(100, Math.round(skillAvg * 0.6 + portfolioBonus + applicationBonus));
}

function computeInterviewReadiness(skills: Skill[], interviews: Interview[]): number {
  // Based on skill depth + interview practice
  const advancedSkills = skills.filter((s) => s.currentLevel >= 80).length;
  const skillDepth = Math.min(50, advancedSkills * 10);
  const interviewCount = interviews.filter((i) => i.status === "completed").length;
  const practiceScore = Math.min(50, interviewCount * 15);
  return Math.min(100, skillDepth + practiceScore);
}

function computeSkillCoverage(skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const total = skills.length;
  const categories = new Set(skills.map((s) => s.category));
  const advancedCount = skills.filter((s) => s.currentLevel >= 80).length;
  const breadthBonus = Math.min(30, categories.size * 5);
  const depthBonus = Math.min(40, advancedCount * 8);
  const avgLevel = skills.reduce((sum, s) => sum + s.currentLevel, 0) / total;
  return Math.min(100, Math.round(avgLevel * 0.3 + breadthBonus + depthBonus));
}

function computeJobMatchRate(skills: Skill[], applications: JobApplication[]): number {
  // How well the user's skills match their target applications
  if (applications.length === 0) {
    // Use skills alone as proxy
    if (skills.length === 0) return 0;
    const avg = skills.reduce((s, k) => s + k.currentLevel, 0) / skills.length;
    return Math.round(avg * 0.7);
  }
  const matchScores = applications.map((app) => app.matchScore);
  return Math.round(matchScores.reduce((s, m) => s + m, 0) / matchScores.length);
}

function computeGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const completed = goals.filter((g) => g.status === "completed").length;
  const inProgress = goals.filter((g) => g.status === "in-progress").length;
  return Math.min(100, Math.round((completed * 100 + inProgress * 50) / Math.max(goals.length, 1)));
}

// ── Profile Update ──

export function updateCareerProfile(
  profile: CareerProfile,
  data: ProgressionInput,
): CareerProfile {
  const metrics = computeCareerMetrics(data);
  return {
    ...profile,
    careerScore: metrics.careerScore,
    resumeScore: metrics.resumeScore,
    interviewScore: metrics.interviewScore,
    portfolioScore: metrics.portfolioScore,
    skillCoverage: metrics.skillCoverage,
    jobMatchRate: metrics.jobMatchRate,
    goalProgress: metrics.goalProgress,
    lastCalculatedAt: new Date().toISOString(),
  };
}
