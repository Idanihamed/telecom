'use client';

import { useEffect, useState } from 'react';
import { adminGetArticle } from '../../../../lib/admin-api';
import { ArticleForm } from '../../../../components/admin/ArticleForm';
import { useLocale } from '../../../../lib/i18n/context';
import type { Article } from '../../../../lib/types';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetArticle(params.id)
      .then(setArticle)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <p className="text-accent">{error}</p>;
  if (!article) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">
        {t.newsPageAdmin.editArticleTitle.replace('{title}', article.title)}
      </h1>
      <ArticleForm mode="edit" articleId={article.id} initialArticle={article} />
    </div>
  );
}
