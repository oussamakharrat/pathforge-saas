'use client';

/**
 * useDomainData — Bridge hook between domain model and React UI.
 *
 * This hook wraps domain services and entities in a React-ready interface.
 * It provides:
 *  - All domain entities as reactive state
 *  - Computed metrics via CareerProgressionService
 *  - Relationship graph via RelationshipGraphService
 *  - Impact tracking via ImpactEngine
 *  - Legacy type adapters for backward compat
 */

import { useMemo } from "react";
import type { User, Skill, Goal, LearningPlan, JobApplication, Interview, Negotiation } from "../../domain/entities";
import { createUser } from "../../domain/entities/user";
import {
  computeCareerMetrics,
  buildRelationshipGraph,
  buildImpactChains,
} from "../../domain/services";
import type { ComputedMetrics } from "../../domain/services/career-progression.service";
import type { ProgressionInput } from "../../domain/services/career-progression.service";
import { toLegacySkills, toLegacyGoals, toLegacyLearningSteps, toLegacyKanbanData } from "./adapters";

// ── Domain Data Hook ──

export interface DomainDataResult {
  /** The root User aggregate */
  user: User;

  /** Computed career metrics */
  metrics: ComputedMetrics;

  /** Relationship graph (all entity connections) */
  relationshipLinks: ReturnType<typeof buildRelationshipGraph>;

  /** Impact chains (grouped cause→effect) */
  impactChains: ReturnType<typeof buildImpactChains>;

  /** Legacy backward-compatible computed values */
  legacy: {
    avgSkillPct: number;
    avgGoalProgress: number;
    careerScore: number;
    skillsList: ReturnType<typeof toLegacySkills>;
    goalsList: ReturnType<typeof toLegacyGoals>;
    learningStepsList: ReturnType<typeof toLegacyLearningSteps>;
    kanbanData: ReturnType<typeof toLegacyKanbanData>;
  };
}

/**
 * Derive all domain data from the user aggregate.
 * This is a pure computation — no side effects.
 */
export function deriveDomainData(user: User): DomainDataResult {
  const progressionInput: ProgressionInput = {
    skills: user.skills,
    goals: user.goals,
    learningPlans: user.learningPlans,
    applications: user.applications,
    interviews: user.interviews,
    negotiations: user.negotiations,
    portfolio: user.portfolio,
    achievements: user.achievements,
  };

  const metrics = computeCareerMetrics(progressionInput);
  const relationshipLinks = buildRelationshipGraph({
    skills: user.skills,
    goals: user.goals,
    learningPlans: user.learningPlans,
    applications: user.applications,
    interviews: user.interviews,
    portfolio: user.portfolio,
    services: user.services,
  });
  const impactChains = buildImpactChains(relationshipLinks);

  // Legacy values
  const avgSkillPct =
    user.skills.length > 0
      ? Math.round(user.skills.reduce((s, k) => s + k.currentLevel, 0) / user.skills.length)
      : 0;

  const avgGoalProgress =
    user.goals.length > 0
      ? Math.round(user.goals.reduce((s, g) => s + g.progress, 0) / user.goals.length)
      : 0;

  const allLearningItems = user.learningPlans.flatMap((lp) => lp.items);

  return {
    user,
    metrics,
    relationshipLinks,
    impactChains,
    legacy: {
      avgSkillPct,
      avgGoalProgress,
      careerScore: metrics.careerScore,
      skillsList: toLegacySkills(user.skills),
      goalsList: toLegacyGoals(user.goals),
      learningStepsList: toLegacyLearningSteps(allLearningItems),
      kanbanData: toLegacyKanbanData(user.applications),
    },
  };
}

/**
 * React hook that derives domain data from user state.
 * Wrap in useMemo for performance.
 */
export function useDomainData(user: User): DomainDataResult {
  return useMemo(() => deriveDomainData(user), [user]);
}
