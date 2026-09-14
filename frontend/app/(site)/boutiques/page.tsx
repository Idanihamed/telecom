import Image from 'next/image';
import { buildImageUrl, getBoutiques } from '../../../lib/api';
import { getServerDictionary } from '../../../lib/i18n/server';

export default async function BoutiquesPage() {
  const t = getServerDictionary();
  const boutiques = await getBoutiques().catch(() => []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-navy">{t.boutiquesPage.title}</h1>
      <p className="mb-8 text-slate-500">{t.boutiquesPage.subtitle}</p>

      {boutiques.length === 0 ? (
        <p className="text-slate-500">{t.boutiquesPage.none}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {boutiques.map((boutique) => {
            const mainImage = boutique.images.find((img) => img.isMain) ?? boutique.images[0];
            return (
              <div key={boutique.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {mainImage && (
                  <div className="relative h-48 w-full bg-slate-100">
                    <Image
                      src={buildImageUrl(mainImage.url)}
                      alt={mainImage.alt ?? boutique.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-navy">{boutique.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{boutique.address}</p>
                  {boutique.hours && <p className="mt-1 text-sm text-slate-500">🕐 {boutique.hours}</p>}
                  {boutique.description && <p className="mt-3 text-sm text-slate-600">{boutique.description}</p>}

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {boutique.phone && (
                      <a href={`tel:${boutique.phone.replace(/\s+/g, '')}`} className="font-medium text-navy hover:underline">
                        📞 {boutique.phone}
                      </a>
                    )}
                    {boutique.whatsapp && (
                      <a
                        href={`https://wa.me/${boutique.whatsapp.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-green-700 hover:underline"
                      >
                        WhatsApp
                      </a>
                    )}
                    {boutique.googleMapsUrl && (
                      <a
                        href={boutique.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-navy hover:underline"
                      >
                        {t.boutiquesPage.seeOnMap}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
