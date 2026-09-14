import type {
  ActivePromotion,
  Article,
  Boutique,
  Brand,
  Category,
  ContactMessageTracking,
  OrderTracking,
  Page,
  Paginated,
  Product,
  Settings,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// Numéro WhatsApp principal (bouton d'en-tête, accueil, fiche produit) — réglable via
// NEXT_PUBLIC_WHATSAPP_NUMBER (.env.local) sans redéploiement de code. Distinct des numéros
// WhatsApp par boutique (Boutique.whatsapp, §17), qui restent gérés depuis l'administration.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '0000000000';

async function apiFetch<T>(path: string, revalidateSeconds = 60): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new Error(`Erreur API (${res.status}) sur ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getCategories() {
  return apiFetch<Category[]>('/categories');
}

export function getBrands() {
  return apiFetch<Brand[]>('/brands');
}

export function getFeaturedProducts() {
  return apiFetch<Product[]>('/products/featured');
}

export function getActivePromotions() {
  return apiFetch<ActivePromotion[]>('/promotions/active', 30);
}

export function getBoutiques() {
  return apiFetch<Boutique[]>('/boutiques', 60);
}

// Réseaux sociaux + WhatsApp + visuels d'accueil configurés depuis l'admin (§24) : affichés
// sur tout le site public. Jamais mis en cache (revalidate: 0) : contrairement au catalogue,
// une modification ici doit apparaître immédiatement — un admin qui vient d'uploader une image
// ne doit pas se demander pendant une minute si l'enregistrement a fonctionné.
export function getSettings() {
  return apiFetch<Settings>('/settings', 0);
}

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
}

export function getArticles(filters: ArticleFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return apiFetch<Paginated<Article>>(`/actualites${query ? `?${query}` : ''}`, 60);
}

export function getArticleBySlug(slug: string) {
  return apiFetch<Article>(`/actualites/${slug}`, 60);
}

export function getPageBySlug(slug: string) {
  return apiFetch<Page>(`/pages/${slug}`, 60);
}

/** Slugs des pages publiées — utilisé uniquement par app/sitemap.ts (voir pages.controller.ts). */
export function getPublishedPageSlugs() {
  return apiFetch<{ slug: string; updatedAt: string }[]>('/pages', 60);
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  onSale?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name_asc';
}

export function getProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return apiFetch<Paginated<Product>>(`/products${query ? `?${query}` : ''}`, 30);
}

export function getProductBySlug(slug: string) {
  return apiFetch<{ product: Product; similarProducts: Product[] }>(`/products/${slug}`, 30);
}

export interface ContactMessageInput {
  name: string;
  contact: string;
  subject: string;
  /** Optionnel si voiceUrl est fourni (message uniquement vocal) — voir la page Contact. */
  message?: string;
  /** Chemin "/uploads/..." renvoyé par uploadVoiceMessage. */
  voiceUrl?: string;
  /** Champ honeypot anti-spam : doit rester vide, voir ContactForm. */
  website?: string;
}

// Enregistrement vocal du formulaire de contact (accessibilité) : upload dédié, public,
// limité en taille côté serveur (voir ContactMessagesController.uploadVoice).
export async function uploadVoiceMessage(blob: Blob): Promise<{ url: string }> {
  const formData = new FormData();
  const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
  formData.append('file', blob, `message.${extension}`);
  const res = await fetch(`${API_URL}/contact/voice`, { method: 'POST', body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
    throw new Error(message ?? `Erreur lors de l'envoi du message vocal (${res.status})`);
  }
  return res.json();
}

export async function submitContactMessage(data: ContactMessageInput): Promise<{ success: boolean; reference?: string }> {
  const res = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // NestJS renvoie `message` en tableau de chaînes si plusieurs règles de validation
    // échouent en même temps — on les rejoint pour un message lisible.
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
    throw new Error(message ?? `Erreur lors de l'envoi (${res.status})`);
  }
  return res.json();
}

// Suivi public d'une demande (voir page /suivi) : consultation du statut et d'une éventuelle
// réponse de l'admin, à partir de la référence communiquée après l'envoi + du contact saisi.
export async function trackContactMessage(reference: string, contact: string): Promise<ContactMessageTracking> {
  const params = new URLSearchParams({ contact });
  const res = await fetch(`${API_URL}/contact/suivi/${encodeURIComponent(reference)}?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
    throw new Error(message ?? `Erreur lors de la recherche (${res.status})`);
  }
  return res.json();
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderInput {
  customerName: string;
  customerContact: string;
  customerAddress?: string;
  boutiqueId?: string;
  notes?: string;
  items: OrderItemInput[];
  /** Champ honeypot anti-spam : doit rester vide, voir CheckoutForm. */
  website?: string;
}

// Panier -> commande (achat invité, pas de compte client dans cette phase) : les prix ne sont
// jamais envoyés par le client, seuls productId + quantity le sont — le serveur recalcule le
// prix effectif à partir des promotions actives (voir OrdersService.create côté back-end).
export async function submitOrder(data: OrderInput): Promise<{ success: boolean; reference?: string; totalAmount?: number }> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
    throw new Error(message ?? `Erreur lors de l'envoi de la commande (${res.status})`);
  }
  return res.json();
}

// Suivi public d'une commande (voir page /commandes/suivi) : même principe que
// trackContactMessage — référence + contact saisi à la commande.
export async function trackOrder(reference: string, contact: string): Promise<OrderTracking> {
  const params = new URLSearchParams({ contact });
  const res = await fetch(`${API_URL}/orders/suivi/${encodeURIComponent(reference)}?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;
    throw new Error(message ?? `Erreur lors de la recherche (${res.status})`);
  }
  return res.json();
}

export function formatPriceFCFA(amount: number): string {
  // Format retenu au §15 du cahier des charges v2.0 : entier, séparateur de milliers, suffixe FCFA.
  return `${amount.toLocaleString('fr-FR').replace(/ /g, ' ')} FCFA`;
}

export function buildImageUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const base = API_URL.replace(/\/api$/, '');
  return `${base}${url}`;
}
