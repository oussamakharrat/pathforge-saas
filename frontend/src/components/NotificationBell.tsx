'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/lib/router';
import { Bell, CheckCheck, Trash2, Sparkles, Target, BookOpen, Zap, DollarSign, Award, Trophy, Brain, Briefcase, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { FLAME, CARBON } from '../lib/constants';
import { useNotifications } from '../contexts/NotificationContext';
import { normalizeNotificationLink } from '../lib/notification-links';
import type { NotificationType } from '../data/types';

const NOTIF_ICONS: Record<NotificationType, React.ElementType> = {
  goal_created: Target,
  goal_completed: Trophy,
  step_completed: BookOpen,
  skill_improved: Zap,
  service_purchased: DollarSign,
  badge_earned: Award,
  quiz_completed: Brain,
  application_tracked: Briefcase,
  interview_tracked: Briefcase,
  offer_received: Award,
  milestone_reached: Trophy,
  mission_completed: Sparkles,
};

const NOTIF_COLORS: Record<NotificationType, string> = {
  goal_created: '#3B82F6',
  goal_completed: '#10B981',
  step_completed: '#8B5CF6',
  skill_improved: '#F59E0B',
  service_purchased: '#F59E0B',
  badge_earned: '#8B5CF6',
  quiz_completed: '#3B82F6',
  application_tracked: '#6B7280',
  interview_tracked: '#6B7280',
  offer_received: '#10B981',
  milestone_reached: '#F59E0B',
  mission_completed: '#10B981',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleNotifClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    const link = normalizeNotificationLink(n.link ?? '');
    if (link) navigate(link);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl',
          'text-foreground transition-colors duration-150 ease-out hover:bg-secondary',
          open && 'bg-secondary',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-[18px] w-[18px]" style={{ color: CARBON }} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
            style={{ backgroundColor: FLAME }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={cn(
          'notif-dropdown absolute right-0 top-full z-50 mt-1.5 w-[380px] max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-card shadow-lg',
          open ? 'notif-dropdown-open' : 'notif-dropdown-closed',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black" style={{ color: CARBON }}>Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: FLAME }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground">
                <CheckCheck className="h-3 w-3" /> Mark read
              </button>
            )}
            {notifications.length > 0 && (
              <button type="button" onClick={clearAll} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-red-500">
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
              <p className="text-[13px] font-bold text-muted-foreground">No notifications yet</p>
              <p className="text-[11px] text-muted-foreground">Complete actions to see them here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = NOTIF_ICONS[n.type] || Bell;
              const color = NOTIF_COLORS[n.type] || '#6B7280';
              return (
                <div
                  key={n.id}
                  role="menuitem"
                  className={cn(
                    'group flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors duration-150 hover:bg-secondary/50',
                    !n.read && 'bg-orange-50/30',
                  )}
                  onClick={() => handleNotifClick(n)}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-[12px] leading-tight', n.read ? 'text-muted-foreground' : 'font-bold text-foreground')}>
                        {n.title}
                      </p>
                      <span className="flex-shrink-0 whitespace-nowrap text-[9px] text-muted-foreground">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{n.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                    className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-secondary"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
