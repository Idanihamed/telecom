'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminListOrders } from '../../../lib/admin-api';
import { formatPriceFCFA } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { AdminOrder, OrderStatus } from '../../../lib/types';

const STATUS_CLASS: Record<OrderStatus, string> = {
  EN_ATTENTE: 'bg-blue-100 text-blue-700',
  CONFIRMEE: 'bg-amber-100 text-amber-700',
  EN_PREPARATION: 'bg-amber-100 text-amber-700',
  EXPEDIEE: 'bg-indigo-100 text-indigo-700',
  LIVREE: 'bg-green-100 text-green-700',
  ANNULEE: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const { t } = useLocale();
  const STATUS_LABEL = t.orderTracking.status;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const result = await adminListOrders(params);
      setOrders(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.ordersPage.title}</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.adminCommon.allStatuses}</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.adminCommon.filter}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.ordersPage.reference}</th>
                <th className="px-4 py-2">{t.ordersPage.client}</th>
                <th className="px-4 py-2">{t.ordersPage.total}</th>
                <th className="px-4 py-2">{t.adminCommon.date}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-mono text-xs font-medium tracking-widest text-slate-600">
                    {order.reference}
                  </td>
                  <td className="px-4 py-2 text-slate-800">{order.customerName}</td>
                  <td className="px-4 py-2 font-medium text-navy">{formatPriceFCFA(order.totalAmount)}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/commandes/${order.id}`} className="text-navy hover:underline">
                      {t.adminCommon.view}
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    {t.ordersPage.noOrders}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
