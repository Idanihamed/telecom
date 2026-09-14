import { DecorativeBlobs } from './DecorativeBlobs';

/**
 * Fond décoratif de toute la page (site public + admin) : blobs très atténués,
 * fixes derrière le contenu, pour éviter l'aplat blanc entre les sections/cartes.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white">
      <DecorativeBlobs variant="hero" soft />
    </div>
  );
}
