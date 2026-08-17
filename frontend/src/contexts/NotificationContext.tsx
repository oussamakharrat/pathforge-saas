'use client';

import { createContext, useContext, useCallback, useMemo, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { normalizeNotificationLink } from '@/lib/notification-links';
import type { AppNotification, NotificationType } from '@/data/types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (type: NotificationType, title: string, message: string, link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissNotification: (id: string) => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

function mapApiNotification(n: Record<string, unknown>): AppNotification {
  return {
    id: String(n.id),
    type: String(n.type) as NotificationType,
    title: String(n.title),
    message: String(n.message ?? ''),
    timestamp: String(n.createdAt ?? new Date().toISOString()),
    read: Boolean(n.read),
    link: normalizeNotificationLink(String(n.link ?? '')),
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const data = (await api.getNotifications()) as Record<string, unknown>[];
      setNotifications(data.map(mapApiNotification));
    } catch {
      /* ignore when logged out */
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => { refresh(); });
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string, link?: string) => {
      void api
        .createNotification({ type, title, message, link })
        .then((created) => {
          setNotifications((prev) => [mapApiNotification(created), ...prev]);
        })
        .catch(() => {
          refresh();
        });
    },
    [refresh],
  );

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await api.markNotificationRead(id).catch(() => undefined);
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await api.markAllNotificationsRead().catch(() => undefined);
  }, []);

  const dismissNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await api.deleteNotification(id).catch(() => undefined);
  }, []);

  const clearAll = useCallback(async () => {
    const snapshot = notifications;
    setNotifications([]);
    try {
      await api.clearReadNotifications();
      const unread = snapshot.filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.deleteNotification(n.id)));
    } catch {
      void refresh();
    }
  }, [notifications, refresh]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        dismissNotification,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
