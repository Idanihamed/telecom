'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminGetOrder, adminSetOrderStatus } from '../../../../lib/admin-api';
import { formatPriceFCFA } from '../../../../lib/api';
import { useLocale } from '../../../../lib/i18n/context';
import type { AdminOrder, OrderStatus } from '../../../../lib/types';

const STATUS_CLASS: Record<OrderStatus, string> = {
  EN_ATTENTE: 'bg-blue-100 text-blue-700',
  CONFIRMEE: 'bg-amber-100 text-amber-700',
  EN_PREPARATION: 'bg-amber-100 text-amber-700',
  EXPEDIEE: 'bg-indigo-100 text-indigo-700',
  LIVREE: 'bg-green-100 text-green-700',
  ANNULEE: 'bg-red-100 text-red-700',
};

// Progression "normale" d'une commande — l'admin peut aussi annuler depuis n'importe quel
// statut (voir bouton dédié ci-dessous), donc pas inclus dans cet enchaînement linéaire.
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  EN_ATTENTE: 'CONFIRMEE',
  CONFIRMEE: 'EN_PREPARATION',
  EN_PREPARATION: 'EXPEDIEE',
  EXPEDIEE: 'LIVREE',
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { t } = useLocale();
  const STATUS_LABEL = t.orderTracking.status;
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGetOrder(params.id)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSetStatus(status: OrderStatus) {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSetOrderStatus(order.id, status);
      setOrder(updated);
    } catch (err) {
      // Ex. stock redevenu insuffisant en réactivant une commande annulée — voir
      // OrdersService.setStatus côté back-end.
      setError(err instanceof Error ? err.message : t.ordersPage.updateError);
    } finally {
      setSaving(false);
    }
  }

  if (error && !order) return <p className="text-accent">{error}</p>;
  if (!order) return <p className="text-slate-500">{t.common.loading}</p>;

  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">
          {t.ordersPage.title.replace(/s$/, '')} {order.reference}
        </h1>
        <Link href="/admin/commandes" className="text-sm text-slate-500 hover:text-navy">
          ← {t.adminCommon.back}
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-slate-400">
            {t.ordersPage.receivedOn} {new Date(order.createdAt).toLocaleString('fr-FR')}
          </span>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t.ordersPage.client}</dt>
            <dd className="text-sm text-slate-800">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t.ordersPage.contact}</dt>
            <dd className="text-sm text-slate-800">{order.customerContact}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-slate-400">
              {order.boutique ? t.ordersPage.pickupLabel : t.ordersPage.deliveryLabel}
            </dt>
            <dd className="text-sm text-slate-800">
              {order.boutique ? order.boutique.name : order.customerAddress || '—'}
            </dd>
          </div>
          {order.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-slate-400">{t.ordersPage.note}</dt>
              <dd className="whitespace-pre-wrap text-sm text-slate-800">{order.notes}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <dt className="mb-2 text-xs font-medium uppercase text-slate-400">{t.ordersPage.items}</dt>
          <div className="space-y-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.quantity} × {item.productName} ({formatPriceFCFA(item.unitPrice)})
                </span>
                <span className="font-medium text-slate-800">{formatPriceFCFA(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-semibold text-navy">
            <span>{t.ordersPage.total}</span>
            <span>{formatPriceFCFA(order.totalAmount)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {nextStatus && (
            <button
              disabled={saving}
              onClick={() => handleSetStatus(nextStatus)}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t.ordersPage.nextStatus} « {STATUS_LABEL[nextStatus]} »
            </button>
          )}
          {order.status !== 'ANNULEE' && order.status !== 'LIVREE' && (
            <button
              disabled={saving}
              onClick={() => handleSetStatus('ANNULEE')}
              className="rounded-lg border border-accent px-4 py-2 text-sm text-accent disabled:opacity-50"
            >
              {t.ordersPage.cancelOrder}
            </button>
          )}
          {order.status === 'ANNULEE' && (
            <button
              disabled={saving}
              onClick={() => handleSetStatus('EN_ATTENTE')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              {t.ordersPage.reactivateOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
