import type {
  Goal,
  GoalMilestone,
  Skill,
  LearningStep,
  KanbanCard,
  KanbanCol,
  Conversation,
  Message,
  OutcomeMetrics,
} from '@/data/types';
import { getSkillLevelLabel } from '@/domain/entities/skill';
import { toLegacyId } from '@/lib/id-registry';

export type LearningStepMeta = LearningStep & {
  planId?: string;
  itemId?: string;
  goalId?: string;
  goalLegacyId?: number;
};
export type SkillMeta = Skill & { userSkillId?: string; skillCatalogId?: string };

const EMPTY_KANBAN = (): Record<KanbanCol, KanbanCard[]> => ({
  saved: [],
  applied: [],
  screening: [],
  interview: [],
  final: [],
  offer: [],
  rejected: [],
});

const STATUS_TO_COL: Record<string, KanbanCol> = {
  wishlist: 'saved',
  planned: 'saved',
  applied: 'applied',
  screening: 'screening',
  interview: 'interview',
  final_round: 'final',
  offer: 'offer',
  rejected: 'rejected',
  accepted: 'offer',
};

export const COL_TO_STATUS: Record<KanbanCol, string> = {
  saved: 'wishlist',
  applied: 'applied',
  screening: 'screening',
  interview: 'interview',
  final: 'final_round',
  offer: 'offer',
  rejected: 'rejected',
};

export function apiGoalToLegacy(g: Record<string, unknown>): Goal {
  const milestones = (g.milestones as GoalMilestone[]) ?? [];
  const goalSkills = (g.skills as Record<string, unknown>[]) ?? [];
  const linkedSkills = goalSkills.map((gs) => {
    const catalog = (gs.skillCatalog as Record<string, unknown>) ?? {};
    return {
      id: String(gs.skillCatalogId ?? catalog.id ?? ''),
      name: String(catalog.name ?? 'Skill'),
    };
  }).filter((s) => s.id);
  return {
    id: toLegacyId(String(g.id)),
    apiId: String(g.id),
    title: String(g.title),
    progress: Number(g.progress ?? 0),
    deadline: g.targetDate ? String(g.targetDate).split('T')[0] : '',
    steps: milestones.length || 1,
    done: milestones.filter((m) => m.completed).length,
    milestones,
    linkedSkills,
  };
}

export function apiSkillToLegacy(s: Record<string, unknown>): SkillMeta {
  const catalog = (s.skillCatalog as Record<string, unknown>) ?? {};
  const level = Number(s.currentLevel ?? 25);
  return {
    name: String(catalog.name ?? 'Skill'),
    level: getSkillLevelLabel(level),
    pct: level,
    cat: String(catalog.category ?? 'Tools'),
    userSkillId: String(s.id ?? ''),
    skillCatalogId: String(s.skillCatalogId ?? catalog.id ?? ''),
  };
}

export function apiLearningItemToLegacy(
  item: Record<string, unknown>,
  planId: string,
  goalId?: string,
): LearningStepMeta {
  return {
    id: toLegacyId(String(item.id)),
    title: String(item.title),
    done: Boolean(item.completed),
    range: String(item.tag ?? ''),
    tag: String(item.tag ?? ''),
    active: !item.completed,
    planId,
    itemId: String(item.id),
    goalId,
    goalLegacyId: goalId ? toLegacyId(goalId) : undefined,
  };
}

function formatSalaryRange(value: unknown): string {
  if (value == null) return 'TBD';
  if (typeof value === 'string') return value || 'TBD';
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.display === 'string') return obj.display;
    if (typeof obj.min === 'number' && typeof obj.max === 'number') {
      return `$${obj.min}–${obj.max}`;
    }
    if (typeof obj.amount === 'number') return `$${obj.amount}`;
  }
  return 'TBD';
}

export function apiApplicationsToKanban(
  apps: Record<string, unknown>[],
): Record<KanbanCol, KanbanCard[]> {
  const data = EMPTY_KANBAN();
  for (const app of apps) {
    const job = (app.job as Record<string, unknown>) ?? {};
    const company = String(job.company ?? 'Unknown');
    const card: KanbanCard = {
      id: String(app.id),
      company,
      role: String(job.title ?? 'Role'),
      salary: formatSalaryRange(job.salaryRange),
      date: String(app.createdAt ?? new Date().toISOString()).split('T')[0],
      match: Number(job.matchScore ?? 50),
      notes: String(app.notes ?? ''),
      logo: String(job.companyLogo ?? company.slice(0, 2).toUpperCase()),
      goalId: app.goalId ? String(app.goalId) : undefined,
    };
    const col = STATUS_TO_COL[String(app.status)] ?? 'saved';
    data[col].push(card);
  }
  return data;
}

