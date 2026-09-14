'use client';

import { useEffect, useState } from 'react';
import { adminGetPage } from '../../../../lib/admin-api';
import { PageForm } from '../../../../components/admin/PageForm';
import { useLocale } from '../../../../lib/i18n/context';
import type { Page } from '../../../../lib/types';

export default function EditContentPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetPage(params.id)
      .then(setPage)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <p className="text-accent">{error}</p>;
  if (!page) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">
        {t.pagesPageAdmin.editPageTitle.replace('{title}', page.title)}
      </h1>
      <PageForm mode="edit" pageId={page.id} initialPage={page} />
    </div>
  );
}
