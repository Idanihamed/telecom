'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../../lib/cart';
import { formatPriceFCFA } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';

export default function CartPage() {
  const { items, setQuantity, removeItem, totalAmount } = useCart();
  const { t } = useLocale();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-2 text-2xl font-bold text-navy">{t.cart.title}</h1>
        <p className="mb-6 text-slate-500">{t.cart.empty}</p>
        <Link href="/produits" className="rounded-full bg-navy px-6 py-3 font-semibold text-white">
          {t.cart.viewProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-navy">{t.cart.title}</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg bg-slate-100">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/produits/${item.slug}`} className="line-clamp-1 font-semibold text-slate-800 hover:text-navy">
                {item.name}
              </Link>
              <p className="text-sm text-slate-500">{formatPriceFCFA(item.unitPrice)}</p>
            </div>
            <div className="flex items-center rounded-full border border-slate-300">
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                className="px-2.5 py-1 text-slate-500 hover:text-navy"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="px-2.5 py-1 text-slate-500 hover:text-navy disabled:opacity-30"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            <p className="w-24 flex-none text-right font-semibold text-navy">
              {formatPriceFCFA(item.unitPrice * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              aria-label="Retirer du panier"
              className="flex-none text-slate-400 hover:text-accent"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <span className="font-semibold text-slate-700">{t.cart.total}</span>
        <span className="text-xl font-bold text-navy">{formatPriceFCFA(totalAmount)}</span>
      </div>

      <Link
        href="/commande"
        className="mt-4 block w-full rounded-full bg-navy py-3 text-center font-semibold text-white hover:bg-navy/90"
      >
        {t.cart.checkout}
      </Link>
    </div>
  );
}
