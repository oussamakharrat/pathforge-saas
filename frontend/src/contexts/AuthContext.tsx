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

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  streakDays: number;
}

interface AuthContextType {
  authed: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  plan: Plan;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setPlan: (p: Plan) => Promise<void>;
  cancelPlan: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  canAccess: (page: string) => boolean;
  planLabel: string;
  lockedPages: string[];
  emailVerified: boolean;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const PLAN_LABELS: Record<Plan, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

const AuthContext = createContext<AuthContextType | null>(null);

function mapCareerProfile(
  cp: Record<string, unknown> | null | undefined,
  fallback: { name: string; email: string },
): UserProfile {
  return {
    name: fallback.name,
    email: fallback.email,
    currentRole: String(cp?.currentRole ?? ''),
    targetRole: String(cp?.targetRole ?? ''),
    location: String(cp?.location ?? ''),
    bio: String(cp?.bio ?? ''),
    avatarUrl: String(cp?.avatarUrl ?? ''),
    experienceLevel:
      (cp?.experienceLevel as UserProfile['experienceLevel']) ?? '1-3',
    educationLevel: 'bachelor',
    referralSource: 'other',
    biggestChallenges: [],
    onboardingComplete: Boolean(cp?.onboardingComplete),
    purchasedServices: (cp?.purchasedServices as string[]) ?? [],
    notifyPush: cp?.notifyPush !== false,
    notifyInsights: cp?.notifyInsights !== false,
    notifyWeekly: cp?.notifyWeekly !== false,
  };
}

function mapMeToState(me: Record<string, unknown>) {
  const cp = me.careerProfile as Record<string, unknown> | null | undefined;
  const subscription = me.subscription as Record<string, unknown> | null | undefined;
  const name = String(me.displayName ?? '');
  const email = String(me.email ?? '');

  return {
    user: {
      id: String(me.id),
      email,
      name: name || null,
      createdAt: String(me.createdAt ?? new Date().toISOString()),
      streakDays: Number(me.streakDays ?? 0),
    },
    plan: (subscription?.plan as Plan) ?? 'free',
    profile: mapCareerProfile(cp, { name, email }),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlanState] = useState<Plan>('free');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(true);

  const applyProfileResponse = useCallback((p: Awaited<ReturnType<typeof api.getProfile>>) => {
    setUser({
      id: p.id,
      email: p.email,
      name: p.name,
      createdAt: p.createdAt,
      streakDays: p.streakDays,
    });
    setPlanState(p.plan ?? 'free');
    setEmailVerified(Boolean(p.emailVerified));
    setProfile(
      mapCareerProfile(p.profile, {
        name: p.name ?? '',
        email: p.email,
      }),
    );
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const p = await api.getProfile();
      applyProfileResponse(p);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
    }
  }, [applyProfileResponse]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    queueMicrotask(() => {
      if (token) hydrate().finally(() => setIsLoading(false));
      else setIsLoading(false);
    });
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.token);
    if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
    setUser({
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      createdAt: new Date().toISOString(),
      streakDays: 0,
    });
    await hydrate();
    toast.success('Welcome back!');
  }, [hydrate]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const res = await api.register(email, password, name);
    localStorage.setItem('token', res.token);
    if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
    setUser({
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      createdAt: new Date().toISOString(),
      streakDays: 0,
    });
    await hydrate();
  }, [hydrate]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken') ?? undefined;
    try {
      await api.logout(refreshToken);
    } catch {
      /* clear locally even if server call fails */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setPlanState('free');
    setProfile(null);
    setEmailVerified(true);
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await api.resendVerificationEmail();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to send verification email',
        { duration: 8000 },
      );
      throw err;
    }
  }, []);

  const setPlan = useCallback(async (p: Plan) => {
    await api.updateSubscription({ plan: p });
    setPlanState(p);
  }, []);

  const cancelPlan = useCallback(async () => {
    await api.cancelSubscription();
    setPlanState('free');
    toast.success('Your plan has been cancelled. You are now on the Free plan.');
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
    if (data.name !== undefined) {
      setUser((prev) => (prev ? { ...prev, name: data.name ?? prev.name } : null));
    }

    try {
      const updated = await api.updateProfile({
        displayName: data.name,
        currentRole: data.currentRole,
        targetRole: data.targetRole,
        experienceLevel: data.experienceLevel,
        location: data.location,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        onboardingComplete: data.onboardingComplete,
        notifyPush: data.notifyPush,
        notifyInsights: data.notifyInsights,
        notifyWeekly: data.notifyWeekly,
      }) as Record<string, unknown>;

      const mapped = mapMeToState(updated);
      setUser(mapped.user);
      setPlanState(mapped.plan);
      setProfile(mapped.profile);
    } catch (err) {
      await hydrate();
      throw err;
    }
  }, [hydrate]);

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
        cancelPlan,
        updateProfile,
        canAccess,
        planLabel,
        lockedPages,
        emailVerified,
        resendVerification,
        refreshProfile: hydrate,
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
