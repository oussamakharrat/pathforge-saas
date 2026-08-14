'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import type { Goal, Skill, LearningStep, OutcomeMetrics, QuizResult, ScoreSnapshot } from '../data/types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import {
  apiGoalToLegacy,
  apiSkillToLegacy,
  apiLearningItemToLegacy,
  apiProgressToOutcomes,
  apiMetricsToScores,
  type LearningStepMeta,
  type SkillMeta,
} from '@/lib/api-mappers';
import { toApiId, clearIdRegistry } from '@/lib/id-registry';
import {
  createUser,
  createCareerProfile,
} from '@/domain';
import type { User, Skill as DomainSkill, Goal as DomainGoal } from '@/domain/entities';
import { computeCareerMetrics } from '@/domain/services/career-progression.service';
import type { ProgressionInput } from '@/domain/services/career-progression.service';
import { buildRelationshipGraph, buildImpactChains } from '@/domain/services/relationship-graph.service';
import { fromLegacySkill, fromLegacyGoal } from '../domain-adapter/adapters';
import type { RelationshipLink, ImpactChain } from '@/domain/services';
import { useGamification } from './GamificationContext';
import { usePersistedState } from '@/hooks/usePersistedState';

interface CareerDataContextType {
  goals: Goal[];
  skills: Skill[];
  learningSteps: LearningStep[];
  outcomes: OutcomeMetrics;
  quizResults: QuizResult[];
  scoreHistory: ScoreSnapshot[];
  purchasedServices: string[];
  loading: boolean;
  dashboardMetrics: ReturnType<typeof apiMetricsToScores>;
  setGoals: (goals: Goal[]) => void;
  setSkills: (skills: Skill[]) => void;
  setLearningSteps: (steps: LearningStep[]) => void;
  refresh: () => Promise<void>;
  toggleStep: (stepId: number) => void;
  addGoal: (title: string, deadline: string, skillCatalogIds?: string[]) => void;
  updateGoal: (id: number, updates: Partial<Pick<Goal, 'title' | 'deadline'>> & { skillCatalogIds?: string[] }) => void;
  deleteGoal: (id: number) => void;
  addSkill: (name: string, cat: string, level: string, pct: number) => void;
  updateSkill: (name: string, updates: Partial<Pick<Skill, 'level' | 'pct' | 'cat'>>) => void;
  deleteSkill: (name: string) => void;
  deleteLearningStep: (stepId: number) => void;
  deleteLearningPlan: (goalLegacyId: number) => Promise<void>;
  addMilestone: (goalId: number, title: string) => void;
  addLearningItem: (goalLegacyId: number | null, title: string, tag: string) => void;
  toggleMilestone: (goalId: number, milestoneId: string, completed?: boolean) => void;
  trackApplication: () => void;
  trackInterview: () => void;
  trackOffer: () => void;
  completeMockInterview: (payload: {
    company: string;
    role: string;
    type: string;
    score: number;
    feedback: string;
    answers: { q: string; a: string; score: number; feedback: string }[];
  }) => Promise<void>;
  completeNegotiation: () => void;
  submitQuiz: (skillName: string, correct: number, total: number) => void;
  recalculateJobMatch: (company: string, currentSkillPcts: { name: string; pct: number }[]) => number;
  careerScore: number;
  avgGoalProgress: number;
  avgSkillPct: number;
  purchaseService: (name: string) => void;
  domainUser: User;
  relationshipLinks: RelationshipLink[];
  impactChains: ImpactChain[];
  domainSkills: DomainSkill[];
  domainGoals: DomainGoal[];
  recomputeCareerMetrics: () => void;
}

const CareerDataContext = createContext<CareerDataContextType | null>(null);

function normalizeTargetDate(deadline: string): string | undefined {
  if (!deadline) return undefined;
  if (/^\d{4}-\d{2}$/.test(deadline)) return `${deadline}-01`;
  return deadline;
}

