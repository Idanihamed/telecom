'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../lib/cart';
import { formatPriceFCFA, getBoutiques, submitOrder } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { Boutique } from '../../../lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clear } = useCart();
  const { t } = useLocale();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [boutiqueId, setBoutiqueId] = useState('');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState(''); // honeypot, voir lib/api.ts
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    getBoutiques()
      .then(setBoutiques)
      .catch(() => setBoutiques([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await submitOrder({
        customerName: name,
        customerContact: contact,
        customerAddress: boutiqueId ? undefined : address || undefined,
        boutiqueId: boutiqueId || undefined,
        notes: notes || undefined,
        website,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      setReference(result.reference ?? null);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.checkout.error);
    } finally {
      setSaving(false);
    }
  }

  if (reference) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-700">
        <p className="font-semibold">{t.checkout.received}</p>
        <div className="mt-4 rounded-lg border border-green-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-green-600">{t.checkout.receivedBody}</p>
          <p className="mt-1 text-lg font-bold tracking-widest text-navy">{reference}</p>
          <p className="mt-2 text-xs text-slate-500">
            {t.checkout.trackingNote}{' '}
            <Link href={`/commandes/suivi?ref=${reference}`} className="font-medium text-navy underline">
              {t.checkout.trackingLink}
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="mb-6 text-slate-500">{t.cart.empty}</p>
        <Link href="/produits" className="rounded-full bg-navy px-6 py-3 font-semibold text-white">
          {t.cart.viewProducts}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-navy">{t.checkout.title}</h1>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between py-1 text-sm">
            <span className="text-slate-600">
              {item.quantity} × {item.name}
            </span>
            <span className="font-medium text-slate-800">{formatPriceFCFA(item.unitPrice * item.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-semibold text-navy">
          <span>{t.cart.total}</span>
          <span>{formatPriceFCFA(totalAmount)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t.checkout.name}</label>
          <input
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t.checkout.contact}</label>
          <input
            required
            minLength={3}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t.checkout.pickupLabel}</label>
          <select
            value={boutiqueId}
            onChange={(e) => setBoutiqueId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t.checkout.deliveryOption}</option>
            {boutiques.map((b) => (
              <option key={b.id} value={b.id}>
                {t.checkout.pickupOption} {b.name} ({b.address})
              </option>
            ))}
          </select>
        </div>

        {!boutiqueId && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t.checkout.deliveryAddress}</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.checkout.note} <span className="font-normal text-slate-400">({t.checkout.optional})</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
          <label htmlFor="website">Ne pas remplir ce champ</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? t.checkout.sending : t.checkout.confirm}
        </button>
      </form>
    </div>
  );
}
