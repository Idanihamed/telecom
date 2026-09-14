'use client';

import { useEffect, useState } from 'react';
import { adminGetBoutique } from '../../../../lib/admin-api';
import { BoutiqueForm } from '../../../../components/admin/BoutiqueForm';
import { useLocale } from '../../../../lib/i18n/context';
import type { Boutique } from '../../../../lib/types';

export default function EditBoutiquePage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [boutique, setBoutique] = useState<Boutique | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetBoutique(params.id)
      .then(setBoutique)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <p className="text-accent">{error}</p>;
  if (!boutique) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">
        {t.boutiqueForm.editBoutiqueTitle.replace('{name}', boutique.name)}
      </h1>
      <BoutiqueForm mode="edit" boutiqueId={boutique.id} initialBoutique={boutique} />
    </div>
  );
}
