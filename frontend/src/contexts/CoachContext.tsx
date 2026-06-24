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
import { apiConversationToLegacy, apiMessageToLegacy } from '@/lib/api-mappers';
import type { Conversation, Message } from '@/data/types';
import { useAuth } from './AuthContext';

interface CoachContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  loading: boolean;
  setActiveConversationId: (id: string | null) => void;
  refreshConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  startConversation: (title?: string) => Promise<string>;
  sendMessage: (content: string) => Promise<void>;
}

const CoachContext = createContext<CoachContextType | null>(null);

export function CoachProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshConversations = useCallback(async () => {
    if (!authed) return;
    try {
      const data = await api.getConversations();
      setConversations(data.map((c) => apiConversationToLegacy(c)));
    } catch {
      setConversations([]);
    }
  }, [authed]);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  const loadConversation = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getConversation(id);
      const msgs = ((data.messages as Record<string, unknown>[]) ?? []).map(apiMessageToLegacy);
      setMessages(msgs);
      setActiveConversationId(id);
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const startConversation = useCallback(async (title?: string) => {
    try {
      const conv = await api.createConversation({ title: title ?? 'New conversation' });
      const id = String(conv.id);
      await refreshConversations();
      setActiveConversationId(id);
      setMessages([]);
      return id;
    } catch {
      toast.error('Failed to start conversation');
      throw new Error('Failed to start conversation');
    }
  }, [refreshConversations]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    let convId = activeConversationId;
    if (!convId) {
      convId = await startConversation();
    }
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setLoading(true);
    try {
      const res = await api.sendMessage(convId, content);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        apiMessageToLegacy(res.userMessage),
        apiMessageToLegacy(res.assistantMessage),
      ]);
      await refreshConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [activeConversationId, startConversation, refreshConversations]);

  return (
    <CoachContext.Provider
      value={{
        conversations,
        messages,
        activeConversationId,
        loading,
        setActiveConversationId,
        refreshConversations,
        loadConversation,
        startConversation,
        sendMessage,
      }}
    >
      {children}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error('useCoach must be used within CoachProvider');
  return ctx;
}
