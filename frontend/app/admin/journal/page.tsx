'use client';

import { useEffect, useState } from 'react';
import { adminListActivityLog } from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';
import type { Dictionary } from '../../../lib/i18n/dictionaries';
import type { ActivityLogEntry } from '../../../lib/types';

// Ressources connues (voir ActivityLogInterceptor côté back-end) — utilisées pour le filtre.
// Une entrée avec une ressource inconnue de cette liste (ex. ajoutée dans une phase future)
// reste affichée normalement, simplement absente du menu déroulant tant qu'elle n'y est pas
// ajoutée manuellement. Libellés résolus au rendu (voir buildResourceOptions) pour suivre la
// langue choisie.
function buildResourceOptions(t: Dictionary): Array<{ value: string; label: string }> {
  return [
    { value: 'products', label: t.adminNav.products },
    { value: 'categories', label: t.adminNav.categories },
    { value: 'brands', label: t.adminNav.brands },
    { value: 'promotions', label: t.adminNav.promotions },
    { value: 'boutiques', label: t.adminNav.boutiques },
    { value: 'articles', label: t.adminNav.news },
    { value: 'pages', label: t.adminNav.pages },
    { value: 'messages', label: t.messagesPage.title },
    { value: 'users', label: t.adminNav.accounts },
    { value: 'media', label: t.journalPage.media },
    { value: 'auth', label: t.journalPage.logins },
  ];
}

const ACTION_OPTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'UNPUBLISH',
  'ACTIVATE',
  'DISABLE',
  'DRAFT',
  'DUPLICATE',
  'STOCK',
  'STATUS',
  'UPLOAD',
  'LOGIN',
];

export default function AdminActivityLogPage() {
  const { t } = useLocale();
  const RESOURCE_OPTIONS = buildResourceOptions(t);
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(targetPage = page) {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: String(targetPage) };
      if (resource) params.resource = resource;
      if (action) params.action = action;
      if (from) params.from = new Date(from).toISOString();
      if (to) params.to = new Date(`${to}T23:59:59`).toISOString();
      const result = await adminListActivityLog(params);
      setEntries(result.data);
      setTotalPages(result.meta.totalPages);
      setPage(result.meta.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">{t.journalPage.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.journalPage.subtitle}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(1);
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <select value={resource} onChange={(e) => setResource(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.journalPage.allResources}</option>
          {RESOURCE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.journalPage.allActions}</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label={t.journalPage.from}
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label={t.journalPage.to}
        />
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.adminCommon.filter}
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
                <th className="px-4 py-2">{t.adminCommon.date}</th>
                <th className="px-4 py-2">{t.journalPage.user}</th>
                <th className="px-4 py-2">{t.journalPage.action}</th>
                <th className="px-4 py-2">{t.journalPage.detail}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="whitespace-nowrap px-4 py-2 text-slate-500">
                    {new Date(entry.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-800">{entry.userName}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{entry.description}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    {t.journalPage.noEntries}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            {t.journalPage.previous}
          </button>
          <span className="text-sm text-slate-500">
            {t.journalPage.pageOf.replace('{page}', String(page)).replace('{total}', String(totalPages))}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            {t.journalPage.next}
          </button>
        </div>
      )}
    </div>
  );
}
