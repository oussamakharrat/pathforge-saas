'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  canAccessPage,
  PLAN_HIERARCHY,
  PAGE_ACCESS,
  type Plan,
  type UserProfile,
} from '@/data/types';

interface AuthContextType {
  authed: boolean;
  isLoading: boolean;
  user: { id: string; email: string; name: string | null } | null;
  plan: Plan;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setPlan: (p: Plan) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  canAccess: (page: string) => boolean;
  planLabel: string;
  lockedPages: string[];
}

const PLAN_LABELS: Record<Plan, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlanState] = useState<Plan>('free');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const hydrate = useCallback(async () => {
    try {
      const p = await api.getProfile();
      setUser({ id: p.id, email: p.email, name: p.name });
      setPlanState(p.plan ?? 'free');
      if (p.profile) {
        const cp = p.profile as Record<string, unknown>;
        setProfile({
          name: p.name ?? '',
          email: p.email,
          targetRole: (cp.targetRole as string) ?? '',
          experienceLevel: (cp.experienceLevel as UserProfile['experienceLevel']) ?? '1-3',
          educationLevel: 'bachelor',
          referralSource: 'other',
          biggestChallenges: [],
          onboardingComplete: Boolean(cp.onboardingComplete),
        });
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) hydrate().finally(() => setIsLoading(false));
    else setIsLoading(false);
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    await hydrate();
    toast.success('Welcome back!');
  }, [hydrate]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await api.register(email, password, name);
    localStorage.setItem('token', res.token);
    setUser(res.user);
    await hydrate();
  }, [hydrate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setPlanState('free');
    setProfile(null);
  }, []);

  const setPlan = useCallback((p: Plan) => {
    setPlanState(p);
    void api.updateSubscription({ plan: p }).catch(() => undefined);
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    api
      .updateProfile({
        displayName: data.name,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        onboardingComplete: data.onboardingComplete,
      })
      .catch(() => undefined);
  }, []);

  const canAccess = useCallback((page: string) => canAccessPage(plan, page), [plan]);
  const planLabel = PLAN_LABELS[plan];
  const lockedPages = useMemo(
    () =>
      Object.entries(PAGE_ACCESS)
        .filter(([, min]) => PLAN_HIERARCHY[plan] < PLAN_HIERARCHY[min])
        .map(([p]) => p),
    [plan],
  );

  return (
    <AuthContext.Provider
      value={{
        authed: !!user,
        isLoading,
        user,
        plan,
        profile,
        login,
        register,
        logout,
        setPlan,
        updateProfile,
        canAccess,
        planLabel,
        lockedPages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
