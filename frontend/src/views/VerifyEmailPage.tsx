'use client';

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from '@/lib/router';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { PageLoading } from '@/components/PageLoading';
import { Btn } from '@/components/Btn';
import { Card } from '@/components/Card';
import { CARBON } from '@/lib/constants';
import { PublicShell } from '@/components/PublicShell';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile, resendVerification, emailVerified, authed, isLoading } = useAuth();
  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error' | 'already'>(
    'pending',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token found in the link.');
      return;
    }

    if (emailVerified === true) {
      setStatus('already');
      return;
    }

    if (attemptedToken.current === token) return;
    attemptedToken.current = token;

    setStatus('loading');
    let cancelled = false;

    void api
      .verifyEmail(token)
      .then(async (res) => {
        if (cancelled) return;
        setStatus(res.alreadyVerified ? 'already' : 'success');
        await refreshProfile();
        toast.success(
          res.alreadyVerified ? 'Email is already verified.' : 'Email verified successfully!',
        );
      })
      .catch(async (err: Error) => {
        if (cancelled) return;
        if (authed) {
          await refreshProfile().catch(() => undefined);
        }
        setStatus('error');
        setErrorMessage(err.message || 'Invalid or expired verification link.');
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, refreshProfile, emailVerified, isLoading, authed]);

  if (isLoading || status === 'pending' || status === 'loading') {
    return <PageLoading />;
  }

  return (
    <PublicShell className="flex items-center justify-center p-6">
      <Card className="anim-pop w-full max-w-md p-8 text-center" hover={false}>
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-black mb-2" style={{ color: CARBON }}>Email verified</h1>
            <p className="text-[13px] text-muted-foreground mb-6">
              Your email address is confirmed. You&apos;re all set.
            </p>
            <Btn full onClick={() => navigate('/app/dashboard')}>Go to Dashboard</Btn>
          </>
        )}

        {status === 'already' && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-black mb-2" style={{ color: CARBON }}>Already verified</h1>
            <p className="text-[13px] text-muted-foreground mb-6">
              This email address is already verified on your account.
            </p>
            <Btn full onClick={() => navigate('/app/dashboard')}>Go to Dashboard</Btn>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-black mb-2" style={{ color: CARBON }}>Verification failed</h1>
            <p className="text-[13px] text-muted-foreground mb-6">{errorMessage}</p>
            <p className="text-[12px] text-muted-foreground mb-4">
              Links expire after 24 hours. If you clicked &quot;Resend&quot; multiple times, only the latest link works.
            </p>
            <div className="flex flex-col gap-2">
              {authed ? (
                <Btn
                  full
                  onClick={() => {
                    void resendVerification().catch(() => undefined);
                  }}
                >
                  <Mail className="w-4 h-4" /> Resend verification email
                </Btn>
              ) : (
                <Btn full onClick={() => navigate('/login')}>
                  Log in to get a new link
                </Btn>
              )}
              <Btn variant="outline" full onClick={() => navigate('/login')}>
                Back to login
              </Btn>
            </div>
          </>
        )}
      </Card>
    </PublicShell>
  );
}
