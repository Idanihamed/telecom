'use client';

import { ArticleForm } from '../../../../components/admin/ArticleForm';
import { useLocale } from '../../../../lib/i18n/context';

export default function NewArticlePage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.newsPageAdmin.newArticleTitle}</h1>
      <ArticleForm mode="create" />
    </div>
  );
}
