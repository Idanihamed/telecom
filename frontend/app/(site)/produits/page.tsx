import Link from 'next/link';
import { getBrands, getCategories, getProducts } from '../../../lib/api';
import type { ProductFilters } from '../../../lib/api';
import { ProductCard } from '../../../components/ProductCard';
import { getServerDictionary } from '../../../lib/i18n/server';

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

const SORT_VALUES: ProductFilters['sort'][] = ['price_asc', 'price_desc', 'newest', 'name_asc'];

/** Un entier positif uniquement — sinon `undefined` plutôt que de transmettre une valeur
 * invalide (NaN, décimale...) à l'API, qui la rejetterait avec un 400 (validation stricte
 * côté back-end sur page/minPrice/maxPrice). */
function toSafeInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

function toSafeSort(value: string | undefined): ProductFilters['sort'] | undefined {
  return SORT_VALUES.includes(value as ProductFilters['sort']) ? (value as ProductFilters['sort']) : undefined;
}

const EMPTY_RESULT = { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };

export default async function ProduitsPage({ searchParams }: PageProps) {
  const t = getServerDictionary();
  const page = toSafeInt(searchParams.page) || 1;
  const [categories, brands, result] = await Promise.all([
    getCategories().catch(() => []),
    getBrands().catch(() => []),
    getProducts({
      page,
      search: searchParams.search,
      category: searchParams.category,
      brand: searchParams.brand,
      minPrice: toSafeInt(searchParams.minPrice),
      maxPrice: toSafeInt(searchParams.maxPrice),
      available: searchParams.available === 'true',
      onSale: searchParams.onSale === 'true',
      sort: toSafeSort(searchParams.sort),
    }).catch(() => EMPTY_RESULT),
  ]);

  const { data: products, meta } = result;

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set('page', String(targetPage));
    return `/produits?${params.toString()}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <form method="get" className="space-y-4 rounded-xl border border-slate-200 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.search}</label>
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder={t.products.searchPlaceholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.category}</label>
            <select name="category" defaultValue={searchParams.category ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t.products.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.brand}</label>
            <select name="brand" defaultValue={searchParams.brand ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="">{t.products.allBrands}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.minPrice}</label>
              <input type="number" name="minPrice" defaultValue={searchParams.minPrice} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.maxPrice}</label>
              <input type="number" name="maxPrice" defaultValue={searchParams.maxPrice} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="available" value="true" defaultChecked={searchParams.available === 'true'} />
            {t.products.availableOnly}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="onSale" value="true" defaultChecked={searchParams.onSale === 'true'} />
            {t.products.onSaleOnly}
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">{t.products.sortBy}</label>
            <select name="sort" defaultValue={searchParams.sort ?? 'newest'} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="newest">{t.products.sortNewest}</option>
              <option value="price_asc">{t.products.sortPriceAsc}</option>
              <option value="price_desc">{t.products.sortPriceDesc}</option>
              <option value="name_asc">{t.products.sortNameAsc}</option>
            </select>
          </div>

          <button type="submit" className="w-full rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:bg-navy/90">
            {t.products.filter}
          </button>
        </form>
      </aside>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-navy">{t.products.title}</h1>
          <span className="text-sm text-slate-500">
            {meta.total} {t.products.resultsCount}
          </span>
        </div>

        {products.length === 0 ? (
          <p className="text-slate-500">{t.products.noResults}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPageHref(p)}
                className={`rounded-lg px-3 py-1 text-sm ${p === meta.page ? 'bg-navy text-white' : 'border border-slate-300 text-slate-600'}`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
