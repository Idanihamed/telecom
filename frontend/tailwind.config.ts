import type { Config } from 'tailwindcss';

// Mode sombre par classe (`.dark` sur <html>, voir lib/theme.tsx) plutôt que par
// `prefers-color-scheme` seul : nécessaire pour que le visiteur/admin puisse choisir
// explicitement clair/sombre indépendamment du réglage de son système.
//
// `white`, `slate` et les couleurs de marque (`navy`, `accent`) sont redéfinies ici pour
// pointer vers des variables CSS (voir app/globals.css, valeurs différentes sous `.dark`)
// plutôt que des valeurs fixes. Comme la quasi-totalité des composants existants utilisent
// déjà ces classes (`bg-white`, `text-slate-800`, `border-slate-200`, `text-navy`...), cette
// seule redirection leur donne un rendu sombre cohérent sans devoir ajouter des variantes
// `dark:` composant par composant partout dans l'app.
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'var(--color-navy)',
        accent: 'var(--color-accent)',
        white: 'var(--color-white)',
        slate: {
          50: 'var(--slate-50)',
          100: 'var(--slate-100)',
          200: 'var(--slate-200)',
          300: 'var(--slate-300)',
          400: 'var(--slate-400)',
          500: 'var(--slate-500)',
          600: 'var(--slate-600)',
          700: 'var(--slate-700)',
          800: 'var(--slate-800)',
          900: 'var(--slate-900)',
          950: 'var(--slate-950)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
