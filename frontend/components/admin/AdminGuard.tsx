'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAuthenticated } from '../../lib/auth';

/**
 * Protection des routes admin côté client (§26 du cahier des charges).
 * Note : les permissions fines par ressource sont de toute façon revérifiées côté API
 * (PermissionsGuard) ; ce garde évite seulement d'afficher l'interface à un visiteur
 * non connecté. `isAuthenticated()` ne fait que lire un indice (cookie CSRF non-httpOnly,
 * voir lib/auth.ts) — l'access token lui-même est en cookie httpOnly et illisible en JS ;
 * la vraie vérification a lieu côté API sur chaque requête, avec redirection automatique
 * vers /admin/login en cas de 401 (voir lib/admin-api.ts).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isAuthenticated()) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (!checked) return null;

  return <>{children}</>;
}
