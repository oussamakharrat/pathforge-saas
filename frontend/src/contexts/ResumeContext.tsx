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
import { apiResumeToLegacy } from '@/lib/api-mappers';
import { useAuth } from './AuthContext';

export type ResumeData = ReturnType<typeof apiResumeToLegacy>;

interface ResumeContextType {
  resumes: ResumeData[];
  loading: boolean;
  refresh: () => Promise<void>;
  createResume: (title: string, sections?: { type: string; title: string; content: string }[]) => Promise<ResumeData | null>;
  updateResume: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  addSection: (resumeId: string, section: { type: string; title: string; content: string }) => Promise<void>;
  updateSection: (resumeId: string, sectionId: string, data: { title?: string; content?: string }) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const data = await api.getResumes();
      setResumes(data.map((r) => apiResumeToLegacy(r)));
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  const createResume = useCallback(async (title: string, sections?: { type: string; title: string; content: string }[]) => {
    try {
      const created = await api.createResume({ title, sections: sections ?? [] });
      toast.success('Resume created');
      await refresh();
      return apiResumeToLegacy(created);
    } catch {
      toast.error('Failed to create resume');
      return null;
    }
  }, [refresh]);

  const addSection = useCallback(async (resumeId: string, section: { type: string; title: string; content: string }) => {
    try {
      await api.addResumeSection(resumeId, section);
      toast.success('Section added');
      await refresh();
    } catch {
      toast.error('Failed to add section');
    }
  }, [refresh]);

  const updateSection = useCallback(async (resumeId: string, sectionId: string, data: { title?: string; content?: string }) => {
    try {
      await api.updateResumeSection(resumeId, sectionId, data);
      await refresh();
    } catch {
      toast.error('Failed to update section');
    }
  }, [refresh]);

  const updateResume = useCallback(async (id: string, data: Record<string, unknown>) => {
    try {
      await api.updateResume(id, data);
      await refresh();
    } catch {
      toast.error('Failed to update resume');
    }
  }, [refresh]);

  const deleteResume = useCallback(async (id: string) => {
    try {
      await api.deleteResume(id);
      toast.success('Resume deleted');
      await refresh();
    } catch {
      toast.error('Failed to delete resume');
    }
  }, [refresh]);

  return (
    <ResumeContext.Provider value={{ resumes, loading, refresh, createResume, updateResume, deleteResume, addSection, updateSection }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
