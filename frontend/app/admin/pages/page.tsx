'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminDeletePage, adminListPages, adminPublishPage, adminUnpublishPage } from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';
import type { Page } from '../../../lib/types';

export default function AdminPagesPage() {
  const { t } = useLocale();
  const [pages, setPages] = useState<Page[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setPages(await adminListPages());
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

  async function handlePublishToggle(page: Page) {
    if (page.status === 'PUBLISHED') {
      await adminUnpublishPage(page.id);
    } else {
      await adminPublishPage(page.id);
    }
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t.pagesPageAdmin.confirmDelete)) return;
    try {
      await adminDeletePage(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pagesPageAdmin.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.pagesPageAdmin.title}</h1>
        <Link href="/admin/pages/nouveau" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          {t.pagesPageAdmin.newPage}
        </Link>
      </div>
      <p className="mb-4 text-sm text-slate-500">{t.pagesPageAdmin.subtitle}</p>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.pagesPageAdmin.titleColumn}</th>
                <th className="px-4 py-2">URL</th>
                <th className="px-4 py-2">{t.pagesPageAdmin.updatedAt}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-medium text-slate-800">{page.title}</td>
                  <td className="px-4 py-2 text-slate-400">/{page.slug}</td>
                  <td className="px-4 py-2 text-slate-500">{new Date(page.updatedAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {page.status === 'PUBLISHED' ? t.productForm.published : t.productForm.draft}
                    </span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2">
                    <Link href={`/admin/pages/${page.id}`} className="text-navy hover:underline">
                      {t.common.edit}
                    </Link>
                    <button onClick={() => handlePublishToggle(page)} className="text-navy hover:underline">
                      {page.status === 'PUBLISHED' ? t.productsPage.unpublish : t.productsPage.publish}
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t.pagesPageAdmin.noPages}
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
