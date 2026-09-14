'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  stock: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'amza_cart';

// Panier "invité" persisté en localStorage, comme les tokens d'auth (voir lib/auth.ts) : pas
// de compte client dans cette phase, donc rien à synchroniser côté serveur tant que la
// commande n'est pas envoyée (voir OrdersService.create, qui recalcule tout côté serveur de
// toute façon — ce panier n'est qu'un brouillon local, jamais une source de vérité sur les prix).
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Panier illisible (JSON corrompu, quota dépassé ailleurs...) : on repart d'un panier
      // vide plutôt que de bloquer le rendu de la page.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // évite d'écraser le panier stocké par un tableau vide au premier rendu
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Stockage plein/indisponible (navigation privée) : le panier reste fonctionnel pour la
      // session en cours, simplement pas persisté.
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const nextQuantity = Math.min(existing.quantity + quantity, existing.stock);
        return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQuantity } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, setQuantity, clear, totalItems, totalAmount }),
    [items, addItem, removeItem, setQuantity, clear, totalItems, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé sous CartProvider.');
  return ctx;
}
