'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { apiAchievementDefToLegacy, apiBadgeDefToLegacy } from '@/lib/api-mappers';
import { useAuth } from './AuthContext';

export type AchievementItem = ReturnType<typeof apiAchievementDefToLegacy> & { iconKey?: string };
export type BadgeItem = ReturnType<typeof apiBadgeDefToLegacy>;

interface GamificationContextType {
  achievements: AchievementItem[];
  badges: BadgeItem[];
  referenceSkills: Record<string, unknown>[];
  loading: boolean;
  refresh: () => Promise<void>;
  streakDays: number;
  markAchievementSeen: (id: string) => Promise<void>;
  markBadgeSeen: (id: string) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [referenceSkills, setReferenceSkills] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  const refresh = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const [defsAch, defsBad, userAch, userBad, skills, profileData] = await Promise.all([
        api.getReferenceAchievements(),
        api.getReferenceBadges(),
        api.getAchievements(),
        api.getBadges(),
        api.getReferenceSkills(),
        api.getProfile(),
      ]);
      setStreakDays(profileData.streakDays ?? 0);
      const earnedAchMap = new Map(
        userAch.map((a) => {
          const def = a.achievementDefinition as Record<string, unknown>;
          return [String(def?.id ?? a.achievementDefinitionId), a];
        }),
      );
      const earnedBadMap = new Map(
        userBad.map((b) => {
          const def = b.badgeDefinition as Record<string, unknown>;
          return [String(def?.id ?? b.badgeDefinitionId), b];
        }),
      );
      setAchievements(
        defsAch.map((d) => apiAchievementDefToLegacy(d, earnedAchMap.get(String(d.id)) as Record<string, unknown>)),
      );
      setBadges(
        defsBad.map((d) => apiBadgeDefToLegacy(d, earnedBadMap.get(String(d.id)) as Record<string, unknown>)),
      );
      setReferenceSkills(skills);
    } catch {
      setAchievements([]);
      setBadges([]);
      setReferenceSkills([]);
    } finally {
      setLoading(false);
    }
  }, [authed]);

  const markAchievementSeen = useCallback(async (id: string) => {
    await api.markAchievementSeen(id);
    await refresh();
  }, [refresh]);

  const markBadgeSeen = useCallback(async (id: string) => {
    await api.markBadgeSeen(id);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    queueMicrotask(() => { void refresh(); });
  }, [refresh]);

  const value = useMemo(
    () => ({ achievements, badges, referenceSkills, loading, refresh, streakDays, markAchievementSeen, markBadgeSeen }),
    [achievements, badges, referenceSkills, loading, refresh, streakDays, markAchievementSeen, markBadgeSeen],
  );

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
