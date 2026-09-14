'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, type Dictionary, type Locale, getDictionary } from './dictionaries';

const COOKIE_NAME = 'amza_locale';
const COOKIE_MAX_AGE_DAYS = 365;

interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * `initialLocale` vient d'un Server Component (layout racine, voir app/layout.tsx) qui l'a lu
 * depuis le cookie `amza_locale` — nécessaire pour que le premier rendu serveur affiche déjà
 * la bonne langue (pas de flash FR->EN au chargement), contrairement au panier/thème qui ne
 * dépendent que de préférences purement visuelles sans contenu server-rendered à faire varier.
 */
export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();

  const setLocale = useCallback(
    (locale: Locale) => {
      document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE_DAYS * 24 * 60 * 60}; SameSite=Lax`;
      // Le cookie ne prend effet côté serveur qu'au prochain rendu : router.refresh() relance
      // les Server Components (ex. SiteFooter) avec la nouvelle langue sans recharger toute la
      // page ni perdre l'état client (panier, thème...).
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale: initialLocale, t: getDictionary(initialLocale), setLocale }),
    [initialLocale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale doit être utilisé sous LocaleProvider.');
  return ctx;
}

export { DEFAULT_LOCALE };
export type { Locale, Dictionary };
