'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminDeleteArticle,
  adminListArticles,
  adminPublishArticle,
  adminUnpublishArticle,
} from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';
import type { Article } from '../../../lib/types';

export default function AdminArticlesPage() {
  const { t } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const result = await adminListArticles(params);
      setArticles(result.data);
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

  async function handlePublishToggle(article: Article) {
    if (article.status === 'PUBLISHED') {
      await adminUnpublishArticle(article.id);
    } else {
      await adminPublishArticle(article.id);
    }
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t.newsPageAdmin.confirmDelete)) return;
    try {
      await adminDeleteArticle(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.newsPageAdmin.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.newsPageAdmin.title}</h1>
        <Link href="/admin/actualites/nouveau" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          {t.newsPageAdmin.newArticle}
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
          placeholder={t.newsPageAdmin.searchPlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.adminCommon.allStatuses}</option>
          <option value="PUBLISHED">{t.productForm.published}</option>
          <option value="DRAFT">{t.productForm.draft}</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.newsPageAdmin.search}
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
                <th className="px-4 py-2">{t.newsPageAdmin.titleColumn}</th>
                <th className="px-4 py-2">{t.newsPageAdmin.category}</th>
                <th className="px-4 py-2">{t.adminCommon.date}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-medium text-slate-800">{article.title}</td>
                  <td className="px-4 py-2 text-slate-500">{article.category ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {article.status === 'PUBLISHED' ? t.productForm.published : t.productForm.draft}
                    </span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2">
                    <Link href={`/admin/actualites/${article.id}`} className="text-navy hover:underline">
                      {t.common.edit}
                    </Link>
                    <button onClick={() => handlePublishToggle(article)} className="text-navy hover:underline">
                      {article.status === 'PUBLISHED' ? t.productsPage.unpublish : t.productsPage.publish}
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t.newsPageAdmin.noArticles}
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
