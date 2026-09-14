'use client';

// Filet de sécurité générique pour le site public : si une page Server Component lève une
// erreur non interceptée (API backend indisponible, réponse inattendue...), on affiche un
// message clair plutôt que la page d'erreur générique de Next.js.
export default function SitePublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-xl font-bold text-navy">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-slate-500">
        Impossible d&apos;afficher cette page pour le moment. Merci de réessayer dans quelques instants.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
