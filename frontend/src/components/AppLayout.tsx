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

const PLAN_COLORS: Record<string, string> = {
  free: '#6B7280',
  pro: '#10B981',
  premium: '#8B5CF6',
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { authed, isLoading, plan, planLabel, canAccess } = useAuth();
  const { requestUpgrade, dismissUpgrade } = useUpgrade();
  const pathname = usePathname() ?? '/app/dashboard';
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  );

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
        className="flex-1 flex flex-col transition-all duration-200 ease-in-out overflow-y-auto"
        style={{ marginLeft: sidebarExpanded ? 256 : 56 }}
      >
        <header className="h-12 border-b border-border flex items-center justify-between px-3 gap-2 bg-card flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-[13px] font-semibold tracking-tight" style={{ color: CARBON }}>
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: PLAN_COLORS[plan] }}
              />
              {planLabel} Plan
            </div>
            <NotificationBell />
            <AvatarDropdown />
          </div>
        </header>
        <main className="flex-1 p-3 md:p-4 lg:p-5">
          {showDashboardFallback ? <Navigate to="/app/dashboard" replace /> : children}
        </main>
      </div>
    </div>
  );
}
