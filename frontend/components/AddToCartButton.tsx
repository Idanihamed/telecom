'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../lib/cart';
import { buildImageUrl } from '../lib/api';
import { useLocale } from '../lib/i18n/context';
import type { Product } from '../lib/types';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockStatus === 'RUPTURE';
  const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: mainImage ? buildImageUrl(mainImage.url) : null,
        unitPrice: product.effectivePrice,
        stock: product.stock,
      },
      quantity,
    );
    setAdded(true);
  }

  if (outOfStock) {
    return (
      <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        {t.addToCart.outOfStock}
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-slate-300">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-slate-500 hover:text-navy"
          aria-label="-"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2 text-slate-500 hover:text-navy"
          aria-label="+"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="rounded-full bg-navy px-6 py-3 font-semibold text-white hover:bg-navy/90"
      >
        {t.addToCart.add}
      </button>

      {added && (
        <span className="text-sm text-green-700">
          {t.addToCart.added} —{' '}
          <Link href="/panier" className="font-medium underline">
            {t.addToCart.viewCart}
          </Link>
        </span>
      )}
    </div>
  );
}
