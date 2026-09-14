import Link from 'next/link';
import type { IconType } from 'react-icons';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok, FaWhatsapp, FaXTwitter, FaYoutube } from 'react-icons/fa6';
import { getSettings } from '../lib/api';
import type { Settings } from '../lib/types';
import { getServerDictionary } from '../lib/i18n/server';

// Liens utiles (§5.10) : chaque page pointe vers une Page de contenu administrable (§22).
// Si l'admin n'a pas encore créé/publié une de ces pages, son lien mènera à un 404 — c'est
// attendu tant que le contenu n'existe pas encore.
function buildUsefulLinks(t: ReturnType<typeof getServerDictionary>) {
  return [
    { href: '/a-propos', label: t.footer.links.about },
    { href: '/livraison', label: t.footer.links.delivery },
    { href: '/garantie-et-sav', label: t.footer.links.warranty },
    { href: '/mentions-legales', label: t.footer.links.legal },
    { href: '/boutiques', label: t.footer.links.boutiques },
    { href: '/actualites', label: t.footer.links.news },
    { href: '/contact', label: t.footer.links.contact },
  ];
}

// Réseaux sociaux configurés depuis l'admin (§24, page Paramètres) : seuls ceux renseignés
// s'affichent, dans cet ordre. Icônes officielles (react-icons/fa6) + couleur de marque,
// plus reconnaissables que des émojis génériques.
const SOCIAL_ICONS: {
  key: keyof Settings;
  label: string;
  Icon: IconType;
  color: string;
  toHref: (value: string) => string;
}[] = [
  { key: 'facebookUrl', label: 'Facebook', Icon: FaFacebookF, color: '#1877F2', toHref: (v) => v },
  { key: 'instagramUrl', label: 'Instagram', Icon: FaInstagram, color: '#E1306C', toHref: (v) => v },
  { key: 'tiktokUrl', label: 'TikTok', Icon: FaTiktok, color: '#000000', toHref: (v) => v },
  { key: 'youtubeUrl', label: 'YouTube', Icon: FaYoutube, color: '#FF0000', toHref: (v) => v },
  { key: 'linkedinUrl', label: 'LinkedIn', Icon: FaLinkedinIn, color: '#0A66C2', toHref: (v) => v },
  { key: 'xUrl', label: 'X', Icon: FaXTwitter, color: '#000000', toHref: (v) => v },
  { key: 'whatsappNumber', label: 'WhatsApp', Icon: FaWhatsapp, color: '#25D366', toHref: (v) => `https://wa.me/${v}` },
];

export async function SiteFooter() {
  const settings = await getSettings().catch(() => null);
  const activeSocials = settings ? SOCIAL_ICONS.filter((s) => settings[s.key]) : [];
  const t = getServerDictionary();
  const usefulLinks = buildUsefulLinks(t);

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <p className="font-semibold text-navy">Amza Futur Telecom</p>
          <p className="mt-1">{t.footer.tagline}</p>
          {activeSocials.length > 0 && (
            <div className="mt-4 flex gap-2">
              {activeSocials.map((social) => (
                <a
                  key={social.key}
                  href={social.toHref(settings![social.key] as string)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <social.Icon aria-hidden size={16} color={social.color} />
                </a>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()} Amza Futur Telecom.</p>
        </div>
        <div>
          <p className="font-semibold text-navy">{t.footer.usefulLinks}</p>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {usefulLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-navy hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
