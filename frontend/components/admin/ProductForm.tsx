'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminCreateProduct,
  adminListBrands,
  adminListCategories,
  adminUpdateProduct,
  adminUploadImage,
  type AdminProductInput,
} from '../../lib/admin-api';
import { buildImageUrl } from '../../lib/api';
import { useLocale } from '../../lib/i18n/context';
import type { Brand, Category, Product } from '../../lib/types';

interface ImageField {
  url: string;
  alt: string;
  isMain: boolean;
}
interface AttributeField {
  key: string;
  value: string;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  productId?: string;
  initialProduct?: Product;
}

export function ProductForm({ mode, productId, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category?.id ?? '');
  const [brandId, setBrandId] = useState(initialProduct?.brand?.id ?? '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [price, setPrice] = useState(initialProduct?.price?.toString() ?? '');
  const [promoPrice, setPromoPrice] = useState(initialProduct?.promoPrice?.toString() ?? '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() ?? '0');
  const [lowStockThreshold, setLowStockThreshold] = useState(String(initialProduct?.lowStockThreshold ?? 5));
  const [warranty, setWarranty] = useState(initialProduct?.warranty ?? '');
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initialProduct?.status ?? 'DRAFT');
  const [images, setImages] = useState<ImageField[]>(
    initialProduct?.images.map((img) => ({ url: img.url, alt: img.alt ?? '', isMain: img.isMain })) ?? [],
  );
  const [attributes, setAttributes] = useState<AttributeField[]>(initialProduct?.attributes ?? []);

  useEffect(() => {
    adminListCategories().then(setCategories).catch(() => setCategories([]));
    adminListBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setImages((prev) => [...prev, { url, alt: name, isMain: prev.length === 0 }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function setMainImage(index: number) {
    setImages((prev) => prev.map((img, i) => ({ ...img, isMain: i === index })));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addAttribute() {
    setAttributes((prev) => [...prev, { key: '', value: '' }]);
  }
  function updateAttribute(index: number, field: 'key' | 'value', value: string) {
    setAttributes((prev) => prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)));
  }
  function removeAttribute(index: number) {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError(t.productForm.categoryRequired);
      return;
    }

    const payload: AdminProductInput = {
      name,
      sku,
      categoryId,
      brandId: brandId || undefined,
      shortDescription: shortDescription || undefined,
      description: description || undefined,
      price: Number(price),
      promoPrice: promoPrice ? Number(promoPrice) : null,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      warranty: warranty || undefined,
      isFeatured,
      status,
      images: images.map((img) => ({ url: img.url, alt: img.alt, isMain: img.isMain })),
      attributes: attributes.filter((a) => a.key.trim() && a.value.trim()),
    };

    setSaving(true);
    try {
      if (mode === 'create') {
        await adminCreateProduct(payload);
      } else if (productId) {
        await adminUpdateProduct(productId, payload);
      }
      router.push('/admin/produits');
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
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.name}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.sku}</label>
          <input required value={sku} onChange={(e) => setSku(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.category}</label>
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">{t.productForm.choose}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.brand}</label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">{t.productForm.none}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.shortDescription}</label>
        <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.fullDescription}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.price}</label>
          <input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.promoPrice}</label>
          <input type="number" min={0} value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.stock}</label>
          <input required type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.lowStockThreshold}</label>
          <input type="number" min={0} value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.warranty}</label>
          <input value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.productForm.status}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="DRAFT">{t.productForm.draft}</option>
            <option value="PUBLISHED">{t.productForm.published}</option>
          </select>
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          {t.productForm.featured}
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">{t.productForm.images}</label>
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.url + i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={buildImageUrl(img.url)} alt={img.alt} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setMainImage(i)}
                className={`absolute bottom-0 left-0 right-0 py-0.5 text-[10px] font-semibold ${img.isMain ? 'bg-navy text-white' : 'bg-white/80 text-slate-600'}`}
              >
                {img.isMain ? t.productForm.mainImage : t.productForm.setAsMain}
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 rounded-full bg-white/90 px-1 text-xs text-accent"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="mt-1 text-xs text-slate-400">{t.productForm.uploading}</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-600">{t.productForm.characteristics}</label>
          <button type="button" onClick={addAttribute} className="text-sm text-navy hover:underline">
            {t.productForm.addAttribute}
          </button>
        </div>
        <div className="space-y-2">
          {attributes.map((attr, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={t.productForm.attributeKeyPlaceholder}
                value={attr.key}
                onChange={(e) => updateAttribute(i, 'key', e.target.value)}
                className="w-1/3 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                placeholder={t.productForm.attributeValuePlaceholder}
                value={attr.value}
                onChange={(e) => updateAttribute(i, 'value', e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeAttribute(i)} className="text-accent">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

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
