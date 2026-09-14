'use client';

import { useEffect, useState } from 'react';
import { adminGetPromotion } from '../../../../lib/admin-api';
import { PromotionForm } from '../../../../components/admin/PromotionForm';
import { useLocale } from '../../../../lib/i18n/context';
import type { Promotion } from '../../../../lib/types';

export default function EditPromotionPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetPromotion(params.id)
      .then(setPromotion)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <p className="text-accent">{error}</p>;
  if (!promotion) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">
        {t.promotionsPage.editPromotionTitle.replace('{name}', promotion.name)}
      </h1>
      <PromotionForm mode="edit" promotionId={promotion.id} initialPromotion={promotion} />
    </div>
  );
}
