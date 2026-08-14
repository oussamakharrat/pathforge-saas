'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from '@/lib/router';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingWizard from '@/components/OnboardingWizard';
import { PageLoading } from '@/components/PageLoading';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const onboarding = searchParams.get('onboarding');

    if (!token) {
      toast.error('Sign-in failed. Please try again.');
      navigate('/login?error=oauth_failed');
      return;
    }

    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    void refreshProfile()
      .then(() => {
        if (onboarding === '1') {
          setShowOnboarding(true);
          setReady(true);
        } else {
          toast.success('Signed in successfully');
          navigate('/app/dashboard');
        }
      })
      .catch(() => {
        toast.error('Failed to complete sign-in');
        navigate('/login?error=oauth_failed');
      });
  }, [searchParams, navigate, refreshProfile]);

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          toast.success('Welcome to PathForge!');
          navigate('/app/dashboard');
        }}
      />
    );
  }

  if (!ready) {
    return <PageLoading />;
  }

  return <PageLoading />;
}
