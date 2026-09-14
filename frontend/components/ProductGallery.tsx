'use client';

import Image from 'next/image';
import { useState } from 'react';
import { buildImageUrl } from '../lib/api';
import type { ProductImage } from '../lib/types';

// Petit composant client dédié à la galerie photo d'une fiche produit : la page parente
// reste un Server Component, seule cette interaction (changer l'image principale au clic
// sur une vignette) a besoin d'être côté client.
export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const safeImages = images.length > 0 ? images : [{ id: 'placeholder', url: '', alt: productName, isMain: true }];
  const [selectedId, setSelectedId] = useState(safeImages[0].id);
  const selected = safeImages.find((img) => img.id === selectedId) ?? safeImages[0];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
        {selected.url ? (
          <Image src={buildImageUrl(selected.url)} alt={selected.alt ?? productName} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Pas d&apos;image</div>
        )}
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {safeImages.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedId(img.id)}
              aria-label={`Voir l'image ${img.alt ?? productName}`}
              className={`relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-2 transition ${
                img.id === selected.id ? 'ring-navy' : 'ring-transparent hover:ring-slate-300'
              }`}
            >
              <Image src={buildImageUrl(img.url)} alt={img.alt ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
