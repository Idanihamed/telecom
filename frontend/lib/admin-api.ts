'use client';

import { authFetch, clearSession } from './auth';
import type {
  ActivityLogEntry,
  AdminUserAccount,
  AppNotification,
  Article,
  Boutique,
  Brand,
  Category,
  AdminOrder,
  ContactMessage,
  DashboardStats,
  OrderStatus,
  Page,
  Paginated,
  Product,
  Promotion,
  Role,
  Settings,
} from './types';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // Le ValidationPipe de NestJS renvoie `message` sous forme de tableau de chaînes dès
    // que plusieurs champs échouent la validation en même temps — on les rejoint pour
    // obtenir un message lisible plutôt que la conversion implicite en chaîne de `Error`.
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message;

    if (res.status === 401) {
      // authFetch a déjà tenté un rafraîchissement automatique une fois (voir lib/auth.ts) :
      // un 401 qui arrive jusqu'ici signifie que la session est définitivement terminée
      // (token expiré sans refresh valide, ou compte désactivé entre-temps — voir
      // AuthService.refresh). Sans ce renvoi vers la connexion, l'admin restait bloqué sur
      // la page avec un message d'erreur générique à chaque action, sans jamais comprendre
      // qu'il fallait se reconnecter.
      clearSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }

    throw new Error(message ?? `Erreur API (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Dashboard ----------
export async function getDashboardStats(): Promise<DashboardStats> {
  return handle(await authFetch('/admin/dashboard/stats'));
}

// ---------- Catégories ----------
export async function adminListCategories(): Promise<Category[]> {
  return handle(await authFetch('/admin/categories'));
}
export async function adminCreateCategory(data: Partial<Category>): Promise<Category> {
  return handle(await authFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return handle(await authFetch(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteCategory(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/categories/${id}`, { method: 'DELETE' }));
}

