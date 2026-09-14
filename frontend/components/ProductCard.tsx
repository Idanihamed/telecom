'use client';

import Image from 'next/image';
import Link from 'next/link';
import { buildImageUrl, formatPriceFCFA } from '../lib/api';
import { useLocale } from '../lib/i18n/context';
import type { Product } from '../lib/types';

const STOCK_CLASS: Record<Product['stockStatus'], string> = {
  DISPONIBLE: 'bg-green-100 text-green-700',
  STOCK_FAIBLE: 'bg-amber-100 text-amber-700',
  RUPTURE: 'bg-red-100 text-red-700',
};

export function ProductCard({ product }: { product: Product }) {
  const { t } = useLocale();
  const mainImage = product.images.find((img) => img.isMain) ?? product.images[0];
  const stockLabel = { DISPONIBLE: t.stock.available, STOCK_FAIBLE: t.stock.low, RUPTURE: t.stock.out }[
    product.stockStatus
  ];

  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-square w-full bg-slate-100">
        {mainImage ? (
          <Image
            src={buildImageUrl(mainImage.url)}
            alt={mainImage.alt ?? product.name}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">{t.stock.noImage}</div>
        )}
        {product.onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-white">
            -{product.discountPercentage}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && <span className="text-xs uppercase text-slate-400">{product.brand.name}</span>}
        <h3 className="line-clamp-2 font-semibold text-slate-800">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            {product.onSale && (
              <span className="mr-2 text-xs text-slate-400 line-through">{formatPriceFCFA(product.price)}</span>
            )}
            <span className="font-bold text-navy">{formatPriceFCFA(product.effectivePrice)}</span>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${STOCK_CLASS[product.stockStatus]}`}>
            {stockLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
