'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminActivatePromotion,
  adminDeletePromotion,
  adminDisablePromotion,
  adminListPromotions,
  adminSetDraftPromotion,
} from '../../../lib/admin-api';
import { formatPriceFCFA } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { Dictionary } from '../../../lib/i18n/dictionaries';
import type { Promotion, PromotionDisplayStatus } from '../../../lib/types';

function buildStatusLabels(t: Dictionary): Record<PromotionDisplayStatus, { label: string; className: string }> {
  return {
    DRAFT: { label: t.promotionsPage.statusDraft, className: 'bg-slate-200 text-slate-600' },
    SCHEDULED: { label: t.promotionsPage.statusScheduled, className: 'bg-blue-100 text-blue-700' },
    ACTIVE: { label: t.promotionsPage.statusActive, className: 'bg-green-100 text-green-700' },
    EXPIRED: { label: t.promotionsPage.statusExpired, className: 'bg-slate-200 text-slate-500' },
    DISABLED: { label: t.promotionsPage.statusDisabled, className: 'bg-red-100 text-red-700' },
  };
}

function formatValue(t: Dictionary, promo: Pick<Promotion, 'type' | 'value'>) {
  if (promo.type === 'PERCENTAGE') return `-${promo.value}%`;
  if (promo.type === 'FIXED_AMOUNT') return `-${formatPriceFCFA(promo.value)}`;
  return `${t.promotionsPage.fixedPrice} : ${formatPriceFCFA(promo.value)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminPromotionsPage() {
  const { t } = useLocale();
  const STATUS_LABEL = buildStatusLabels(t);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [search, setSearch] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (adminStatus) params.adminStatus = adminStatus;
      const result = await adminListPromotions(params);
      setPromotions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleActivate(id: string) {
    try {
      await adminActivatePromotion(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.promotionsPage.actionError);
    }
  }
  async function handleDisable(id: string) {
    await adminDisablePromotion(id);
    await load();
  }
  async function handleDraft(id: string) {
    await adminSetDraftPromotion(id);
    await load();
  }
  async function handleDelete(id: string) {
    if (!confirm(t.promotionsPage.confirmDelete)) return;
    try {
      await adminDeletePromotion(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.promotionsPage.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.promotionsPage.title}</h1>
        <Link href="/admin/promotions/nouveau" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          {t.promotionsPage.newPromotion}
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.promotionsPage.searchPlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={adminStatus}
          onChange={(e) => setAdminStatus(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">{t.adminCommon.allStatuses}</option>
          <option value="DRAFT">{t.promotionsPage.statusDraft}</option>
          <option value="ACTIVE">{t.promotionsPage.statusActive}</option>
          <option value="DISABLED">{t.promotionsPage.statusDisabled}</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.promotionsPage.search}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.adminCommon.name}</th>
                <th className="px-4 py-2">{t.promotionsPage.discount}</th>
                <th className="px-4 py-2">{t.promotionsPage.target}</th>
                <th className="px-4 py-2">{t.promotionsPage.period}</th>
                <th className="px-4 py-2">{t.promotionsPage.priority}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => {
                const status = STATUS_LABEL[promo.displayStatus];
                return (
                  <tr key={promo.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                    <td className="px-4 py-2 font-medium text-slate-800">{promo.name}</td>
                    <td className="px-4 py-2">{formatValue(t, promo)}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {promo.products.length > 0 && `${promo.products.length} ${t.promotionsPage.productsCount}`}
                      {promo.products.length > 0 && promo.categories.length > 0 && ' · '}
                      {promo.categories.length > 0 && `${promo.categories.length} ${t.promotionsPage.categoriesCount}`}
                      {promo.products.length === 0 && promo.categories.length === 0 && '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-500">
                      {formatDate(promo.startsAt)}
                      <br />→ {formatDate(promo.endsAt)}
                    </td>
                    <td className="px-4 py-2">{promo.priority}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="space-x-2 whitespace-nowrap px-4 py-2">
                      <Link href={`/admin/promotions/${promo.id}`} className="text-navy hover:underline">
                        {t.common.edit}
                      </Link>
                      {promo.adminStatus !== 'ACTIVE' && (
                        <button onClick={() => handleActivate(promo.id)} className="text-navy hover:underline">
                          {t.promotionsPage.activate}
                        </button>
                      )}
                      {promo.adminStatus === 'ACTIVE' && (
                        <button onClick={() => handleDisable(promo.id)} className="text-navy hover:underline">
                          {t.promotionsPage.deactivate}
                        </button>
                      )}
                      {promo.adminStatus !== 'DRAFT' && (
                        <button onClick={() => handleDraft(promo.id)} className="text-slate-500 hover:underline">
                          {t.promotionsPage.backToDraft}
                        </button>
                      )}
                      <button onClick={() => handleDelete(promo.id)} className="text-accent hover:underline">
                        {t.common.delete}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    {t.promotionsPage.noPromotions}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
