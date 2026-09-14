'use client';

import { useEffect, useState } from 'react';
import { authFetch } from './auth';

interface MeResponse {
  role: string;
  permissions: string[];
}

// L'access token est en cookie httpOnly (voir lib/auth.ts) : le front ne peut plus le décoder
// lui-même pour connaître rôle/permissions. On les récupère via GET /auth/me à la place, mis
// en cache en mémoire (module-level) pour éviter un aller-retour réseau à chaque composant qui
// appelle usePermissions() — invalidé uniquement par un rechargement de page (login/logout
// entraînent de toute façon une navigation complète).
let cache: MeResponse | null = null;
let inflight: Promise<MeResponse | null> | null = null;

async function loadMe(): Promise<MeResponse | null> {
  if (cache) return cache;
  if (!inflight) {
    inflight = authFetch('/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MeResponse | null) => {
        cache = data;
        return data;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Lit rôle/permissions seulement après le montage (comme AdminGuard.checked) : le rendu
 * serveur/premier rendu client n'a pas de session à interroger, donc appeler cette fonction
 * pendant le rendu initial produirait un mismatch d'hydratation Next.js. Tant que `ready` est
 * faux, on ignore la liste (vide) plutôt que de masquer les actions par erreur avant que la
 * réponse de l'API soit arrivée.
 */
export function usePermissions() {
  const [state, setState] = useState<{ role: string | null; permissions: string[]; ready: boolean }>({
    role: null,
    permissions: [],
    ready: false,
  });

  useEffect(() => {
    let cancelled = false;
    loadMe().then((data) => {
      if (cancelled) return;
      setState({ role: data?.role ?? null, permissions: data?.permissions ?? [], ready: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    hasPermission: (permission: string) => !state.ready || state.permissions.includes(permission),
  };
}
