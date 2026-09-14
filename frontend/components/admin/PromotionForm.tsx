'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminCreatePromotion,
  adminListCategories,
  adminListProducts,
  adminUpdatePromotion,
  adminUploadImage,
  type AdminPromotionInput,
} from '../../lib/admin-api';
import { buildImageUrl } from '../../lib/api';
import { useLocale } from '../../lib/i18n/context';
import type { Category, Product, Promotion, PromotionType } from '../../lib/types';

interface PromotionFormProps {
  mode: 'create' | 'edit';
  promotionId?: string;
  initialPromotion?: Promotion;
}

// Convertit un ISO 8601 en valeur compatible avec <input type="datetime-local"> (heure locale du navigateur).
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PromotionForm({ mode, promotionId, initialPromotion }: PromotionFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialPromotion?.name ?? '');
  const [description, setDescription] = useState(initialPromotion?.description ?? '');
  const [type, setType] = useState<PromotionType>(initialPromotion?.type ?? 'PERCENTAGE');
  const [value, setValue] = useState(initialPromotion?.value?.toString() ?? '');
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialPromotion?.startsAt));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(initialPromotion?.endsAt));
  const [priority, setPriority] = useState(String(initialPromotion?.priority ?? 0));
  const [adminStatus, setAdminStatus] = useState<'DRAFT' | 'ACTIVE' | 'DISABLED'>(
    initialPromotion?.adminStatus ?? 'DRAFT',
  );
  const [conditions, setConditions] = useState(initialPromotion?.conditions ?? '');
  const [bannerTitle, setBannerTitle] = useState(initialPromotion?.bannerTitle ?? '');
  const [bannerSubtitle, setBannerSubtitle] = useState(initialPromotion?.bannerSubtitle ?? '');
  const [bannerImage, setBannerImage] = useState(initialPromotion?.bannerImage ?? '');
  const [productIds, setProductIds] = useState<string[]>(initialPromotion?.products.map((p) => p.id) ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(initialPromotion?.categories.map((c) => c.id) ?? []);

  useEffect(() => {
    adminListCategories().then(setCategories).catch(() => setCategories([]));
    // Limite à 100 produits (max autorisé par l'API) : suffisant pour le catalogue actuel.
    // À faire évoluer vers une recherche live si le catalogue grossit significativement.
    adminListProducts({ limit: '100' })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setBannerImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function toggleProduct(id: string) {
    setProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }
  function toggleCategory(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!startsAt || !endsAt) {
      setError(t.promotionForm.datesRequired);
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError(t.promotionForm.endAfterStart);
      return;
    }

    const payload: AdminPromotionInput = {
      name,
      description: description || undefined,
      type,
      value: Number(value),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      priority: Number(priority),
      adminStatus,
      conditions: conditions || undefined,
      bannerTitle: bannerTitle || undefined,
      bannerSubtitle: bannerSubtitle || undefined,
      bannerImage: bannerImage || undefined,
      productIds,
      categoryIds,
    };

    setSaving(true);
    try {
      if (mode === 'create') {
        await adminCreatePromotion(payload);
      } else if (promotionId) {
        await adminUpdatePromotion(promotionId, payload);
      }
      router.push('/admin/promotions');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-accent">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.name}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.status}</label>
          <select
            value={adminStatus}
            onChange={(e) => setAdminStatus(e.target.value as 'DRAFT' | 'ACTIVE' | 'DISABLED')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="DRAFT">{t.promotionsPage.statusDraft}</option>
            <option value="ACTIVE">{t.promotionsPage.statusActive}</option>
            <option value="DISABLED">{t.promotionsPage.statusDisabled}</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">{t.promotionForm.activeHint}</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.description}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.discountType}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PromotionType)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">{t.promotionForm.percentage}</option>
            <option value="FIXED_AMOUNT">{t.promotionForm.fixedAmount}</option>
            <option value="FIXED_PRICE">{t.promotionForm.fixedPriceOption}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            {t.promotionForm.value} {type === 'PERCENTAGE' ? '(%)' : '(FCFA)'}
          </label>
          <input
            required
            type="number"
            min={0}
            max={type === 'PERCENTAGE' ? 100 : undefined}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.priority}</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">{t.promotionForm.priorityHint}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.startDate}</label>
          <input
            required
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.endDate}</label>
          <input
            required
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.conditions}</label>
        <input
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
          placeholder={t.promotionForm.conditionsPlaceholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.bannerTitle}</label>
          <input
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.promotionForm.bannerSubtitle}</label>
          <input
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">{t.promotionForm.bannerImage}</label>
        {bannerImage && (
          <div className="mb-2 h-24 w-48 overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={buildImageUrl(bannerImage)} alt={bannerTitle || name} className="h-full w-full object-cover" />
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="mt-1 text-xs text-slate-400">{t.productForm.uploading}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            {t.promotionForm.targetedCategories} ({categoryIds.length})
          </label>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {categories.length === 0 && <p className="text-sm text-slate-400">{t.promotionForm.noCategories}</p>}
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-600">
            {t.promotionForm.targetedProducts} ({productIds.length})
          </label>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {products.length === 0 && <p className="text-sm text-slate-400">{t.promotionForm.noProducts}</p>}
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400">{t.promotionForm.targetHint}</p>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.common.cancel}
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-navy px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? t.settingsPage.saving : t.common.save}
        </button>
      </div>
    </form>
  );
}