export function CareerDataProvider({ children }: { children: ReactNode }) {
  const { addNotification } = useNotifications();
  const { authed, profile } = useAuth();
  const { referenceSkills, refresh: refreshReferenceSkills, refresh: refreshGamification } = useGamification();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [learningSteps, setLearningSteps] = useState<LearningStepMeta[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeMetrics>({
    totalApplications: 0,
    totalInterviews: 0,
    totalOffers: 0,
    interviewsCompleted: 0,
    negotiationsCompleted: 0,
  });
  const [quizResults, setQuizResults] = usePersistedState<QuizResult[]>(
    profile?.email ? `pathforge-quiz-${profile.email}` : 'pathforge-quiz',
    [],
  );
  const [scoreHistory, setScoreHistory] = usePersistedState<ScoreSnapshot[]>(
    profile?.email ? `pathforge-scores-${profile.email}` : 'pathforge-scores',
    [],
  );
  const [purchasedServices, setPurchasedServices] = useState<string[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(apiMetricsToScores({}));
  const [jobMatchInsights, setJobMatchInsights] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    clearIdRegistry();
    try {
      const [goalsData, skillsData, plansData, progress, metrics, insights] = await Promise.all([
        api.getGoals(),
        api.getSkills(),
        api.getLearningPlans(),
        api.getDashboardProgress(),
        api.getDashboardMetrics(),
        api.getJobMatchInsights().catch(() => []),
      ]);
      setGoals(goalsData.map(apiGoalToLegacy));
      const mappedSkills = skillsData.map(apiSkillToLegacy);
      setSkills(mappedSkills);
      const steps: LearningStepMeta[] = [];
      for (const plan of plansData) {
        const goalId = plan.goalId ? String(plan.goalId) : undefined;
        for (const item of (plan.items as Record<string, unknown>[]) ?? []) {
          steps.push(apiLearningItemToLegacy(item, String(plan.id), goalId));
        }
      }
      setLearningSteps(steps);
      const progressOutcomes = apiProgressToOutcomes(progress);
      setOutcomes(progressOutcomes);
      const metricsScores = apiMetricsToScores(metrics);
      setDashboardMetrics(metricsScores);
      setJobMatchInsights(insights);
      const avgSkill = mappedSkills.length
        ? Math.round(mappedSkills.reduce((s, k) => s + k.pct, 0) / mappedSkills.length)
        : 0;
      const today = new Date().toISOString().split('T')[0];
      const snapshotScore = metricsScores.careerScore;
      setScoreHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last?.date === today && last.score === snapshotScore) return prev;
        return [...prev.slice(-89), {
          date: today,
          score: snapshotScore,
          skills: avgSkill,
          applications: progressOutcomes.totalApplications,
        }];
      });
    } catch {
      /* keep current state */
    } finally {
      setLoading(false);
    }
  }, [authed, setScoreHistory]);

  useEffect(() => {
    queueMicrotask(() => {
      if (profile?.purchasedServices) {
        setPurchasedServices(profile.purchasedServices);
      }
    });
  }, [profile?.purchasedServices]);

  useEffect(() => {
    queueMicrotask(() => {
      if (authed) void refresh();
      else {
        clearIdRegistry();
        setGoals([]);
        setSkills([]);
        setLearningSteps([]);
        setOutcomes({
          totalApplications: 0,
          totalInterviews: 0,
          totalOffers: 0,
          interviewsCompleted: 0,
          negotiationsCompleted: 0,
        });
        setQuizResults([]);
        setPurchasedServices([]);
      }
    });
  }, [authed, refresh]);

  const toggleStep = useCallback((stepId: number) => {
    const step = learningSteps.find((s) => s.id === stepId);
    if (!step?.planId || !step.itemId) return;
    void api.toggleLearningItem(step.planId, step.itemId, !step.done)
      .then(() => refresh())
      .catch(() => toast.error('Failed to update learning step'));
  }, [learningSteps, refresh]);

  const addGoal = useCallback((title: string, deadline: string, skillCatalogIds?: string[]) => {
    void api.createGoal({
      title,
      targetDate: normalizeTargetDate(deadline),
      ...(skillCatalogIds?.length ? { skillCatalogIds } : {}),
    })
      .then(() => {
        toast.success('Goal created!');
        addNotification('goal_created', `New Goal: ${title}`, `Goal "${title}" created.`, '/app/goals');
        return refresh();
      })
      .catch(() => toast.error('Failed to create goal'));
  }, [addNotification, refresh]);

  const updateGoal = useCallback((id: number, updates: Partial<Pick<Goal, 'title' | 'deadline'>> & { skillCatalogIds?: string[] }) => {
    const apiId = toApiId(id);
    if (!apiId) return;
    void api.updateGoal(apiId, {
      title: updates.title,
      targetDate: updates.deadline ? normalizeTargetDate(updates.deadline) : undefined,
      ...(updates.skillCatalogIds ? { skillCatalogIds: updates.skillCatalogIds } : {}),
    })
      .then(() => {
        toast.success('Goal updated!');
        return refresh();
      })
      .catch(() => toast.error('Failed to update goal'));
  }, [refresh]);

  const deleteGoal = useCallback((id: number) => {
    const apiId = toApiId(id);
    if (!apiId) return;
    void api.deleteGoal(apiId)
      .then(() => {
        toast.success('Goal deleted.');
        return refresh();
      })
      .catch(() => toast.error('Failed to delete goal'));
  }, [refresh]);

  const addSkill = useCallback((name: string, cat: string, _level: string, pct: number) => {
    const catalog = referenceSkills.find(
      (s) => String(s.name).toLowerCase() === name.toLowerCase(),
    );
    void api.upsertSkill({
      skillCatalogId: catalog ? String(catalog.id) : undefined,
      name: catalog ? undefined : name,
      category: cat,
      currentLevel: pct,
      targetLevel: Math.min(100, pct + 20),
    })
      .then(() => {
        toast.success(`"${name}" added to your skills!`);
        void refreshReferenceSkills();
        return refresh();
      })
      .catch(() => toast.error('Failed to add skill'));
  }, [referenceSkills, refresh, refreshReferenceSkills]);

  const updateSkill = useCallback((name: string, updates: Partial<Pick<Skill, 'level' | 'pct' | 'cat'>>) => {
    const skill = skills.find((s) => s.name === name) as SkillMeta | undefined;
    if (!skill?.userSkillId) return;
    void api.updateSkill(skill.userSkillId, {
      currentLevel: updates.pct,
      targetLevel: Math.min(100, (updates.pct ?? skill.pct) + 10),
    })
      .then(() => {
        toast.success(`"${name}" updated!`);
        return refresh();
      })
      .catch(() => toast.error('Failed to update skill'));
  }, [skills, refresh]);

  const deleteSkill = useCallback((name: string) => {
    const skill = skills.find((s) => s.name === name) as SkillMeta | undefined;
    if (!skill?.userSkillId) return;
    void api.deleteSkill(skill.userSkillId)
      .then(() => {
        toast.success(`"${name}" removed from your skills.`);
        void refreshReferenceSkills();
        return refresh();
      })
      .catch(() => toast.error('Failed to remove skill'));
  }, [skills, refresh, refreshReferenceSkills]);

  const deleteLearningStep = useCallback((stepId: number) => {
    const step = learningSteps.find((s) => s.id === stepId);
    if (!step?.planId || !step.itemId) return;
    void api.deleteLearningItem(step.planId, step.itemId)
      .then(() => {
        toast.success('Learning step removed.');
        return refresh();
      })
      .catch(() => toast.error('Failed to remove learning step'));
  }, [learningSteps, refresh]);

  const deleteLearningPlan = useCallback(async (goalLegacyId: number) => {
    try {
      const plans = await api.getLearningPlans();
      const plan = plans.find((p) => {
        const gid = p.goalId ? String(p.goalId) : '';
        return gid && toApiId(goalLegacyId) === gid;
      });
      if (!plan) {
        toast.error('No learning plan found for this goal');
        return;
      }
      await api.deleteLearningPlan(String(plan.id));
      toast.success('Learning plan deleted');
      await refresh();
    } catch {
      toast.error('Failed to delete learning plan');
    }
  }, [refresh]);

  const addMilestone = useCallback((goalId: number, title: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal?.apiId) return;
    void api.addMilestone(goal.apiId, title)
      .then(() => {
        toast.success('Milestone added!');
        return refresh();
      })
      .catch(() => toast.error('Failed to add milestone'));
  }, [goals, refresh]);

  const addLearningItem = useCallback((goalLegacyId: number | null, title: string, tag: string) => {
    void api.getLearningPlans().then((plans) => {
      const plan = goalLegacyId
        ? plans.find((p) => {
            const gid = p.goalId ? String(p.goalId) : '';
            return gid && toApiId(goalLegacyId) === gid;
          })
        : plans[0];
      if (!plan) {
        toast.error('No learning plan found for this goal');
        return;
      }
      return api.addLearningItem(String(plan.id), { title, tag })
        .then(() => {
          toast.success('Learning step added!');
          return refresh();
        });
    }).catch(() => toast.error('Failed to add learning step'));
  }, [refresh]);

  const toggleMilestone = useCallback((goalId: number, milestoneId: string, completed?: boolean) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal?.apiId) return;
    void api.toggleMilestone(goal.apiId, milestoneId, completed)
      .then(() => {
        toast.success('Milestone updated!');
        void refreshGamification();
        return refresh();
      })
      .catch(() => toast.error('Failed to update milestone'));
  }, [goals, refresh, refreshGamification]);

  const trackApplication = useCallback(() => {
    void refresh();
  }, [refresh]);

  const trackInterview = useCallback(() => {
    void refresh();
  }, [refresh]);

  const trackOffer = useCallback(() => {
    void refresh();
  }, [refresh]);

  const completeMockInterview = useCallback(async (payload: {
    company: string;
    role: string;
    type: string;
    score: number;
    feedback: string;
    answers: { q: string; a: string; score: number; feedback: string }[];
  }) => {
    try {
      await api.createMockInterview({
        company: payload.company,
        role: payload.role,
        type: payload.type,
        score: payload.score,
        feedback: payload.feedback,
        answers: payload.answers.map((a, i) => ({
          question: a.q,
          answer: a.a,
          score: a.score,
          feedback: a.feedback,
          order: i,
        })),
      });
      await refresh();
      await refreshGamification();
      addNotification('milestone_reached', 'Mock Interview Complete', 'Mock interview saved to your profile.', '/app/interview');
    } catch {
      toast.error('Failed to save mock interview');
    }
  }, [refresh, refreshGamification, addNotification]);

  const completeNegotiation = useCallback(() => {
    void refresh().then(() =>
      addNotification('milestone_reached', 'Negotiation Complete', 'Negotiation session completed.', '/app/negotiate'),
    );
  }, [refresh, addNotification]);

  const submitQuiz = useCallback((skillName: string, correct: number, total: number) => {
    const pct = Math.round((correct / total) * 100);
    setQuizResults((prev) => [...prev, { skillName, correct, total, pct, date: new Date().toISOString() }]);
    const skill = skills.find((s) => s.name === skillName);
    const boosted = Math.min(100, Math.max(skill?.pct ?? 10, pct));
    updateSkill(skillName, { pct: boosted, level: boosted >= 75 ? 'Advanced' : boosted >= 45 ? 'Intermediate' : 'Beginner' });
    toast.success(`${skillName} quiz complete — ${correct}/${total} correct (${pct}%)`);
    if (pct === 100) {
      addNotification('quiz_completed', 'Perfect Score!', `You scored 100% on the ${skillName} quiz.`, '/app/skills');
    } else if (pct >= 90) {
      addNotification('quiz_completed', 'Quiz Ace', `Strong ${pct}% on ${skillName}.`, '/app/skills');
    }
    void refreshGamification();
  }, [updateSkill, setQuizResults, skills, addNotification, refreshGamification]);

  const recalculateJobMatch = useCallback((_company: string, currentSkillPcts: { name: string; pct: number }[]) => {
    if (jobMatchInsights.length) {
      const best = jobMatchInsights.reduce((a, b) =>
        Number(a.matchPercentage ?? 0) > Number(b.matchPercentage ?? 0) ? a : b,
      );
      return Number(best.matchPercentage ?? 50);
    }
    const avg = currentSkillPcts.length
      ? currentSkillPcts.reduce((s, k) => s + k.pct, 0) / currentSkillPcts.length
      : 0;
    return Math.min(99, Math.max(10, Math.round(avg * 0.7 + 25)));
  }, [jobMatchInsights]);

  const avgGoalProgress = useMemo(
    () => (goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0),
    [goals],
  );

  const avgSkillPct = useMemo(
    () => (skills.length ? Math.round(skills.reduce((s, k) => s + k.pct, 0) / skills.length) : 0),
    [skills],
  );

  const domainUser = useMemo<User>(() => {
    const user = createUser();
    user.skills = skills.map((legacy) => fromLegacySkill(legacy));
    user.goals = goals.map((legacy) => fromLegacyGoal(legacy));
    user.profile = createCareerProfile();
    return user;
  }, [skills, goals]);

  const progressionInput = useMemo<ProgressionInput>(() => ({
    skills: domainUser.skills,
    goals: domainUser.goals,
    learningPlans: [],
    applications: [],
    interviews: [],
    negotiations: [],
    portfolio: [],
    achievements: [],
  }), [domainUser]);

  const computedMetrics = useMemo(() => computeCareerMetrics(progressionInput), [progressionInput]);
  const careerScore = dashboardMetrics.careerScore || computedMetrics.careerScore;

  const relationshipLinks = useMemo(
    () => buildRelationshipGraph({
      skills: domainUser.skills,
      goals: domainUser.goals,
      learningPlans: [],
      applications: [],
      interviews: [],
      portfolio: [],
      services: [],
    }),
    [domainUser],
  );

  const impactChains = useMemo(() => buildImpactChains(relationshipLinks), [relationshipLinks]);

  const purchaseService = useCallback((name: string) => {
    if (purchasedServices.includes(name)) return;
    void api.purchaseService(name)
      .then((me) => {
        const cp = (me.careerProfile as Record<string, unknown>) ?? {};
        setPurchasedServices((cp.purchasedServices as string[]) ?? [...purchasedServices, name]);
        toast.success(`${name} purchased!`);
      })
      .catch(() => toast.error('Failed to purchase service'));
  }, [purchasedServices]);

  const recomputeCareerMetrics = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <CareerDataContext.Provider
      value={{
        goals,
        skills,
        learningSteps,
        outcomes,
        quizResults,
        scoreHistory,
        purchasedServices,
        loading,
        dashboardMetrics,
        setGoals,
        setSkills,
        setLearningSteps,
        refresh,
        toggleStep,
        addGoal,
        updateGoal,
        deleteGoal,
        addSkill,
        updateSkill,
        deleteSkill,
        deleteLearningStep,
        deleteLearningPlan,
        addMilestone,
        addLearningItem,
        toggleMilestone,
        trackApplication,
        trackInterview,
        trackOffer,
        completeMockInterview,
        completeNegotiation,
        submitQuiz,
        recalculateJobMatch,
        careerScore,
        avgGoalProgress,
        avgSkillPct,
        purchaseService,
        domainUser,
        relationshipLinks,
        impactChains,
        domainSkills: domainUser.skills,
        domainGoals: domainUser.goals,
        recomputeCareerMetrics,
      }}
    >
      {children}
    </CareerDataContext.Provider>
  );
}

export function useCareerData() {
  const ctx = useContext(CareerDataContext);
  if (!ctx) throw new Error('useCareerData must be used within CareerDataProvider');
  return ctx;
}
