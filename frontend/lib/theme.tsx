'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'amza_theme';

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

// Préférence individuelle (visiteur ou admin), stockée en localStorage — comme le panier
// (voir lib/cart.tsx), volontairement pas un réglage global côté serveur : chacun choisit
// pour son propre confort visuel, ça ne concerne personne d'autre.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lu une seule fois au montage : le script inline dans <head> (voir app/layout.tsx) a déjà
  // posé la classe `dark` avant l'hydratation pour éviter un flash clair/sombre — on relit ici
  // simplement le même choix pour que React et le DOM restent d'accord.
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setThemeState(initial);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Stockage indisponible (navigation privée) : le choix reste actif pour la session en
      // cours, simplement pas mémorisé pour la prochaine visite.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé sous ThemeProvider.');
  return ctx;
}
