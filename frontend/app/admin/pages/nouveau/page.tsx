'use client';

import { PageForm } from '../../../../components/admin/PageForm';
import { useLocale } from '../../../../lib/i18n/context';

export default function NewContentPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.pagesPageAdmin.newPageTitle}</h1>
      <PageForm mode="create" />
    </div>
  );
}
