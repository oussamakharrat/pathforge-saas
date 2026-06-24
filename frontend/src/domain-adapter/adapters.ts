/**
 * Adapter functions for converting between domain model and legacy types.
 * This ensures pages using the old types continue to work.
 */

import type { Skill, Goal, LearningItem, JobApplication } from "@/domain/entities";
import type { SkillCategory, ApplicationStatus } from "@/domain/value-objects";
import { getSkillLevelLabel } from "@/domain/entities/skill";
import type {
  LegacySkill,
  LegacyGoal,
  LegacyLearningStep,
  LegacyKanbanCard,
  LegacyKanbanCol,
  LegacyKanbanData,
} from "./types";

// ── Skill Adapters ──

export function toLegacySkill(domain: Skill): LegacySkill {
  return {
    name: domain.name,
    level: getSkillLevelLabel(domain.currentLevel),
    pct: domain.currentLevel,
    cat: domain.category,
  };
}

export function toLegacySkills(domain: Skill[]): LegacySkill[] {
  return domain.map(toLegacySkill);
}

export function fromLegacySkill(legacy: LegacySkill, id?: string): Skill {
  return {
    id: id ?? `skill-${legacy.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: legacy.name,
    category: legacy.cat as SkillCategory,
    currentLevel: legacy.pct,
    targetLevel: 80,
    marketDemand: "medium",
    verificationStatus: "self-reported",
    lastAssessed: new Date().toISOString(),
    learningPlanIds: [],
    portfolioIds: [],
    goalIds: [],
  };
}

// ── Goal Adapters ──

export function toLegacyGoal(domain: Goal): LegacyGoal {
  return {
    id: parseInt(domain.id.replace(/\D+/g, ""), 10) || Math.random() * 10000,
    title: domain.title,
    progress: domain.progress,
    deadline: domain.targetDate,
    steps: domain.totalMilestoneCount || domain.milestones.length || 1,
    done: domain.completedMilestoneCount,
  };
}

export function toLegacyGoals(domain: Goal[]): LegacyGoal[] {
  return domain.map(toLegacyGoal);
}

export function fromLegacyGoal(legacy: LegacyGoal): Goal {
  return {
    id: `goal-${legacy.id}`,
    title: legacy.title,
    description: "",
    targetDate: legacy.deadline,
    status: legacy.progress >= 100 ? "completed" : legacy.done > 0 ? "in-progress" : "not-started",
    milestones: Array.from({ length: legacy.steps }, (_, i) => ({
      id: `ms-${legacy.id}-${i}`,
      title: `${legacy.title} — Step ${i + 1}`,
      completed: i < legacy.done,
      order: i,
    })),
    requiredSkillIds: [],
    learningPlanIds: [],
    careerPath: "",
    progress: legacy.progress,
    completedMilestoneCount: legacy.done,
    totalMilestoneCount: legacy.steps,
    createdAt: new Date().toISOString(),
  };
}

// ── Learning Step → Learning Item adapters ──

export function toLegacyLearningStep(item: LearningItem, planId?: string): LegacyLearningStep & { planId?: string } {
  return {
    id: parseInt(item.id.replace(/\D+/g, ""), 10) || Math.random() * 10000,
    title: item.title,
    done: item.completed,
    range: item.range,
    tag: item.tag,
    active: !item.completed,
    planId,
  };
}

export function toLegacyLearningSteps(items: LearningItem[]): LegacyLearningStep[] {
  return items.map((item) => toLegacyLearningStep(item));
}

export function fromLegacyLearningStep(legacy: LegacyLearningStep, skillIds: string[] = []): LearningItem {
  return {
    id: `li-${legacy.id}`,
    title: legacy.title,
    completed: legacy.done,
    range: legacy.range,
    tag: legacy.tag,
    order: legacy.id,
    improvedSkillIds: skillIds,
    skillBoostAmount: 5,
  };
}

// ── Application Adapters ──

const KANBAN_STATUS_MAP: Record<LegacyKanbanCol, string> = {
  saved: "wishlist",
  applied: "applied",
  screening: "screening",
  interview: "interview",
  final: "interview",
  offer: "offer",
  rejected: "rejected",
};

const KANBAN_REVERSE_MAP: Record<string, LegacyKanbanCol> = {
  wishlist: "saved",
  planned: "saved",
  applied: "applied",
  screening: "screening",
  interview: "interview",
  offer: "offer",
  rejected: "rejected",
  accepted: "offer",
};

export function toLegacyKanbanCard(app: JobApplication): LegacyKanbanCard {
  return {
    id: app.id,
    company: app.company,
    role: app.role,
    salary: app.salary,
    date: app.appliedDate,
    match: app.matchScore,
    notes: app.notes,
    logo: app.logo,
  };
}

export function fromLegacyKanbanCard(card: LegacyKanbanCard): JobApplication {
  return {
    id: card.id,
    company: card.company,
    role: card.role,
    salary: card.salary,
    status: "wishlist",
    appliedDate: card.date || new Date().toISOString(),
    source: "manual",
    notes: card.notes,
    logo: card.logo,
    requiredSkillIds: [],
    matchScore: card.match,
    interviewIds: [],
  };
}

export function getLegacyKanbanCol(status: string): LegacyKanbanCol {
  return KANBAN_REVERSE_MAP[status] ?? "saved";
}

export function toLegacyKanbanData(applications: JobApplication[]): LegacyKanbanData {
  const data: LegacyKanbanData = {
    saved: [],
    applied: [],
    screening: [],
    interview: [],
    final: [],
    offer: [],
    rejected: [],
  };

  applications.forEach((app) => {
    const col = getLegacyKanbanCol(app.status);
    data[col].push(toLegacyKanbanCard(app));
  });

  return data;
}

export function fromLegacyKanbanData(data: LegacyKanbanData): JobApplication[] {
  const apps: JobApplication[] = [];
  for (const [col, cards] of Object.entries(data)) {
    const status = KANBAN_STATUS_MAP[col as LegacyKanbanCol] ?? "wishlist";
    cards.forEach((card) => {
      apps.push({
        ...fromLegacyKanbanCard(card),
        status: status as ApplicationStatus,
      });
    });
  }
  return apps;
}
