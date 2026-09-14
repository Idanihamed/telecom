'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../lib/admin-api';
import { useLocale } from '../../lib/i18n/context';
import type { DashboardStats } from '../../lib/types';

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone?: 'default' | 'warning' | 'danger';
  icon: string;
}) {
  const toneClass =
    tone === 'warning' ? 'text-amber-600' : tone === 'danger' ? 'text-red-600' : 'text-navy';
  const badgeClass =
    tone === 'warning'
      ? 'from-amber-400 to-amber-600'
      : tone === 'danger'
        ? 'from-red-400 to-red-600'
        : 'from-navy to-slate-700';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${badgeClass} text-lg shadow-[0_6px_14px_-4px_rgba(15,23,42,0.45)]`}
      >
        <span aria-hidden>{icon}</span>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-accent">{error}</p>;
  if (!stats) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.dashboard.title}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t.dashboard.productsTotal} value={stats.products.total} icon="📦" />
        <StatCard label={t.dashboard.published} value={stats.products.published} icon="✅" />
        <StatCard label={t.dashboard.drafts} value={stats.products.draft} icon="📝" />
        <StatCard label={t.dashboard.lowStock} value={stats.stock.lowStock} tone="warning" icon="⚠️" />
        <StatCard label={t.dashboard.outOfStock} value={stats.stock.outOfStock} tone="danger" icon="⛔" />
        <StatCard label={t.dashboard.categories} value={stats.categories} icon="🗂️" />
        <StatCard label={t.dashboard.promotionsActive} value={stats.promotions.active} icon="🏷️" />
        <StatCard label={t.dashboard.promotionsScheduled} value={stats.promotions.scheduled} icon="⏳" />
        <StatCard label={t.dashboard.boutiques} value={stats.boutiques} icon="🏬" />
        <StatCard label={t.dashboard.newsPublished} value={stats.articles.published} icon="📰" />
        <StatCard label={t.dashboard.pages} value={stats.pages} icon="📄" />
        <StatCard
          label={t.dashboard.untreatedMessages}
          value={stats.messages.untreated}
          tone={stats.messages.untreated > 0 ? 'warning' : 'default'}
          icon="✉️"
        />
        <StatCard
          label={t.dashboard.pendingOrders}
          value={stats.orders.pending}
          tone={stats.orders.pending > 0 ? 'warning' : 'default'}
          icon="🛒"
        />
      </div>
    </div>
  );
}
