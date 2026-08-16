'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AnimatedViewProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger entrance of page sections, grids, and stacks */
  cascade?: boolean;
}

/**
 * Re-mounts on route change so page entrance animations replay consistently.
 */
export function AnimatedView({ children, className, cascade = true }: AnimatedViewProps) {
  const pathname = usePathname() ?? '';

  return (
    <div
      key={pathname}
      className={cn('anim-page', cascade && 'anim-cascade', className)}
    >
      {children}
    </div>
  );
}
