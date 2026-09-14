const PALETTES = {
  hero: ['bg-accent', 'bg-sky-400', 'bg-navy'],
  login: ['bg-navy', 'bg-accent'],
} as const;

/**
 * Fond décoratif "3D léger" : blobs dégradés flous en mouvement lent, posés derrière
 * le contenu (voir §propositions design — effet de profondeur sans dépendance 3D lourde).
 */
export function DecorativeBlobs({
  variant,
  soft = false,
}: {
  variant: keyof typeof PALETTES;
  /** Version atténuée destinée à un fond de page plein écran, derrière du contenu clair. */
  soft?: boolean;
}) {
  const colors = PALETTES[variant];
  const softClass = soft ? 'blob-soft' : '';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className={`blob ${softClass} ${colors[0]} left-[-8%] top-[-25%] h-72 w-72`}
        style={{ animationDelay: '0s' }}
      />
      <span
        className={`blob ${softClass} ${colors[1]} right-[-10%] top-[5%] h-64 w-64`}
        style={{ animationDelay: '2.5s' }}
      />
      {colors[2] && (
        <span
          className={`blob ${softClass} ${colors[2]} bottom-[-25%] left-[35%] h-80 w-80`}
          style={{ animationDelay: '5s' }}
        />
      )}
    </div>
  );
}
