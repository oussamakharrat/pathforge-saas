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
import { apiPortfolioToLegacy } from '@/lib/api-mappers';
import { useAuth } from './AuthContext';

export type PortfolioProject = ReturnType<typeof apiPortfolioToLegacy>;

interface PortfolioContextType {
  projects: PortfolioProject[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveProject: (data: {
    apiId?: string;
    title: string;
    desc: string;
    url: string;
    repo: string;
    tech: string[];
    year: string;
    featured: boolean;
  }) => Promise<void>;
  deleteProject: (apiId: string) => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

function normalizeExternalUrl(url: string): string {
  if (!url.trim()) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const data = await api.getPortfolio();
      setProjects(data.map((p) => apiPortfolioToLegacy(p)));
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  const saveProject = useCallback(async (data: Parameters<PortfolioContextType['saveProject']>[0]) => {
    try {
      const payload = {
        title: data.title.trim(),
        description: data.desc.trim(),
        demoUrl: normalizeExternalUrl(data.url),
        repoUrl: normalizeExternalUrl(data.repo),
        technologies: data.tech,
        featured: data.featured,
        status: 'completed',
      };
      if (data.apiId) {
        await api.updatePortfolioProject(data.apiId, payload);
        toast.success('Project updated');
      } else {
        await api.createPortfolioProject(payload);
        toast.success('Project added to your portfolio');
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save project');
      throw err;
    }
  }, [refresh]);

  const deleteProject = useCallback(async (apiId: string) => {
    try {
      await api.deletePortfolioProject(apiId);
      toast.success('Project removed');
      await refresh();
    } catch {
      toast.error('Failed to delete project');
    }
  }, [refresh]);

  return (
    <PortfolioContext.Provider value={{ projects, loading, refresh, saveProject, deleteProject }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
