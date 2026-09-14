'use client';

import type { AuthUser } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Les tokens d'accès/rafraîchissement vivent désormais dans des cookies httpOnly posés par
// l'API (voir backend/src/auth/cookies.ts) : illisibles en JavaScript, donc invulnérables au
// vol par XSS. Seul le cookie CSRF ci-dessous reste lisible ici, par nécessité du pattern de
// double soumission (voir CsrfMiddleware côté API).
const CSRF_COOKIE = 'amza_csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Présence du cookie CSRF = indice (non garanti) qu'une session est ouverte. Sert uniquement
 * à éviter d'afficher l'espace admin le temps d'un aller-retour réseau côté client ; la vraie
 * vérification reste faite par l'API (401 → redirection, voir lib/admin-api.ts). */
export function hasSessionHint(): boolean {
  return Boolean(readCookie(CSRF_COOKIE));
}

/** Ancien nom conservé pour les appelants existants : mêmes garanties que hasSessionHint(). */
export function isAuthenticated(): boolean {
  return hasSessionHint();
}

/** Best-effort : le cookie CSRF est le seul que le JS peut effacer (les cookies d'auth sont
 * httpOnly). Les cookies d'auth expirés/révoqués sont de toute façon ignorés par l'API et
 * seront écrasés à la prochaine connexion. */
export function clearSession() {
  if (typeof document === 'undefined') return;
  document.cookie = `${CSRF_COOKIE}=; Max-Age=0; path=/`;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Identifiants invalides.');
  }
  const data = await res.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { [CSRF_HEADER]: readCookie(CSRF_COOKIE) ?? '' },
  }).catch(() => undefined);
  clearSession();
}

async function tryRefresh(): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { [CSRF_HEADER]: readCookie(CSRF_COOKIE) ?? '' },
  });
  if (!res.ok) {
    clearSession();
    return false;
  }
  return true;
}

/**
 * Fetch authentifié pour l'espace admin : les cookies (dont l'access token httpOnly) sont
 * envoyés automatiquement par le navigateur (`credentials: 'include'`) ; on ajoute juste
 * l'en-tête CSRF pour les requêtes qui modifient un état (voir CsrfMiddleware côté API).
 * Tente une seule fois un rafraîchissement automatique en cas de 401 (§26 du cahier des charges).
 */
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const method = (options.method ?? 'GET').toUpperCase();
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
        ...(isMutating ? { [CSRF_HEADER]: readCookie(CSRF_COOKIE) ?? '' } : {}),
      },
    });

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch();
    }
  }

  return res;
}
