/**
 * Impact Engine
 *
 * The Impact Engine propagates changes across entities.
 * When one entity changes, it calculates the ripple effects.
 *
 * Examples:
 *  - Completing a Learning Item → Skill +5% → Career Score +N
 *  - Skill improves → Job Match recalculation
 *  - Application moves to "interview" → Interview entity created
 *  - Interview completed → Career Score +N
 *  - Offer received → Negotiation can begin
 *  - Goal completed → Achievement unlocked
 *
 * This makes every action's consequences visible to the user.
 */

import type { Skill } from "../entities/skill";
import type { Goal } from "../entities/goal";
import { recalculateGoalProgress, toggleMilestone } from "../entities/goal";
import type { LearningPlan, LearningItem } from "../entities/learning-plan";
import { recalculateLearningPlanProgress } from "../entities/learning-plan";
import type { JobApplication } from "../entities/job-application";
import { getStatusTransitionEvent } from "../entities/job-application";
import type { Interview } from "../entities/interview";
import type { Achievement, AchievementCheckData } from "../entities/achievement";
import { ACHIEVEMENT_DEFINITIONS, createAchievement } from "../entities/achievement";
import type { Badge, BadgeCheckData } from "../entities/badge";
import { BADGE_DEFINITIONS, createBadge } from "../entities/badge";
import { improveSkill, SKILL_JOB_MAP } from "../entities/skill";

// ── Impact Result ──

export interface ImpactResult {
  updatedSkills: Skill[];
  updatedGoals: Goal[];
  updatedPlans: LearningPlan[];
  newAchievements: Achievement[];
  newBadges: Badge[];
  careerScoreImpact: number;
  jobsUnlocked: string[];
  description: string;
}

// ── Impact: Complete a Learning Item ──

export function applyLearningItemImpact(
  plan: LearningPlan,
  itemId: string,
  skills: Skill[],
  goals: Goal[],
  achievementData: Partial<AchievementCheckData>,
  badgeData: Partial<BadgeCheckData>,
): ImpactResult {
  const updatedPlan = toggleLearningItem(plan, itemId);
  const item = plan.items.find((i) => i.id === itemId);
  const wasAlreadyDone = item?.completed;

  if (wasAlreadyDone) {
    return {
      updatedSkills: skills,
      updatedGoals: goals,
      updatedPlans: [updatedPlan],
      newAchievements: [],
      newBadges: [],
      careerScoreImpact: 0,
      jobsUnlocked: [],
      description: "Item was already completed.",
    };
  }

  // Improve linked skills
  const updatedSkills = skills.map((skill) => {
    if (!item?.improvedSkillIds.includes(skill.id)) return skill;
    return improveSkill(skill, item.skillBoostAmount || 5);
  });

  // Find and update linked goals
  const updatedGoals = goals.map((goal) => {
    if (!plan.goalId || goal.id !== plan.goalId) return goal;
    // Find the milestone matching this learning item and complete it
    const milestone = goal.milestones.find((m) => m.title.includes(item?.title ?? ""));
    if (milestone) return toggleMilestone(goal, milestone.id);
    return goal;
  });

  // Check for new achievements
  const newAchievements = checkAchievements(achievementData);
  const newBadges = checkBadges(badgeData);

  const jobsUnlocked = item
    ? item.improvedSkillIds.flatMap((skillId) => {
        const skill = updatedSkills.find((s) => s.id === skillId);
        if (!skill) return [];
        return Object.entries(SKILL_JOB_MAP)
          .filter(([name]) => skill.name.includes(name) || name.includes(skill.name))
          .flatMap(([, roles]) => (skill.currentLevel >= 50 ? roles : []));
      })
    : [];

  const careerScoreImpact = Math.round(
    item?.skillBoostAmount
      ? (item.skillBoostAmount / 100) * 30 * (item.improvedSkillIds.length || 1)
      : 0,
  );

  return {
    updatedSkills,
    updatedGoals,
    updatedPlans: [updatedPlan],
    newAchievements,
    newBadges,
    careerScoreImpact,
    jobsUnlocked: [...new Set(jobsUnlocked)],
    description: item
      ? `Completed "${item.title}" → ${item.improvedSkillIds.length} skill(s) improved, ${careerScoreImpact} career score impact`
      : "Learning item completed.",
  };
}

// ── Impact: Application Status Change ──

