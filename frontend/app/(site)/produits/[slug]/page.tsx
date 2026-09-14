import { notFound } from 'next/navigation';
import { WHATSAPP_NUMBER, formatPriceFCFA, getProductBySlug } from '../../../../lib/api';
import { ProductCard } from '../../../../components/ProductCard';
import { ProductGallery } from '../../../../components/ProductGallery';
import { AddToCartButton } from '../../../../components/AddToCartButton';
import { getServerDictionary } from '../../../../lib/i18n/server';

const STOCK_CLASS: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-700',
  STOCK_FAIBLE: 'bg-amber-100 text-amber-700',
  RUPTURE: 'bg-red-100 text-red-700',
};

function buildWhatsAppMessage(productName: string, price: number) {
  // Message généré automatiquement — voir §18 du cahier des charges.
  const text = `Bonjour Amza Futur Telecom,\n\nJe suis intéressé par :\nProduit : ${productName}\nPrix : ${formatPriceFCFA(price)}\nQuantité : 1\n\nMerci.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const t = getServerDictionary();
  let data;
  try {
    data = await getProductBySlug(params.slug);
  } catch {
    notFound();
  }

  const { product, similarProducts } = data!;
  const stockLabel = { DISPONIBLE: t.stock.available, STOCK_FAIBLE: t.stock.low, RUPTURE: t.stock.out }[
    product.stockStatus
  ];

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand && <p className="text-sm uppercase text-slate-400">{product.brand.name}</p>}
          <h1 className="text-2xl font-bold text-navy">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.productDetail.reference} : {product.sku}
          </p>
          {product.category && (
            <p className="text-sm text-slate-400">
              {t.productDetail.category} : {product.category.name}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3">
            {product.onSale && <span className="text-lg text-slate-400 line-through">{formatPriceFCFA(product.price)}</span>}
            <span className="text-3xl font-bold text-navy">{formatPriceFCFA(product.effectivePrice)}</span>
            {product.onSale && (
              <span className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-white">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${STOCK_CLASS[product.stockStatus]}`}>
            {stockLabel}
          </span>

          {product.shortDescription && <p className="mt-4 text-slate-600">{product.shortDescription}</p>}

          {product.warranty && (
            <p className="mt-2 text-sm text-slate-500">
              {t.productDetail.warranty} : {product.warranty}
            </p>
          )}

          <AddToCartButton product={product} />

          <a
            href={buildWhatsAppMessage(product.name, product.effectivePrice)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:underline"
          >
            {t.productDetail.orWhatsapp}
          </a>

          {product.attributes.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 font-semibold text-navy">{t.productDetail.characteristics}</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.attributes.map((attr) => (
                    <tr key={attr.key} className="border-b border-slate-100">
                      <td className="py-2 text-slate-500">{attr.key}</td>
                      <td className="py-2 font-medium text-slate-800">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 font-semibold text-navy">{t.productDetail.description}</h2>
              <p className="whitespace-pre-line text-slate-600">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-navy">{t.productDetail.similarProducts}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
