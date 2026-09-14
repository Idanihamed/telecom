'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatPriceFCFA, trackOrder } from '../../../../lib/api';
import { useLocale } from '../../../../lib/i18n/context';
import type { OrderTracking } from '../../../../lib/types';

const STATUS_CLASS: Record<OrderTracking['status'], string> = {
  EN_ATTENTE: 'bg-blue-100 text-blue-700',
  CONFIRMEE: 'bg-amber-100 text-amber-700',
  EN_PREPARATION: 'bg-amber-100 text-amber-700',
  EXPEDIEE: 'bg-indigo-100 text-indigo-700',
  LIVREE: 'bg-green-100 text-green-700',
  ANNULEE: 'bg-red-100 text-red-700',
};

function SuiviCommandeForm() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [reference, setReference] = useState(searchParams.get('ref') ?? '');
  const [contact, setContact] = useState('');
  const [result, setResult] = useState<OrderTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const tracking = await trackOrder(reference.trim(), contact.trim());
      setResult(tracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.orderTracking.searchError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold text-navy">{t.orderTracking.title}</h1>
      <p className="mb-6 text-sm text-slate-500">{t.orderTracking.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t.orderTracking.trackingNumber}</label>
          <input
            required
            minLength={8}
            maxLength={8}
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            placeholder="ex. A3K9F7Q2"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-widest"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.orderTracking.contact} <span className="font-normal text-slate-400">({t.orderTracking.contactHint})</span>
          </label>
          <input
            required
            minLength={3}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? t.orderTracking.searching : t.orderTracking.verify}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[result.status]}`}>
              {t.orderTracking.status[result.status]}
            </span>
            <span className="text-xs text-slate-400">
              {t.orderTracking.sentOn} {new Date(result.createdAt).toLocaleString('fr-FR')}
            </span>
          </div>

          <div className="space-y-1 border-b border-slate-100 pb-3">
            {result.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.quantity} × {item.productName}
                </span>
                <span className="font-medium text-slate-800">{formatPriceFCFA(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 font-semibold text-navy">
            <span>{t.cart.total}</span>
            <span>{formatPriceFCFA(result.totalAmount)}</span>
          </div>

          {result.boutique ? (
            <p className="mt-3 text-sm text-slate-500">
              {t.orderTracking.pickup} : {result.boutique.name} ({result.boutique.address})
            </p>
          ) : (
            result.customerAddress && (
              <p className="mt-3 text-sm text-slate-500">
                {t.orderTracking.delivery} : {result.customerAddress}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default function SuiviCommandePage() {
  return (
    <Suspense fallback={<p className="text-slate-500">…</p>}>
      <SuiviCommandeForm />
    </Suspense>
  );
}
