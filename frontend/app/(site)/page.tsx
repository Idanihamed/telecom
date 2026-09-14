import Image from 'next/image';
import Link from 'next/link';
import {
  WHATSAPP_NUMBER,
  buildImageUrl,
  getActivePromotions,
  getArticles,
  getBoutiques,
  getCategories,
  getFeaturedProducts,
  getPageBySlug,
  getSettings,
} from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { DecorativeBlobs } from '../../components/DecorativeBlobs';
import { getServerDictionary } from '../../lib/i18n/server';

// Résumé texte brut d'un contenu HTML simple, pour un aperçu sur l'accueil (§5.7).
function excerpt(html: string, maxLength = 220): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

export default async function HomePage() {
  const t = getServerDictionary();
  const [categories, featuredProducts, activePromotions, boutiques, recentArticles, aboutPage, settings] = await Promise.all([
    getCategories().catch(() => []),
    getFeaturedProducts().catch(() => []),
    getActivePromotions().catch(() => []),
    getBoutiques().catch(() => []),
    getArticles({ limit: 3 })
      .then((res) => res.data)
      .catch(() => []),
    getPageBySlug('a-propos').catch(() => null),
    getSettings().catch(() => null),
  ]);

  return (
    <div className="flex flex-col gap-16">
      {/* Hero — contenu administrable prévu au §5.2 du cahier des charges (à brancher sur un futur module Contenu) */}
      <section className="relative overflow-hidden rounded-2xl bg-navy px-8 py-16 text-white">
        <DecorativeBlobs variant="hero" />
        <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold sm:text-4xl">{t.home.heroTitle}</h1>
            <p className="mx-auto mt-3 max-w-xl text-slate-200 md:mx-0">{t.home.heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/produits" className="rounded-full bg-white px-6 py-3 font-semibold text-navy hover:bg-slate-100">
                {t.home.discoverProducts}
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                {t.home.orderWhatsapp}
              </a>
            </div>
          </div>
          {/* Visuels configurables depuis Admin > Paramètres (Settings.heroImage1/2) : remplaçables
              par Amza avec ses propres photos, sans intervention technique. */}
          <div className="relative hidden h-72 md:block lg:h-80">
            {settings?.heroImage1 || settings?.heroImage2 ? (
              <>
                {settings?.heroImage2 && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl">
                    <Image src={buildImageUrl(settings.heroImage2)} alt="" fill className="object-cover" />
                  </div>
                )}
                {settings?.heroImage1 && (
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 overflow-hidden rounded-2xl border-4 border-navy shadow-xl sm:h-40 sm:w-40">
                    <Image src={buildImageUrl(settings.heroImage1)} alt="" fill className="object-cover" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/20 text-sm text-white/50">
                {t.stock.noImage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promotions actives (§5.5, §13-17 du cahier des charges) */}
      {activePromotions.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-navy">{t.home.activePromotions}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {activePromotions.map((promo) => (
              <Link
                key={promo.id}
                href="/produits?onSale=true"
                className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-accent px-6 py-8 text-white transition hover:opacity-95"
              >
                {/* Image de bannière (§16) : réglable depuis l'admin (PromotionForm) mais
                    jusqu'ici jamais affichée nulle part côté site public — le champ existait
                    en base et dans le formulaire sans le moindre effet visible pour le client.
                    Assombrissement (§ overlay) pour garder le texte lisible sur une image claire. */}
                {promo.bannerImage && (
                  <Image
                    src={buildImageUrl(promo.bannerImage)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                )}
                {promo.bannerImage && <div className="absolute inset-0 bg-black/40" />}
                <span className="relative text-2xl font-bold">{promo.bannerTitle ?? promo.name}</span>
                {promo.bannerSubtitle && <span className="relative mt-1 text-white/90">{promo.bannerSubtitle}</span>}
                <span className="relative mt-3 text-sm text-white/80">
                  {promo.type === 'PERCENTAGE' ? `${t.home.upTo} -${promo.value}%` : t.home.viewSaleProducts}{' '}
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-navy">{t.home.categories}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produits?category=${category.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 text-center font-medium text-slate-700 transition hover:border-navy hover:text-navy"
              >
                {category.image ? (
                  <div className="relative h-24 w-full overflow-hidden sm:h-28">
                    <Image
                      src={buildImageUrl(category.image)}
                      alt=""
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center bg-slate-50 text-2xl sm:h-28">🗂️</div>
                )}
                <div className="p-3">{category.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold text-navy">{t.home.featuredProducts}</h2>
        {featuredProducts.length === 0 ? (
          <p className="text-slate-500">{t.home.noFeatured}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Boutiques actives (§5.8, §19 du cahier des charges) */}
      {boutiques.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">{t.home.ourBoutiques}</h2>
            <Link href="/boutiques" className="text-sm font-medium text-navy hover:underline">
              {t.home.seeAllBoutiques}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boutiques.slice(0, 3).map((boutique) => {
              const mainImage = boutique.images.find((img) => img.isMain) ?? boutique.images[0];
              return (
                <Link
                  key={boutique.id}
                  href="/boutiques"
                  className="overflow-hidden rounded-xl border border-slate-200 hover:border-navy"
                >
                  {mainImage && (
                    <div className="relative h-32 w-full bg-slate-100">
                      <Image
                        src={buildImageUrl(mainImage.url)}
                        alt={mainImage.alt ?? boutique.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800">{boutique.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{boutique.address}</p>
                    {boutique.hours && <p className="mt-2 text-xs text-slate-400">🕐 {boutique.hours}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Présentation de l'entreprise (§5.7) : contenu piloté par la page "À propos" (§22) */}
      {aboutPage && (
        <section className="rounded-2xl border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-navy">{aboutPage.title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{excerpt(aboutPage.content)}</p>
          <Link href="/a-propos" className="mt-4 inline-block text-sm font-semibold text-navy hover:underline">
            {t.home.learnMore}
          </Link>
        </section>
      )}

      {/* Actualités récentes (§12 du plan du site, §20 du cahier des charges) */}
      {recentArticles.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">{t.home.latestNews}</h2>
            <Link href="/actualites" className="text-sm font-medium text-navy hover:underline">
              {t.home.seeAllNews}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/actualites/${article.slug}`}
                className="rounded-xl border border-slate-200 p-5 hover:border-navy"
              >
                {article.category && <span className="text-xs uppercase text-slate-400">{article.category}</span>}
                <h3 className="mt-1 font-semibold text-slate-800">{article.title}</h3>
                {article.publishedAt && (
                  <span className="mt-2 block text-xs text-slate-400">
                    {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/*
        La section Réseaux sociaux (§5.9 du cahier des charges) sera ajoutée dans une
        phase suivante (module Paramètres généraux, §24).
      */}
    </div>
  );
}
