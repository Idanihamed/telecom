import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, getDictionary, isLocale } from './dictionaries';

/**
 * Pour les Server Components (ex. SiteFooter) : `useLocale()` (lib/i18n/context.tsx) est un
 * contexte React, donc client-only. Ici on relit directement le cookie `amza_locale`, comme
 * le fait le layout racine pour `<html lang>`.
 */
export function getServerDictionary() {
  const localeCookie = cookies().get('amza_locale')?.value;
  const locale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
  return getDictionary(locale);
}
