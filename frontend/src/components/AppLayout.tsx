'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { AvatarDropdown } from '@/components/AvatarDropdown';
import { useUpgrade } from '@/contexts/UpgradeContext';
import { NotificationBell } from '@/components/NotificationBell';
import { CARBON, NAV_ITEMS } from '@/lib/constants';
import { Navigate } from '@/lib/router';
import { PageLoading } from '@/components/PageLoading';
import { AnimatedView } from '@/components/AnimatedView';

const PLAN_COLORS: Record<string, string> = {
  free: '#6B7280',
  pro: '#10B981',
  premium: '#8B5CF6',
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { authed, isLoading, plan, planLabel, canAccess, emailVerified, resendVerification, user } = useAuth();
  const { requestUpgrade, dismissUpgrade } = useUpgrade();
  const pathname = usePathname() ?? '/app/dashboard';
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  );
  const [resending, setResending] = useState(false);

  const currentPage = pathname.split('/').pop() || 'dashboard';
  const pageTitle =
    NAV_ITEMS.find((item) => item.id === currentPage)?.label ??
    (currentPage === 'settings' ? 'Settings' : 'Dashboard');

  useEffect(() => {
    if (isLoading || !authed) return;

    if (!canAccess(currentPage)) {
      const navItem = NAV_ITEMS.find((item) => item.id === currentPage);
      requestUpgrade(currentPage, navItem?.label ?? currentPage);
    } else {
      dismissUpgrade();
    }
  }, [currentPage, canAccess, requestUpgrade, dismissUpgrade, isLoading, authed]);

  useEffect(() => {
    queueMicrotask(() => {
      if (window.innerWidth < 768) setSidebarExpanded(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !authed) router.replace('/login');
  }, [authed, isLoading, router]);

  if (isLoading) return <PageLoading />;
  if (!authed) return null;

  const showDashboardFallback = !canAccess(currentPage);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      <div
        className="flex-1 flex flex-col tr-layout overflow-y-auto"
        style={{ marginLeft: sidebarExpanded ? 256 : 56 }}
      >
        <header className="anim-fade-in-down sticky top-0 z-30 flex h-12 flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-semibold tracking-tight" style={{ color: CARBON }}>
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full anim-pulse"
                style={{ backgroundColor: PLAN_COLORS[plan] }}
              />
              {planLabel} Plan
            </div>
            <NotificationBell />
            <AvatarDropdown />
          </div>
        </header>
        {emailVerified === false && (
          <div className="anim-slide-right flex flex-shrink-0 items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-3 py-2 md:px-4 lg:px-5">
            <p className="text-[12px] text-amber-900">
              Verify <strong>{user?.email ?? 'your email'}</strong> to secure your account.
              Check spam if you don&apos;t see the message.
            </p>
            <button
              disabled={resending}
              onClick={() => {
                setResending(true);
                void resendVerification()
                  .finally(() => setResending(false));
              }}
              className="tr-interactive whitespace-nowrap rounded-lg bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {resending ? 'Sending…' : 'Resend email'}
            </button>
          </div>
        )}
        <main className="flex-1 p-3 md:p-4 lg:p-5">
          <AnimatedView>
            {showDashboardFallback ? <Navigate to="/app/dashboard" replace /> : children}
          </AnimatedView>
        </main>
      </div>
    </div>
  );
}
