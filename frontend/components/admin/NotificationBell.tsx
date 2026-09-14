'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  adminListNotifications,
  adminMarkAllNotificationsRead,
  adminMarkNotificationRead,
  adminUnreadNotificationsCount,
} from '../../lib/admin-api';
import type { AppNotification } from '../../lib/types';

const TYPE_ICON: Record<AppNotification['type'], string> = {
  CONTACT_MESSAGE: '✉️',
  LOW_STOCK: '📉',
  OUT_OF_STOCK: '🚫',
  PROMOTION_EXPIRING: '⏳',
  NEW_ORDER: '🛒',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  async function refreshCount() {
    try {
      setUnreadCount(await adminUnreadNotificationsCount());
    } catch {
      // Le compteur n'est qu'indicatif : une erreur ponctuelle ne doit pas gêner l'admin.
    }
  }

  async function loadList() {
    try {
      setNotifications(await adminListNotifications());
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    refreshCount();
    // §29 : pas de notifications temps réel (websocket) en phase 5 — un rafraîchissement
    // périodique simple suffit pour un back-office à quelques utilisateurs.
    const interval = setInterval(refreshCount, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) await loadList();
  }

  async function handleMarkRead(notification: AppNotification) {
    if (notification.virtual) return;
    await adminMarkNotificationRead(notification.id);
    await Promise.all([loadList(), refreshCount()]);
  }

  async function handleMarkAllRead() {
    await adminMarkAllNotificationsRead();
    await Promise.all([loadList(), refreshCount()]);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleOpen}
        aria-label="Notifications"
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-navy"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
            <span className="text-sm font-semibold text-navy">Notifications</span>
            <button onClick={handleMarkAllRead} className="text-xs font-medium text-navy hover:underline">
              Tout marquer comme lu
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-2 border-b border-slate-50 px-4 py-3 text-sm ${n.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
                >
                  <span>{TYPE_ICON[n.type]}</span>
                  <div className="flex-1">
                    <p className="text-slate-700">{n.message}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.link && (
                        <Link href={n.link} onClick={() => setOpen(false)} className="font-medium text-navy hover:underline">
                          Voir
                        </Link>
                      )}
                      {!n.isRead && !n.virtual && (
                        <button onClick={() => handleMarkRead(n)} className="font-medium text-navy hover:underline">
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
