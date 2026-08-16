'use client';

import { X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CARBON } from '../lib/constants';
import { Card } from './Card';
import { cn } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './ui/dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  /** Extra element(s) rendered next to the close button */
  headerExtra?: React.ReactNode;
  /** Skip the default Card wrapper — use for fully custom modal layouts */
  bare?: boolean;
}

const WIDTHS: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'md',
  className = '',
  headerExtra,
  bare = false,
}: ModalProps) {
  const hasHeader = title || headerExtra;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent
        hideCloseButton
        className={cn(
          'gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-none',
          WIDTHS[maxWidth],
          className,
        )}
      >
        {!title && (
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>
        )}

        {bare ? (
          children
        ) : (
          <Card className="p-6 shadow-2xl" hover={false}>
            {hasHeader ? (
              <div className="mb-5 flex items-center justify-between">
                {title ? (
                  <DialogTitle className="text-[16px] font-black" style={{ color: CARBON }}>
                    {title}
                  </DialogTitle>
                ) : (
                  <VisuallyHidden>
                    <DialogTitle>Dialog</DialogTitle>
                  </VisuallyHidden>
                )}
                <div className="flex items-center gap-1">
                  {headerExtra}
                  <button
                    type="button"
                    onClick={onClose}
                    className="tr-interactive rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="tr-interactive rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {children}
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
