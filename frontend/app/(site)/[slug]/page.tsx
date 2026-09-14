import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildImageUrl, getPageBySlug } from '../../../lib/api';

// Route catch-all pour les Pages de contenu administrables (§22) : À propos, Livraison,
// Garantie et SAV, Mentions légales, CGU, Politique de confidentialité, etc. Une page créée
// dans l'admin devient automatiquement accessible ici, sans déploiement (§42). Les segments
// réservés (produits, boutiques, actualites, admin...) sont interceptés par leurs propres
// routes avant d'arriver ici, et sont refusés comme slug côté admin (voir pages.service.ts).
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const page = await getPageBySlug(params.slug);
    return {
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function ContentPage({ params }: { params: { slug: string } }) {
  let page;
  try {
    page = await getPageBySlug(params.slug);
  } catch {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl">{page!.title}</h1>

      {page!.image && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={buildImageUrl(page!.image)} alt={page!.title} fill className="object-cover" />
        </div>
      )}

      <div
        className="mt-8 space-y-4 text-slate-700 [&_a]:text-navy [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: page!.content }}
      />
    </article>
  );
}
