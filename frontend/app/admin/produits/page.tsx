'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminAdjustStock,
  adminDeleteProduct,
  adminDuplicateProduct,
  adminListProducts,
  adminPublishProduct,
  adminUnpublishProduct,
} from '../../../lib/admin-api';
import { formatPriceFCFA } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { Product } from '../../../lib/types';

export default function AdminProductsPage() {
  const { t } = useLocale();
  const STOCK_LABEL: Record<string, string> = { DISPONIBLE: t.stock.available, STOCK_FAIBLE: t.stock.low, RUPTURE: t.stock.out };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const result = await adminListProducts(params);
      setProducts(result.data);
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

  async function handlePublishToggle(product: Product) {
    if (product.status === 'PUBLISHED') {
      await adminUnpublishProduct(product.id);
    } else {
      await adminPublishProduct(product.id);
    }
    await load();
  }

  async function handleDuplicate(id: string) {
    await adminDuplicateProduct(id);
    await load();
  }

  async function handleAdjustStock(id: string, delta: number) {
    try {
      await adminAdjustStock(id, delta);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productsPage.stockAdjustError);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.productsPage.confirmDelete)) return;
    try {
      await adminDeleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productsPage.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.productsPage.title}</h1>
        <Link href="/admin/produits/nouveau" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
          {t.productsPage.newProduct}
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.productsPage.searchPlaceholder}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.adminCommon.allStatuses}</option>
          <option value="PUBLISHED">{t.productForm.published}</option>
          <option value="DRAFT">{t.productForm.draft}</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.productsPage.search}
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
                <th className="px-4 py-2">{t.adminCommon.name}</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">{t.productForm.price}</th>
                <th className="px-4 py-2">{t.productForm.stock}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-medium text-slate-800">{product.name}</td>
                  <td className="px-4 py-2 text-slate-400">{product.sku}</td>
                  <td className="px-4 py-2">{formatPriceFCFA(product.effectivePrice)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(product.id, -1)}
                        disabled={product.stock <= 0}
                        aria-label={t.productsPage.removeStock}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span>{product.stock}</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(product.id, 1)}
                        aria-label={t.productsPage.addStock}
                        className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-slate-100"
                      >
                        +
                      </button>
                      <span className="text-xs text-slate-400">({STOCK_LABEL[product.stockStatus]})</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {product.status === 'PUBLISHED' ? t.productForm.published : t.productForm.draft}
                    </span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2">
                    <Link href={`/admin/produits/${product.id}`} className="text-navy hover:underline">
                      {t.common.edit}
                    </Link>
                    <button onClick={() => handlePublishToggle(product)} className="text-navy hover:underline">
                      {product.status === 'PUBLISHED' ? t.productsPage.unpublish : t.productsPage.publish}
                    </button>
                    <button onClick={() => handleDuplicate(product.id)} className="text-navy hover:underline">
                      {t.productsPage.duplicate}
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    {t.productsPage.noProducts}
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
