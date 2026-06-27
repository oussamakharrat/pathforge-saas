'use client';

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@/lib/router";
import { Bell, CheckCheck, Trash2, Sparkles, Target, BookOpen, Zap, DollarSign, Award, Trophy, Brain, Briefcase, X } from "lucide-react";
import { cn } from "../lib/utils";
import { FLAME, CARBON } from "../lib/constants";
import { useNotifications } from "../contexts/NotificationContext";
import { normalizeNotificationLink } from "../lib/notification-links";
import type { NotificationType } from "../data/types";

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
  goal_created: "#3B82F6",
  goal_completed: "#10B981",
  step_completed: "#8B5CF6",
  skill_improved: "#F59E0B",
  service_purchased: "#F59E0B",
  badge_earned: "#8B5CF6",
  quiz_completed: "#3B82F6",
  application_tracked: "#6B7280",
  interview_tracked: "#6B7280",
  offer_received: "#10B981",
  milestone_reached: "#F59E0B",
  mission_completed: "#10B981",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, clearAll } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

  const handleNotifClick = (n: typeof notifications[0]) => {
    markAsRead(n.id);
    const link = normalizeNotificationLink(n.link);
    if (link) navigate(link);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) { /* panel will open */ } }}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-secondary transition-all"
        style={{ color: CARBON }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
            style={{ backgroundColor: FLAME, minWidth: 16, height: 16, fontSize: 9 }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[90vw] z-50 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black" style={{ color: CARBON }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: FLAME }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-secondary transition-all flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <CheckCheck className="w-3 h-3" /> Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-secondary transition-all flex items-center gap-1 text-muted-foreground hover:text-red-500">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-[13px] font-bold text-muted-foreground">No notifications yet</p>
                <p className="text-[11px] text-muted-foreground">Complete actions to see them here.</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = NOTIF_ICONS[n.type] || Bell;
                const color = NOTIF_COLORS[n.type] || "#6B7280";
                return (
                  <div key={n.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer transition-all hover:bg-secondary/50 group",
                      !n.read && "bg-orange-50/30"
                    )}
                    onClick={() => handleNotifClick(n)}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${color}15` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-[12px] leading-tight", n.read ? "text-muted-foreground" : "text-foreground font-bold")}>
                          {n.title}
                        </p>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap flex-shrink-0">{timeAgo(n.timestamp)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 w-5 h-5 rounded flex items-center justify-center hover:bg-secondary"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