// ---------- Marques ----------
export async function adminListBrands(): Promise<Brand[]> {
  return handle(await authFetch('/admin/brands'));
}
export async function adminCreateBrand(data: Partial<Brand>): Promise<Brand> {
  return handle(await authFetch('/admin/brands', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
  return handle(await authFetch(`/admin/brands/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteBrand(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/brands/${id}`, { method: 'DELETE' }));
}

// ---------- Produits ----------
export interface AdminProductInput {
  name: string;
  sku: string;
  categoryId: string;
  brandId?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  promoPrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  warranty?: string;
  isFeatured?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  images?: { url: string; alt?: string; isMain?: boolean }[];
  attributes?: { key: string; value: string }[];
}

export async function adminListProducts(params: Record<string, string> = {}): Promise<Paginated<Product>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/products${qs ? `?${qs}` : ''}`));
}
export async function adminGetProduct(id: string): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}`));
}
export async function adminCreateProduct(data: AdminProductInput): Promise<Product> {
  return handle(await authFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateProduct(id: string, data: Partial<AdminProductInput>): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteProduct(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/products/${id}`, { method: 'DELETE' }));
}
export async function adminPublishProduct(id: string): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}/publish`, { method: 'PATCH' }));
}
export async function adminUnpublishProduct(id: string): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}/unpublish`, { method: 'PATCH' }));
}
export async function adminDuplicateProduct(id: string): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}/duplicate`, { method: 'POST' }));
}
export async function adminAdjustStock(id: string, delta: number): Promise<Product> {
  return handle(await authFetch(`/admin/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ delta }) }));
}

// ---------- Promotions ----------
export interface AdminPromotionInput {
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIXED_PRICE';
  value: number;
  startsAt: string;
  endsAt: string;
  priority?: number;
  adminStatus?: 'DRAFT' | 'ACTIVE' | 'DISABLED';
  conditions?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerImage?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export async function adminListPromotions(params: Record<string, string> = {}): Promise<Paginated<Promotion>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/promotions${qs ? `?${qs}` : ''}`));
}
export async function adminGetPromotion(id: string): Promise<Promotion> {
  return handle(await authFetch(`/admin/promotions/${id}`));
}
export async function adminCreatePromotion(data: AdminPromotionInput): Promise<Promotion> {
  return handle(await authFetch('/admin/promotions', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdatePromotion(id: string, data: Partial<AdminPromotionInput>): Promise<Promotion> {
  return handle(await authFetch(`/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeletePromotion(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/promotions/${id}`, { method: 'DELETE' }));
}
export async function adminActivatePromotion(id: string): Promise<Promotion> {
  return handle(await authFetch(`/admin/promotions/${id}/activate`, { method: 'PATCH' }));
}
export async function adminDisablePromotion(id: string): Promise<Promotion> {
  return handle(await authFetch(`/admin/promotions/${id}/disable`, { method: 'PATCH' }));
}
export async function adminSetDraftPromotion(id: string): Promise<Promotion> {
  return handle(await authFetch(`/admin/promotions/${id}/draft`, { method: 'PATCH' }));
}

// ---------- Boutiques ----------
export interface AdminBoutiqueInput {
  name: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  hours?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  images?: { url: string; alt?: string; isMain?: boolean }[];
}

export async function adminListBoutiques(): Promise<Boutique[]> {
  return handle(await authFetch('/admin/boutiques'));
}
export async function adminGetBoutique(id: string): Promise<Boutique> {
  return handle(await authFetch(`/admin/boutiques/${id}`));
}
export async function adminCreateBoutique(data: AdminBoutiqueInput): Promise<Boutique> {
  return handle(await authFetch('/admin/boutiques', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateBoutique(id: string, data: Partial<AdminBoutiqueInput>): Promise<Boutique> {
  return handle(await authFetch(`/admin/boutiques/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteBoutique(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/boutiques/${id}`, { method: 'DELETE' }));
}
export async function adminActivateBoutique(id: string): Promise<Boutique> {
  return handle(await authFetch(`/admin/boutiques/${id}/activate`, { method: 'PATCH' }));
}
export async function adminDisableBoutique(id: string): Promise<Boutique> {
  return handle(await authFetch(`/admin/boutiques/${id}/disable`, { method: 'PATCH' }));
}

// ---------- Actualités ----------
export interface AdminArticleInput {
  title: string;
  image?: string;
  content: string;
  author?: string;
  category?: string;
  publishedAt?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  seoTitle?: string;
  seoDescription?: string;
}

export async function adminListArticles(params: Record<string, string> = {}): Promise<Paginated<Article>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/articles${qs ? `?${qs}` : ''}`));
}
export async function adminGetArticle(id: string): Promise<Article> {
  return handle(await authFetch(`/admin/articles/${id}`));
}
export async function adminCreateArticle(data: AdminArticleInput): Promise<Article> {
  return handle(await authFetch('/admin/articles', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateArticle(id: string, data: Partial<AdminArticleInput>): Promise<Article> {
  return handle(await authFetch(`/admin/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteArticle(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/articles/${id}`, { method: 'DELETE' }));
}
export async function adminPublishArticle(id: string): Promise<Article> {
  return handle(await authFetch(`/admin/articles/${id}/publish`, { method: 'PATCH' }));
}
export async function adminUnpublishArticle(id: string): Promise<Article> {
  return handle(await authFetch(`/admin/articles/${id}/unpublish`, { method: 'PATCH' }));
}

// ---------- Pages de contenu ----------
export interface AdminPageInput {
  title: string;
  content: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export async function adminListPages(): Promise<Page[]> {
  return handle(await authFetch('/admin/pages'));
}
export async function adminGetPage(id: string): Promise<Page> {
  return handle(await authFetch(`/admin/pages/${id}`));
}
export async function adminCreatePage(data: AdminPageInput): Promise<Page> {
  return handle(await authFetch('/admin/pages', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdatePage(id: string, data: Partial<AdminPageInput>): Promise<Page> {
  return handle(await authFetch(`/admin/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeletePage(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/pages/${id}`, { method: 'DELETE' }));
}
export async function adminPublishPage(id: string): Promise<Page> {
  return handle(await authFetch(`/admin/pages/${id}/publish`, { method: 'PATCH' }));
}
export async function adminUnpublishPage(id: string): Promise<Page> {
  return handle(await authFetch(`/admin/pages/${id}/unpublish`, { method: 'PATCH' }));
}

// ---------- Messages de contact ----------
export async function adminListMessages(params: Record<string, string> = {}): Promise<Paginated<ContactMessage>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/messages${qs ? `?${qs}` : ''}`));
}
export async function adminGetMessage(id: string): Promise<ContactMessage> {
  return handle(await authFetch(`/admin/messages/${id}`));
}
export async function adminSetMessageStatus(
  id: string,
  status: 'NOUVEAU' | 'LU' | 'TRAITE',
): Promise<ContactMessage> {
  return handle(await authFetch(`/admin/messages/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }));
}
export async function adminDeleteMessage(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/messages/${id}`, { method: 'DELETE' }));
}
export async function adminReplyMessage(
  id: string,
  data: { reply?: string; replyVoiceUrl?: string },
): Promise<ContactMessage> {
  return handle(await authFetch(`/admin/messages/${id}/reply`, { method: 'PATCH', body: JSON.stringify(data) }));
}

// ---------- Commandes ----------
export async function adminListOrders(params: Record<string, string> = {}): Promise<Paginated<AdminOrder>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/orders${qs ? `?${qs}` : ''}`));
}
export async function adminGetOrder(id: string): Promise<AdminOrder> {
  return handle(await authFetch(`/admin/orders/${id}`));
}
export async function adminSetOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
  return handle(await authFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }));
}
export async function adminUploadReplyVoice(blob: Blob): Promise<{ url: string }> {
  const formData = new FormData();
  const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
  formData.append('file', blob, `reply.${extension}`);
  return handle(await authFetch('/admin/messages/reply-voice', { method: 'POST', body: formData }));
}

// ---------- Notifications ----------
export async function adminListNotifications(): Promise<AppNotification[]> {
  return handle(await authFetch('/admin/notifications'));
}
export async function adminUnreadNotificationsCount(): Promise<number> {
  return handle(await authFetch('/admin/notifications/unread-count'));
}
export async function adminMarkNotificationRead(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/notifications/${id}/read`, { method: 'PATCH' }));
}
export async function adminMarkAllNotificationsRead(): Promise<{ success: boolean }> {
  return handle(await authFetch('/admin/notifications/read-all', { method: 'PATCH' }));
}

// ---------- Journal d'activité ----------
export async function adminListActivityLog(params: Record<string, string> = {}): Promise<Paginated<ActivityLogEntry>> {
  const qs = new URLSearchParams(params).toString();
  return handle(await authFetch(`/admin/activity-log${qs ? `?${qs}` : ''}`));
}

// ---------- Comptes administrateurs ----------
export interface AdminCreateUserInput {
  name: string;
  email: string;
  password: string;
  roleName: string;
}
export interface AdminUpdateUserInput {
  name?: string;
  email?: string;
  roleName?: string;
  isActive?: boolean;
  password?: string;
}

export async function adminListUsers(): Promise<AdminUserAccount[]> {
  return handle(await authFetch('/admin/users'));
}
export async function adminCreateUser(data: AdminCreateUserInput): Promise<AdminUserAccount> {
  return handle(await authFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) }));
}
export async function adminUpdateUser(id: string, data: AdminUpdateUserInput): Promise<AdminUserAccount> {
  return handle(await authFetch(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }));
}
export async function adminDeleteUser(id: string): Promise<{ success: boolean }> {
  return handle(await authFetch(`/admin/users/${id}`, { method: 'DELETE' }));
}

// ---------- Rôles ----------
export async function adminListRoles(): Promise<Role[]> {
  return handle(await authFetch('/admin/roles'));
}

// ---------- Paramètres généraux ----------
export interface AdminSettingsInput {
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  heroImage1?: string;
  heroImage2?: string;
}

export async function adminGetSettings(): Promise<Settings> {
  return handle(await authFetch('/admin/settings'));
}
export async function adminUpdateSettings(data: AdminSettingsInput): Promise<Settings> {
  return handle(await authFetch('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }));
}

// ---------- Mon compte ----------
export async function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  await handle(
    await authFetch('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  );
}

// ---------- Médias ----------
export async function adminUploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return handle(await authFetch('/admin/media/upload', { method: 'POST', body: formData }));
}
