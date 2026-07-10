'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  apiApplicationsToKanban,
  COL_TO_STATUS,
  type LearningStepMeta,
} from '@/lib/api-mappers';
import type { KanbanCard, KanbanCol } from '@/data/types';
import { useAuth } from './AuthContext';

const EMPTY_KANBAN = (): Record<KanbanCol, KanbanCard[]> => ({
  saved: [],
  applied: [],
  screening: [],
  interview: [],
  final: [],
  offer: [],
  rejected: [],
});

interface JobsContextType {
  kanban: Record<KanbanCol, KanbanCard[]>;
  loading: boolean;
  refreshApplications: () => Promise<void>;
  updateApplicationNotes: (cardId: string, notes: string) => Promise<void>;
  moveCard: (cardId: string, from: KanbanCol, to: KanbanCol) => Promise<void>;
  addCard: (col: KanbanCol, card: Omit<KanbanCard, 'id'>, goalId?: string) => Promise<void>;
  removeCard: (cardId: string, col: KanbanCol) => Promise<void>;
  jobMatchInsights: Record<string, unknown>[];
}

const JobsContext = createContext<JobsContextType | null>(null);

export function JobsProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [kanban, setKanban] = useState(EMPTY_KANBAN);
  const [loading, setLoading] = useState(false);
  const [jobMatchInsights, setJobMatchInsights] = useState<Record<string, unknown>[]>([]);

  const refreshApplications = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const [apps, insights] = await Promise.all([
        api.getApplications(),
        api.getJobMatchInsights().catch(() => []),
      ]);
      setKanban(apiApplicationsToKanban(apps));
      setJobMatchInsights(insights);
    } catch {
      setKanban(EMPTY_KANBAN());
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    queueMicrotask(() => { void refreshApplications(); });
  }, [refreshApplications]);

  const moveCard = useCallback(async (cardId: string, from: KanbanCol, to: KanbanCol) => {
    const card = kanban[from].find((c) => c.id === cardId);
    if (!card) return;
    setKanban((prev) => ({
      ...prev,
      [from]: prev[from].filter((c) => c.id !== cardId),
      [to]: [...prev[to], card],
    }));
    try {
      await api.updateApplicationStatus(cardId, COL_TO_STATUS[to]);
    } catch {
      toast.error('Failed to update application status');
      void refreshApplications();
    }
  }, [kanban, refreshApplications]);

  const addCard = useCallback(async (col: KanbanCol, card: Omit<KanbanCard, 'id'>, goalId?: string) => {
    try {
      const job = await api.createJobPosting({
        company: card.company,
        title: card.role,
        salaryRange: { display: card.salary },
        companyLogo: card.logo,
        matchScore: card.match,
      });
      const app = await api.createApplication({
        jobId: job.id,
        notes: card.notes,
        status: COL_TO_STATUS[col],
        goalId,
      });
      const jobData = (app.job as Record<string, unknown>) ?? job;
      const newCard: KanbanCard = {
        id: String(app.id),
        company: card.company,
        role: card.role,
        salary: card.salary,
        date: new Date().toISOString().split('T')[0],
        match: Number(jobData.matchScore ?? card.match),
        notes: card.notes,
        logo: card.logo,
      };
      setKanban((prev) => ({ ...prev, [col]: [...prev[col], newCard] }));
      toast.success(`${card.company} added to tracker`);
    } catch {
      toast.error('Failed to add application');
    }
  }, []);

  const removeCard = useCallback(async (cardId: string, col: KanbanCol) => {
    setKanban((prev) => ({
      ...prev,
      [col]: prev[col].filter((c) => c.id !== cardId),
    }));
    try {
      await api.deleteApplication(cardId);
      toast.success('Application removed');
    } catch {
      void refreshApplications();
    }
  }, [refreshApplications]);

  const updateApplicationNotes = useCallback(async (cardId: string, notes: string) => {
    await api.updateApplicationNotes(cardId, notes);
    setKanban((prev) => {
      const next = { ...prev };
      for (const col of Object.keys(next) as KanbanCol[]) {
        next[col] = next[col].map((c) => (c.id === cardId ? { ...c, notes } : c));
      }
      return next;
    });
  }, []);

  return (
    <JobsContext.Provider
      value={{ kanban, loading, refreshApplications, moveCard, addCard, removeCard, updateApplicationNotes, jobMatchInsights }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const ctx = useContext(JobsContext);
  if (!ctx) throw new Error('useJobs must be used within JobsProvider');
  return ctx;
}

export type { LearningStepMeta };
