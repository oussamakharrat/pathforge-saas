'use client';

import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { JobsProvider } from '@/contexts/JobsContext';
import { CareerDataProvider } from '@/contexts/CareerDataContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { ResumeProvider } from '@/contexts/ResumeContext';
import { CoachProvider } from '@/contexts/CoachContext';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UpgradeProvider } from '@/components/UpgradePrompt';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GamificationProvider>
          <JobsProvider>
            <CareerDataProvider>
              <PortfolioProvider>
                <ResumeProvider>
                  <CoachProvider>
                    <CommunityProvider>
                      <UpgradeProvider>
                        <Suspense fallback={null}>{children}</Suspense>
                        <Toaster richColors closeButton position="top-center" expand visibleToasts={4} />
                      </UpgradeProvider>
                    </CommunityProvider>
                  </CoachProvider>
                </ResumeProvider>
              </PortfolioProvider>
            </CareerDataProvider>
          </JobsProvider>
        </GamificationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
