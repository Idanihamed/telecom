import Image from 'next/image';
import { notFound } from 'next/navigation';
import { buildImageUrl, getArticleBySlug } from '../../../../lib/api';
import { getServerDictionary } from '../../../../lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const article = await getArticleBySlug(params.slug);
    return {
      title: article.seoTitle ?? article.title,
      description: article.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const t = getServerDictionary();
  let article;
  try {
    article = await getArticleBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      {article!.category && <p className="text-sm uppercase tracking-wide text-accent">{article!.category}</p>}
      <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">{article!.title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {article!.author && (
          <>
            {t.newsPage.by} {article!.author} —{' '}
          </>
        )}
        {article!.publishedAt &&
          new Date(article!.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {article!.image && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={buildImageUrl(article!.image)} alt={article!.title} fill className="object-cover" />
        </div>
      )}

      {/* Contenu géré depuis l'administration (§20) : HTML simple de confiance (éditeurs internes). */}
      <div
        className="mt-8 space-y-4 text-slate-700 [&_a]:text-navy [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: article!.content }}
      />
    </article>
  );
}
