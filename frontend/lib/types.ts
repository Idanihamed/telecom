export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive?: boolean;
}

export type StockStatus = 'DISPONIBLE' | 'STOCK_FAIBLE' | 'RUPTURE';
export type ProductStatus = 'DRAFT' | 'PUBLISHED';

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FIXED_PRICE';
export type PromotionAdminStatus = 'DRAFT' | 'ACTIVE' | 'DISABLED';
export type PromotionDisplayStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'DISABLED';

export interface AppliedPromotion {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  type: PromotionType;
  value: number;
  startsAt: string;
  endsAt: string;
  priority: number;
  adminStatus: PromotionAdminStatus;
  displayStatus: PromotionDisplayStatus;
  conditions?: string | null;
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  bannerImage?: string | null;
  products: { id: string; name: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivePromotion {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  bannerImage?: string | null;
  productCount: number;
  categories: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isMain: boolean;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  promoPrice?: number | null;
  effectivePrice: number;
  discountPercentage: number;
  onSale: boolean;
  appliedPromotion?: AppliedPromotion | null;
  stock: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  warranty?: string | null;
  isFeatured: boolean;
  status: ProductStatus;
  images: ProductImage[];
  attributes: ProductAttribute[];
  createdAt: string;
  updatedAt: string;
}

export interface BoutiqueImage {
  id: string;
  url: string;
  alt?: string | null;
  isMain: boolean;
}

export interface Boutique {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone?: string | null;
  whatsapp?: string | null;
  hours?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  images: BoutiqueImage[];
  createdAt: string;
  updatedAt: string;
}

export type PublishStatus = 'DRAFT' | 'PUBLISHED';

export interface Article {
  id: string;
  title: string;
  slug: string;
  image?: string | null;
  content: string;
  author?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  status: PublishStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export type ContactMessageStatus = 'NOUVEAU' | 'LU' | 'TRAITE';

export interface ContactMessage {
  id: string;
  reference: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  voiceUrl?: string | null;
  status: ContactMessageStatus;
  replyMessage?: string | null;
  replyVoiceUrl?: string | null;
  repliedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Réponse de GET /contact/suivi/:reference (voir page /suivi). */
export interface ContactMessageTracking {
  reference: string;
  subject: string;
  status: ContactMessageStatus;
  createdAt: string;
  reply: string | null;
  replyVoiceUrl: string | null;
  repliedAt: string | null;
}

export type NotificationType = 'CONTACT_MESSAGE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PROMOTION_EXPIRING' | 'NEW_ORDER';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  link?: string | null;
  isRead: boolean;
  virtual: boolean;
  createdAt: string;
}

export type OrderStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_PREPARATION' | 'EXPEDIEE' | 'LIVREE' | 'ANNULEE';

export interface OrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

/** Réponse de GET /orders/suivi/:reference (voir page /commandes/suivi). */
export interface OrderTracking {
  reference: string;
  status: OrderStatus;
  totalAmount: number;
  customerAddress?: string | null;
  boutique: { name: string; address: string } | null;
  createdAt: string;
  items: OrderItem[];
}

export interface AdminOrder {
  id: string;
  reference: string;
  customerName: string;
  customerContact: string;
  customerAddress?: string | null;
  boutique: { id: string; name: string } | null;
  notes?: string | null;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface DashboardStats {
  products: { total: number; published: number; draft: number };
  stock: { lowStock: number; outOfStock: number };
  categories: number;
  brands: number;
  promotions: { active: number; scheduled: number };
  boutiques: number;
  articles: { total: number; published: number };
  pages: number;
  messages: { untreated: number };
  orders: { pending: number };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface Settings {
  id: string;
  whatsappNumber?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  heroImage1?: string | null;
  heroImage2?: string | null;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  method: string;
  path: string;
  description: string;
  createdAt: string;
}
