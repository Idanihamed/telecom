'use client';

import { BoutiqueForm } from '../../../../components/admin/BoutiqueForm';
import { useLocale } from '../../../../lib/i18n/context';

export default function NewBoutiquePage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.boutiqueForm.newBoutiqueTitle}</h1>
      <BoutiqueForm mode="create" />
    </div>
  );
}
