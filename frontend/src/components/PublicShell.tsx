'use client';

import { AnimatedView } from '@/components/AnimatedView';
import { cn } from '@/lib/utils';

/** Wrapper for marketing / auth pages with consistent entrance motion */
export function PublicShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatedView className={cn('min-h-screen bg-background', className)}>
      {children}
    </AnimatedView>
  );
}
