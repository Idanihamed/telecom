import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { PageBackdrop } from '../components/PageBackdrop';
import { ThemeProvider } from '../lib/theme';
import { LocaleProvider } from '../lib/i18n/context';
import { DEFAULT_LOCALE, isLocale } from '../lib/i18n/dictionaries';

export const metadata: Metadata = {
  title: 'Amza Futur Telecom',
  description: 'Votre technologie. Votre futur.',
};

// Exécuté avant l'hydratation React : applique la classe `dark` dès le premier paint à
// partir du choix déjà mémorisé (localStorage) ou, à défaut, de la préférence système —
// sans ça, la page s'afficherait toujours en clair une fraction de seconde avant de basculer
// en sombre au montage de ThemeProvider (voir lib/theme.tsx).
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('amza_theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const localeCookie = cookies().get('amza_locale')?.value;
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <PageBackdrop />
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
