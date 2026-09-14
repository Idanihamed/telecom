'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '../../lib/auth';
import { usePermissions } from '../../lib/permissions';
import { useLocale } from '../../lib/i18n/context';
import type { Dictionary } from '../../lib/i18n/dictionaries';
import { NotificationBell } from './NotificationBell';
import { PreferencesToggle } from '../PreferencesToggle';

// `labelKey`/`groupLabelKey` pointent vers `t.adminNav.*` (voir lib/i18n/dictionaries.ts) —
// résolus au rendu pour rester à jour quand la langue change, plutôt que des libellés fixes.
// `permission: null` = toujours visible pour tout compte connecté (ex. tableau de bord).
// Sinon, l'entrée n'est affichée que si le rôle détient cette permission — évite qu'un
// Gestionnaire ou un Éditeur voie des liens vers des pages où chaque action échouerait avec
// une erreur 403 (ex. Comptes/Paramètres, réservés au Super Admin).
type NavKey = keyof Dictionary['adminNav'];
const GROUPS: { groupLabelKey: NavKey | null; items: { href: string; labelKey: NavKey; icon: string; permission: string | null }[] }[] = [
  { groupLabelKey: null, items: [{ href: '/admin', labelKey: 'dashboard', icon: '🏠', permission: null }] },
  {
    groupLabelKey: 'catalog',
    items: [
      { href: '/admin/produits', labelKey: 'products', icon: '📦', permission: 'products:read' },
      { href: '/admin/categories', labelKey: 'categories', icon: '🗂️', permission: 'categories:read' },
      { href: '/admin/marques', labelKey: 'brands', icon: '🏷️', permission: 'brands:read' },
      { href: '/admin/promotions', labelKey: 'promotions', icon: '🎯', permission: 'promotions:read' },
    ],
  },
  {
    groupLabelKey: 'content',
    items: [
      { href: '/admin/boutiques', labelKey: 'boutiques', icon: '🏬', permission: 'boutiques:read' },
      { href: '/admin/actualites', labelKey: 'news', icon: '📰', permission: 'articles:read' },
      { href: '/admin/pages', labelKey: 'pages', icon: '📄', permission: 'pages:read' },
    ],
  },
  {
    groupLabelKey: 'communication',
    items: [
      { href: '/admin/commandes', labelKey: 'orders', icon: '🛒', permission: 'orders:read' },
      { href: '/admin/messages', labelKey: 'messages', icon: '✉️', permission: 'messages:read' },
    ],
  },
  {
    groupLabelKey: 'system',
    items: [
      { href: '/admin/journal', labelKey: 'activityLog', icon: '📜', permission: 'activity-log:read' },
      { href: '/admin/utilisateurs', labelKey: 'accounts', icon: '👤', permission: 'users:read' },
      { href: '/admin/parametres', labelKey: 'settings', icon: '⚙️', permission: 'settings:read' },
      // permission: null — changer son propre mot de passe ne dépend d'aucune ressource
      // métier, contrairement aux autres entrées de ce groupe (voir auth.controller.ts,
      // PATCH /auth/me/password, accessible à tout compte connecté).
      { href: '/admin/mon-compte', labelKey: 'myAccount', icon: '🔑', permission: null },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { t } = useLocale();

  if (pathname === '/admin/login') return null;

  const visibleGroups = GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.permission === null || hasPermission(item.permission)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-none flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-slate-700 text-lg font-bold text-white shadow-[0_6px_14px_-4px_rgba(15,23,42,0.45)]">
          A
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-navy">Amza Futur Telecom</p>
          <p className="text-xs text-slate-400">{t.adminLogin.title}</p>
        </div>
      </div>

      <div className="border-b border-slate-200 px-3 py-3">
        <PreferencesToggle />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {visibleGroups.map((group, i) => (
          <div key={group.groupLabelKey ?? 'root'} className={i > 0 ? 'mt-5' : ''}>
            {group.groupLabelKey && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t.adminNav[group.groupLabelKey]}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active ? 'bg-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
                    }`}
                  >
                    <span aria-hidden>{item.icon}</span>
                    {t.adminNav[item.labelKey]}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-slate-500">{t.adminNav.notifications}</span>
          <NotificationBell />
        </div>
        <button
          onClick={async () => {
            await logout();
            router.replace('/admin/login');
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-accent"
        >
          <span aria-hidden>🚪</span>
          {t.adminNav.logout}
        </button>
      </div>
    </aside>
  );
}
