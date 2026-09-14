import Image from 'next/image';
import Link from 'next/link';
import { buildImageUrl, getArticles } from '../../../lib/api';
import { getServerDictionary } from '../../../lib/i18n/server';

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function ActualitesPage({ searchParams }: PageProps) {
  const t = getServerDictionary();
  const page = Number(searchParams.page ?? '1') || 1;
  const { data: articles, meta } = await getArticles({ page, category: searchParams.category }).catch(() => ({
    data: [],
    meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
  }));

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-navy">{t.newsPage.title}</h1>

      {articles.length === 0 ? (
        <p className="text-slate-500">{t.newsPage.none}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
            >
              {article.image && (
                <div className="relative aspect-video w-full bg-slate-100">
                  <Image src={buildImageUrl(article.image)} alt={article.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-1 p-4">
                {article.category && <span className="text-xs uppercase text-slate-400">{article.category}</span>}
                <h2 className="font-semibold text-slate-800">{article.title}</h2>
                {article.publishedAt && (
                  <span className="mt-auto pt-2 text-xs text-slate-400">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/actualites?page=${p}`}
              className={`rounded-lg px-3 py-1 text-sm ${p === meta.page ? 'bg-navy text-white' : 'border border-slate-300 text-slate-600'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
