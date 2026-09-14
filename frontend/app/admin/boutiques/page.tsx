'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminActivateBoutique,
  adminDeleteBoutique,
  adminDisableBoutique,
  adminListBoutiques,
} from '../../../lib/admin-api';
import type { Boutique } from '../../../lib/types';
import { usePermissions } from '../../../lib/permissions';
import { useLocale } from '../../../lib/i18n/context';

export default function AdminBoutiquesPage() {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('boutiques:create');
  const canUpdate = hasPermission('boutiques:update');
  const canDelete = hasPermission('boutiques:delete');
  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setBoutiques(await adminListBoutiques());
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

  async function handleToggleActive(boutique: Boutique) {
    try {
      if (boutique.isActive) {
        await adminDisableBoutique(boutique.id);
      } else {
        await adminActivateBoutique(boutique.id);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.boutiquesPageAdmin.actionError);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.boutiquesPageAdmin.confirmDelete)) return;
    try {
      await adminDeleteBoutique(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.boutiquesPageAdmin.title}</h1>
        {canCreate && (
          <Link href="/admin/boutiques/nouveau" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            {t.boutiquesPageAdmin.newBoutique}
          </Link>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.adminCommon.name}</th>
                <th className="px-4 py-2">{t.boutiquesPageAdmin.address}</th>
                <th className="px-4 py-2">{t.boutiquesPageAdmin.phone}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {boutiques.map((boutique) => (
                <tr key={boutique.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-medium text-slate-800">{boutique.name}</td>
                  <td className="px-4 py-2 text-slate-500">{boutique.address}</td>
                  <td className="px-4 py-2 text-slate-500">{boutique.phone ?? '—'}</td>
                  <td className="px-4 py-2">
                    {canUpdate ? (
                      <button
                        onClick={() => handleToggleActive(boutique)}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${boutique.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                      >
                        {boutique.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                      </button>
                    ) : (
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${boutique.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                        {boutique.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                      </span>
                    )}
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2">
                    {canUpdate && (
                      <Link href={`/admin/boutiques/${boutique.id}`} className="text-navy hover:underline">
                        {t.common.edit}
                      </Link>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(boutique.id)} className="text-accent hover:underline">
                        {t.common.delete}
                      </button>
                    )}
                    {!canUpdate && !canDelete && <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
              {boutiques.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t.boutiquesPageAdmin.noBoutiques}
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
