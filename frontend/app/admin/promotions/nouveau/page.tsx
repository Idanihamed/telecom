'use client';

import { PromotionForm } from '../../../../components/admin/PromotionForm';
import { useLocale } from '../../../../lib/i18n/context';

export default function NewPromotionPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.promotionsPage.newPromotionTitle}</h1>
      <PromotionForm mode="create" />
    </div>
  );
}
