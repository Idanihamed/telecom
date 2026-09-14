'use client';

import { FaMoon, FaSun } from 'react-icons/fa6';
import { useTheme } from '../lib/theme';
import { useLocale } from '../lib/i18n/context';
import type { Locale } from '../lib/i18n/dictionaries';

/**
 * Sélecteurs de thème (clair/sombre) et de langue (FR/EN), partagés entre le site public
 * (SiteHeader) et le back-office (AdminNav) : même mécanique des deux côtés, voir
 * lib/theme.tsx (préférence par appareil) et lib/i18n/context.tsx (cookie, lu côté serveur).
 */
export function PreferencesToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { locale, t, setLocale } = useLocale();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t.theme.toggle}
        title={t.theme.toggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy"
      >
        {theme === 'dark' ? <FaSun aria-hidden size={14} /> : <FaMoon aria-hidden size={14} />}
      </button>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={t.language.label}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
