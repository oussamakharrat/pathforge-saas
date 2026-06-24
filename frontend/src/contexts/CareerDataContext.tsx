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
import type { Goal, Skill, LearningStep, OutcomeMetrics, QuizResult } from '../data/types';
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

interface CareerDataContextType {
  goals: Goal[];
  skills: Skill[];
  learningSteps: LearningStep[];
  outcomes: OutcomeMetrics;
  quizResults: QuizResult[];
  purchasedServices: string[];
  loading: boolean;
  dashboardMetrics: ReturnType<typeof apiMetricsToScores>;
  setGoals: (goals: Goal[]) => void;
  setSkills: (skills: Skill[]) => void;
  setLearningSteps: (steps: LearningStep[]) => void;
  refresh: () => Promise<void>;
  toggleStep: (stepId: number) => void;
  addGoal: (title: string, deadline: string) => void;
  updateGoal: (id: number, updates: Partial<Pick<Goal, 'title' | 'deadline'>>) => void;
  deleteGoal: (id: number) => void;
  addSkill: (name: string, cat: string, level: string, pct: number) => void;
  updateSkill: (name: string, updates: Partial<Pick<Skill, 'level' | 'pct' | 'cat'>>) => void;
  deleteSkill: (name: string) => void;
  deleteLearningStep: (stepId: number) => void;
  trackApplication: () => void;
  trackInterview: () => void;
  trackOffer: () => void;
  completeMockInterview: () => void;
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

export function CareerDataProvider({ children }: { children: ReactNode }) {
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
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [purchasedServices, setPurchasedServices] = useState<string[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(apiMetricsToScores({}));
  const [jobMatchInsights, setJobMatchInsights] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  const { addNotification } = useNotifications();
  const { authed } = useAuth();
  const { referenceSkills } = useGamification();

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
      setSkills(skillsData.map(apiSkillToLegacy));
      const steps: LearningStepMeta[] = [];
      for (const plan of plansData) {
        for (const item of (plan.items as Record<string, unknown>[]) ?? []) {
          steps.push(apiLearningItemToLegacy(item, String(plan.id)));
        }
      }
      setLearningSteps(steps);
      setOutcomes(apiProgressToOutcomes(progress));
      setDashboardMetrics(apiMetricsToScores(metrics));
      setJobMatchInsights(insights);
    } catch {
      /* keep current state */
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
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
  }, [authed, refresh]);

  const toggleStep = useCallback((stepId: number) => {
    const step = learningSteps.find((s) => s.id === stepId);
    if (!step?.planId || !step.itemId) return;
    void api.toggleLearningItem(step.planId, step.itemId, !step.done)
      .then(() => refresh())
      .catch(() => toast.error('Failed to update learning step'));
  }, [learningSteps, refresh]);

  const addGoal = useCallback((title: string, deadline: string) => {
    void api.createGoal({ title, targetDate: deadline })
      .then(() => {
        toast.success('Goal created!');
        addNotification('goal_created', `New Goal: ${title}`, `Goal "${title}" created.`, '/app/goals');
        return refresh();
      })
      .catch(() => toast.error('Failed to create goal'));
  }, [addNotification, refresh]);

  const updateGoal = useCallback((id: number, updates: Partial<Pick<Goal, 'title' | 'deadline'>>) => {
    const apiId = toApiId(id);
    if (!apiId) return;
    void api.updateGoal(apiId, {
      title: updates.title,
      targetDate: updates.deadline,
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
    if (!catalog) {
      toast.error(`"${name}" is not in the skill catalog.`);
      return;
    }
    void api.upsertSkill({
      skillCatalogId: catalog.id,
      currentLevel: pct,
      targetLevel: Math.min(100, pct + 20),
    })
      .then(() => {
        toast.success(`"${name}" added to your skills!`);
        return refresh();
      })
      .catch(() => toast.error('Failed to add skill'));
  }, [referenceSkills, refresh]);

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

  const deleteSkill = useCallback((_name: string) => {
    toast.info('Remove skill is not supported by the API yet.');
  }, []);

  const deleteLearningStep = useCallback((_stepId: number) => {
    toast.info('Remove learning step is not supported by the API yet.');
  }, []);

  const trackApplication = useCallback(() => {
    void refresh();
  }, [refresh]);

  const trackInterview = useCallback(() => {
    void refresh();
  }, [refresh]);

  const trackOffer = useCallback(() => {
    void refresh();
  }, [refresh]);

  const completeMockInterview = useCallback(() => {
    void refresh().then(() =>
      addNotification('milestone_reached', 'Mock Interview Complete', 'Mock interview recorded.', '/app/interview'),
    );
  }, [refresh, addNotification]);

  const completeNegotiation = useCallback(() => {
    void refresh().then(() =>
      addNotification('milestone_reached', 'Negotiation Complete', 'Negotiation session completed.', '/app/negotiate'),
    );
  }, [refresh, addNotification]);

  const submitQuiz = useCallback((skillName: string, correct: number, total: number) => {
    const pct = Math.round((correct / total) * 100);
    setQuizResults((prev) => [...prev, { skillName, correct, total, pct, date: new Date().toISOString() }]);
    updateSkill(skillName, { pct: Math.max(10, pct) });
    toast.success(`${skillName} quiz complete — ${correct}/${total} correct (${pct}%)`);
  }, [updateSkill]);

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
    setPurchasedServices((prev) => [...prev, name]);
    toast.success(`${name} purchased!`);
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