export function apiPortfolioToLegacy(p: Record<string, unknown>) {
  const tech = (p.technologies as string[]) ?? [];
  const title = String(p.title ?? '');
  return {
    id: toLegacyId(String(p.id)),
    apiId: String(p.id),
    title,
    desc: String(p.description ?? ''),
    url: String(p.demoUrl ?? ''),
    repo: String(p.repoUrl ?? ''),
    tech,
    year: p.createdAt ? String(p.createdAt).split('T')[0].slice(0, 4) : new Date().getFullYear().toString(),
    image: title.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'PR',
    featured: Boolean(p.featured),
    status: String(p.status ?? 'in_progress'),
  };
}

export function apiResumeToLegacy(r: Record<string, unknown>) {
  const sections = (r.sections as Record<string, unknown>[]) ?? [];
  return {
    id: String(r.id),
    title: String(r.title ?? 'Resume'),
    version: Number(r.version ?? 1),
    atsScore: Number(r.atsScore ?? 0),
    detectedKeywords: (r.detectedKeywords as string[]) ?? [],
    missingKeywords: (r.missingKeywords as string[]) ?? [],
    suggestions: (r.suggestions as string[]) ?? [],
    sections: sections.map((s) => ({
      id: String(s.id),
      type: String(s.type),
      title: String(s.title),
      content: String(s.content ?? ''),
      order: Number(s.order ?? 0),
    })),
    updatedAt: String(r.updatedAt ?? r.createdAt ?? new Date().toISOString()),
  };
}

export function apiConversationToLegacy(c: Record<string, unknown>): Conversation {
  return {
    id: String(c.id),
    title: String(c.title ?? 'Conversation'),
    date: String(c.updatedAt ?? c.createdAt ?? new Date().toISOString()).split('T')[0],
    preview: String(c.context ?? 'Career coaching session'),
  };
}

export function apiMessageToLegacy(m: Record<string, unknown>): Message {
  return {
    id: String(m.id),
    role: String(m.role) === 'user' ? 'user' : 'ai',
    content: String(m.content ?? ''),
    timestamp: new Date(String(m.createdAt ?? Date.now())),
  };
}

export function apiCommunityPostToLegacy(p: Record<string, unknown>, index: number) {
  const tags = (p.tags as string[]) ?? [];
  const title = String(p.title ?? '');
  const author = String(p.authorName ?? 'Member');
  return {
    id: toLegacyId(String(p.id ?? index)),
    apiId: String(p.id ?? index),
    title,
    author,
    avatar: author.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'MB',
    category: tags[0] ?? 'general',
    replies: Number(p.commentCount ?? 0),
    likes: Number(p.reactionCount ?? 0),
    time: formatRelativeTime(String(p.createdAt ?? new Date().toISOString())),
    pinned: Boolean(p.isPinned),
    solved: false,
    body: String(p.body ?? ''),
    tags,
  };
}

export function apiAchievementDefToLegacy(d: Record<string, unknown>, earned?: Record<string, unknown>) {
  return {
    id: String(d.id),
    defId: String(d.id),
    title: String(d.name),
    desc: String(d.description),
    icon: String(d.icon ?? '🏆'),
    category: String(d.category),
    criteria: String(d.criteria),
    unlocked: Boolean(earned),
    unlockedDate: earned?.unlockedAt ? String(earned.unlockedAt).split('T')[0] : undefined,
    earnedId: earned?.id ? String(earned.id) : undefined,
    seen: Boolean(earned?.seen),
  };
}

export function apiBadgeDefToLegacy(d: Record<string, unknown>, earned?: Record<string, unknown>) {
  return {
    id: String(d.id),
    defId: String(d.id),
    title: String(d.name),
    description: String(d.description),
    icon: String(d.icon ?? '🏅'),
    rarity: String(d.rarity ?? 'bronze'),
    category: String(d.category),
    requirements: String(d.requirements),
    earned: Boolean(earned),
    earnedAt: earned?.earnedAt ? String(earned.earnedAt) : undefined,
    earnedId: earned?.id ? String(earned.id) : undefined,
    seen: Boolean(earned?.seen),
  };
}

export function apiProgressToOutcomes(p: Record<string, unknown>): OutcomeMetrics {
  return {
    totalApplications: Number(p.totalApplications ?? p.ongoingApplications ?? 0),
    totalInterviews: Number(p.totalInterviews ?? p.upcomingInterviews ?? 0),
    totalOffers: Number(p.totalOffers ?? p.pendingOffers ?? 0),
    interviewsCompleted: Number(p.interviewsCompleted ?? 0),
    negotiationsCompleted: Number(p.negotiationsCompleted ?? 0),
  };
}

export function apiMetricsToScores(m: Record<string, unknown>) {
  return {
    careerScore: Number(m.overallScore ?? 0),
    skillsScore: Number(m.skillsScore ?? 0),
    applicationScore: Number(m.applicationScore ?? 0),
    resumeScore: Number(m.resumeScore ?? 0),
    goalScore: Number(m.goalScore ?? 0),
  };
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString();
}
