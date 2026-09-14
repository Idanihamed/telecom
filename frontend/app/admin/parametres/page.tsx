'use client';

import { useEffect, useState } from 'react';
import { adminGetSettings, adminUpdateSettings, adminUploadImage } from '../../../lib/admin-api';
import { buildImageUrl } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { Settings } from '../../../lib/types';

const NETWORKS: { key: keyof Omit<Settings, 'id' | 'updatedAt' | 'heroImage1' | 'heroImage2'>; label: string; icon: string; placeholder: string }[] = [
  { key: 'whatsappNumber', label: 'WhatsApp', icon: '💬', placeholder: '2250700000000' },
  { key: 'facebookUrl', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/...' },
  { key: 'instagramUrl', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/...' },
  { key: 'tiktokUrl', label: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@...' },
  { key: 'youtubeUrl', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/@...' },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/company/...' },
  { key: 'xUrl', label: 'X (Twitter)', icon: '✖️', placeholder: 'https://x.com/...' },
];

const HERO_IMAGE_KEYS = ['heroImage1', 'heroImage2'] as const;

export default function AdminSettingsPage() {
  const { t } = useLocale();
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    adminGetSettings()
      .then((settings) => {
        setForm({
          whatsappNumber: settings.whatsappNumber ?? '',
          facebookUrl: settings.facebookUrl ?? '',
          instagramUrl: settings.instagramUrl ?? '',
          tiktokUrl: settings.tiktokUrl ?? '',
          youtubeUrl: settings.youtubeUrl ?? '',
          linkedinUrl: settings.linkedinUrl ?? '',
          xUrl: settings.xUrl ?? '',
          heroImage1: settings.heroImage1 ?? '',
          heroImage2: settings.heroImage2 ?? '',
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : t.settingsPage.loadError))
      .finally(() => setLoading(false));
  }, []);

  async function handleHeroImageChange(key: (typeof HERO_IMAGE_KEYS)[number], e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(key);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setForm((prev) => ({ ...prev, [key]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await adminUpdateSettings(form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settingsPage.saveError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-navy">{t.settingsPage.title}</h1>
      <p className="mb-6 text-sm text-slate-500">{t.settingsPage.subtitle}</p>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-navy">{t.settingsPage.heroImagesTitle}</h2>
          <p className="mb-4 text-xs text-slate-500">{t.settingsPage.heroImagesHint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {HERO_IMAGE_KEYS.map((key, i) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  {i === 0 ? t.settingsPage.heroImage1Label : t.settingsPage.heroImage2Label}
                </label>
                {form[key] && (
                  <div className="mb-2 h-28 w-full overflow-hidden rounded-lg border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={buildImageUrl(form[key])} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleHeroImageChange(key, e)}
                  disabled={uploadingKey === key}
                />
                {uploadingKey === key && <p className="mt-1 text-xs text-slate-400">{t.productForm.uploading}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            {NETWORKS.map((network) => (
              <div key={network.key}>
                <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <span aria-hidden>{network.icon}</span>
                  {network.label}
                </label>
                <input
                  type="text"
                  value={form[network.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [network.key]: e.target.value }))}
                  placeholder={network.placeholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}
        {success && <p className="text-sm text-green-600">{t.settingsPage.saved}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {saving ? t.settingsPage.saving : t.settingsPage.save}
        </button>
      </form>
    </div>
  );
}
