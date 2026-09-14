'use client';

import { ProductForm } from '../../../../components/admin/ProductForm';
import { useLocale } from '../../../../lib/i18n/context';

export default function NewProductPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.productsPage.newProductTitle}</h1>
      <ProductForm mode="create" />
    </div>
  );
}
