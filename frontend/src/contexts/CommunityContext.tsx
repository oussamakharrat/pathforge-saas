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
import { apiCommunityPostToLegacy } from '@/lib/api-mappers';
import { useAuth } from './AuthContext';

export type CommunityThread = ReturnType<typeof apiCommunityPostToLegacy>;

interface CommunityContextType {
  threads: CommunityThread[];
  loading: boolean;
  refresh: () => Promise<void>;
  createThread: (title: string, category: string, body?: string) => Promise<void>;
  likeThread: (apiId: string) => Promise<void>;
  loadThread: (apiId: string) => Promise<Record<string, unknown> | null>;
  addComment: (postId: string, body: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [threads, setThreads] = useState<CommunityThread[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const data = await api.getCommunityPosts();
      setThreads(data.map((p, i) => apiCommunityPostToLegacy(p, i)));
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [authed]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  const createThread = useCallback(async (title: string, category: string, body = '') => {
    try {
      await api.createCommunityPost({ title, body: body || title, tags: [category] });
      toast.success('Discussion posted');
      await refresh();
    } catch {
      toast.error('Failed to create post');
    }
  }, [refresh]);

  const likeThread = useCallback(async (apiId: string) => {
    try {
      await api.reactToPost(apiId, 'like');
      await refresh();
    } catch {
      toast.error('Failed to react');
    }
  }, [refresh]);

  const loadThread = useCallback(async (apiId: string) => {
    try {
      return await api.getCommunityPost(apiId);
    } catch {
      toast.error('Failed to load thread');
      return null;
    }
  }, []);

  const addComment = useCallback(async (postId: string, body: string) => {
    try {
      await api.createCommunityComment(postId, body);
      toast.success('Comment posted');
      await refresh();
    } catch {
      toast.error('Failed to post comment');
    }
  }, [refresh]);

  return (
    <CommunityContext.Provider value={{ threads, loading, refresh, createThread, likeThread, loadThread, addComment }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
  return ctx;
}
