'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminCreateBoutique,
  adminUpdateBoutique,
  adminUploadImage,
  type AdminBoutiqueInput,
} from '../../lib/admin-api';
import { buildImageUrl } from '../../lib/api';
import { useLocale } from '../../lib/i18n/context';
import type { Boutique } from '../../lib/types';

interface ImageField {
  url: string;
  alt: string;
  isMain: boolean;
}

interface BoutiqueFormProps {
  mode: 'create' | 'edit';
  boutiqueId?: string;
  initialBoutique?: Boutique;
}

export function BoutiqueForm({ mode, boutiqueId, initialBoutique }: BoutiqueFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialBoutique?.name ?? '');
  const [address, setAddress] = useState(initialBoutique?.address ?? '');
  const [phone, setPhone] = useState(initialBoutique?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(initialBoutique?.whatsapp ?? '');
  const [hours, setHours] = useState(initialBoutique?.hours ?? '');
  const [description, setDescription] = useState(initialBoutique?.description ?? '');
  const [latitude, setLatitude] = useState(initialBoutique?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(initialBoutique?.longitude?.toString() ?? '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initialBoutique?.googleMapsUrl ?? '');
  const [isActive, setIsActive] = useState(initialBoutique?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(initialBoutique?.sortOrder ?? 0));
  const [images, setImages] = useState<ImageField[]>(
    initialBoutique?.images.map((img) => ({ url: img.url, alt: img.alt ?? '', isMain: img.isMain })) ?? [],
  );

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      (latitude && !longitude) ||
      (longitude && !latitude)
    ) {
      setError(t.boutiqueForm.latLngError);
      return;
    }

    const payload: AdminBoutiqueInput = {
      name,
      address,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      hours: hours || undefined,
      description: description || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      isActive,
      sortOrder: Number(sortOrder),
      images: images.map((img) => ({ url: img.url, alt: img.alt, isMain: img.isMain })),
    };

    setSaving(true);
    try {
      if (mode === 'create') {
        await adminCreateBoutique(payload);
      } else if (boutiqueId) {
        await adminUpdateBoutique(boutiqueId, payload);
      }
      router.push('/admin/boutiques');
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
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.name}</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.address}</label>
          <input
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.phone}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">WhatsApp</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.hours}</label>
          <input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={t.boutiqueForm.hoursPlaceholder}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.description}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.latitude}</label>
          <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.longitude}</label>
          <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.googleMapsLink}</label>
          <input
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.boutiqueForm.sortOrder}</label>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {t.boutiqueForm.activeLabel}
        </label>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">{t.boutiqueForm.photos}</label>
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
