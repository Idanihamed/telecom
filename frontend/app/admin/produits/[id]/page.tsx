'use client';

import { useEffect, useState } from 'react';
import { adminGetProduct } from '../../../../lib/admin-api';
import { ProductForm } from '../../../../components/admin/ProductForm';
import { useLocale } from '../../../../lib/i18n/context';
import type { Product } from '../../../../lib/types';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetProduct(params.id)
      .then(setProduct)
      .catch((err) => setError(err.message));
  }, [params.id]);

  if (error) return <p className="text-accent">{error}</p>;
  if (!product) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">
        {t.productsPage.editProductTitle.replace('{name}', product.name)}
      </h1>
      <ProductForm mode="edit" productId={product.id} initialProduct={product} />
    </div>
  );
}