export function applyApplicationStatusImpact(
  application: JobApplication,
  newStatus: JobApplication["status"],
  existingInterviews: Interview[],
): {
  updatedApplication: JobApplication;
  interviewCreated: boolean;
  eventType: "application" | "interview" | "offer" | "rejection" | null;
} {
  const eventType = getStatusTransitionEvent(application.status, newStatus);
  const updatedApp = { ...application, status: newStatus };
  const interviewCreated =
    eventType === "interview" || (newStatus === "interview" && application.interviewIds.length === 0);

  return { updatedApplication: updatedApp, interviewCreated, eventType };
}

// ── Impact: Interview Completed ──

export function applyInterviewCompletionImpact(
  score: number,
): {
  careerScoreBoost: number;
  skillBoost: number;
  offerProbability: number;
  feedback: string;
} {
  const careerScoreBoost = Math.round((score / 100) * 8);
  const skillBoost = score >= 70 ? 2 : 0;
  const offerProbability = score >= 85 ? 0.8 : score >= 70 ? 0.5 : score >= 50 ? 0.2 : 0.05;

  const feedback =
    score >= 85
      ? "Strong interview performance — likely to advance."
      : score >= 70
        ? "Good interview. A bit more polish could secure an offer."
        : score >= 50
          ? "Decent but needs improvement. Practice more mock interviews."
          : "Needs significant preparation before the real interview.";

  return { careerScoreBoost, skillBoost, offerProbability, feedback };
}

// ── Achievement & Badge Checks ──

export function checkAchievements(data: Partial<AchievementCheckData>): Achievement[] {
  const fullData: AchievementCheckData = {
    totalApplications: data.totalApplications ?? 0,
    totalInterviews: data.totalInterviews ?? 0,
    totalOffers: data.totalOffers ?? 0,
    goalsCompleted: data.goalsCompleted ?? 0,
    skillsAtAdvanced: data.skillsAtAdvanced ?? 0,
    quizzesPassed: data.quizzesPassed ?? 0,
    streakDays: data.streakDays ?? 0,
    negotiationsCompleted: data.negotiationsCompleted ?? 0,
    portfolioProjects: data.portfolioProjects ?? 0,
    communityPosts: data.communityPosts ?? 0,
  };

  return ACHIEVEMENT_DEFINITIONS.filter((def) => def.check(fullData)).map((def) =>
    createAchievement({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      criteria: def.criteria,
      scoreBonus: def.scoreBonus,
    }),
  );
}

export function checkBadges(data: Partial<BadgeCheckData>): Badge[] {
  const fullData: BadgeCheckData = {
    goalsCompleted: data.goalsCompleted ?? 0,
    skillsAtAdvanced: data.skillsAtAdvanced ?? 0,
    learningItemsDone: data.learningItemsDone ?? 0,
    totalLearningItems: data.totalLearningItems ?? 0,
    quizzesWithPerfect: data.quizzesWithPerfect ?? 0,
    quizzesHighScore: data.quizzesHighScore ?? 0,
    totalApplications: data.totalApplications ?? 0,
    totalInterviews: data.totalInterviews ?? 0,
    totalOffers: data.totalOffers ?? 0,
    negotiationsCompleted: data.negotiationsCompleted ?? 0,
    streakDays: data.streakDays ?? 0,
    categoriesCovered: data.categoriesCovered ?? 0,
  };

  return BADGE_DEFINITIONS.filter((def) => def.check(fullData)).map((def) => {
    const { current, target } = def.progress(fullData);
    return createBadge({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      category: def.category,
      requirements: def.requirements,
      progress: target > 0 ? Math.round((current / target) * 100) : 0,
    });
  });
}

// ── Market Demand Integration ──

export function calculateSkillMarketImpact(skill: Skill): {
  salaryImpact: string;
  demandSignal: string;
  roleAccess: string[];
} {
  const roles = SKILL_JOB_MAP[skill.name] ?? [];
  const demandMap: Record<string, { salary: string; signal: string }> = {
    high: { salary: "+15-25%", signal: "High Demand" },
    medium: { salary: "+5-15%", signal: "Growing" },
    low: { salary: "0-5%", signal: "Niche" },
    emerging: { salary: "+20-40%", signal: "Emerging — Early Adopter Advantage" },
  };

  const info = demandMap[skill.marketDemand] ?? { salary: "+0%", signal: "Stable" };

  return {
    salaryImpact: info.salary,
    demandSignal: info.signal,
    roleAccess: roles,
  };
}
