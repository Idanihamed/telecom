import type { MetadataRoute } from 'next';
import { getArticles, getProducts, getPublishedPageSlugs } from '../lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Le catalogue/les actualités sont plafonnés à 100 éléments par page côté API (voir
// PaginationQueryDto) : on boucle sur toutes les pages plutôt que de se limiter à la première,
// pour que le sitemap reste complet même si le catalogue dépasse 100 produits un jour.
async function fetchAllPages<T>(fetchPage: (page: number) => Promise<{ data: T[]; meta: { totalPages: number } }>) {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await fetchPage(page);
    items.push(...result.data);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles, pages] = await Promise.all([
    fetchAllPages((page) => getProducts({ page, limit: 100 })).catch(() => []),
    fetchAllPages((page) => getArticles({ page, limit: 100 })).catch(() => []),
    getPublishedPageSlugs().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/produits`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/boutiques`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/actualites`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/produits/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/actualites/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${SITE_URL}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));

  return [...staticRoutes, ...productRoutes, ...articleRoutes, ...pageRoutes];
}
