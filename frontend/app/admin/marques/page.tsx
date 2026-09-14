'use client';

import { useEffect, useState } from 'react';
import { adminCreateBrand, adminDeleteBrand, adminListBrands, adminUpdateBrand } from '../../../lib/admin-api';
import type { Brand } from '../../../lib/types';
import { usePermissions } from '../../../lib/permissions';
import { useLocale } from '../../../lib/i18n/context';

export default function AdminBrandsPage() {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('brands:create');
  const canUpdate = hasPermission('brands:update');
  const canDelete = hasPermission('brands:delete');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setBrands(await adminListBrands());
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await adminCreateBrand({ name });
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.error);
    }
  }

  async function handleToggleActive(brand: Brand) {
    await adminUpdateBrand(brand.id, { isActive: !brand.isActive });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t.brandsPage.confirmDelete)) return;
    try {
      await adminDeleteBrand(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.deleteError);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.brandsPage.title}</h1>

      {canCreate && (
        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.brandsPage.namePlaceholder}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            {t.adminCommon.add}
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">{t.adminCommon.name}</th>
              <th className="px-4 py-2">{t.adminCommon.slug}</th>
              <th className="px-4 py-2">{t.adminCommon.status}</th>
              <th className="px-4 py-2">{t.adminCommon.actions}</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                <td className="px-4 py-2">{brand.name}</td>
                <td className="px-4 py-2 text-slate-400">{brand.slug}</td>
                <td className="px-4 py-2">
                  {canUpdate ? (
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {brand.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                    </button>
                  ) : (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {brand.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  {canDelete ? (
                    <button onClick={() => handleDelete(brand.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
