'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreatePage, adminUpdatePage, adminUploadImage, type AdminPageInput } from '../../lib/admin-api';
import { buildImageUrl } from '../../lib/api';
import { useLocale } from '../../lib/i18n/context';
import type { Page } from '../../lib/types';
import { RichTextEditor } from './RichTextEditor';

interface PageFormProps {
  mode: 'create' | 'edit';
  pageId?: string;
  initialPage?: Page;
}

export function PageForm({ mode, pageId, initialPage }: PageFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(initialPage?.title ?? '');
  const [content, setContent] = useState(initialPage?.content ?? '');
  const [image, setImage] = useState(initialPage?.image ?? '');
  const [seoTitle, setSeoTitle] = useState(initialPage?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialPage?.seoDescription ?? '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initialPage?.status ?? 'DRAFT');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!content.replace(/<[^>]+>/g, '').trim()) {
      setError(t.articleForm.contentRequired);
      return;
    }

    const payload: AdminPageInput = {
      title,
      content,
      image: image || undefined,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      status,
    };

    setSaving(true);
    try {
      if (mode === 'create') {
        await adminCreatePage(payload);
      } else if (pageId) {
        await adminUpdatePage(pageId, payload);
      }
      router.push('/admin/pages');
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

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.pageForm.title}</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        {initialPage && (
          <p className="mt-1 text-xs text-slate-400">{t.pageForm.publicUrl.replace('{slug}', initialPage.slug)}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">{t.pageForm.illustrationImage}</label>
        {image && (
          <div className="mb-2 h-32 w-32 overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={buildImageUrl(image)} alt={title} className="h-full w-full object-cover" />
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="mt-1 text-xs text-slate-400">{t.productForm.uploading}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.content}</label>
        <RichTextEditor value={content} onChange={setContent} />
        <p className="mt-1 text-xs text-slate-400">{t.articleForm.contentHint}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.seoTitle}</label>
          <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.seoDescription}</label>
          <input value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.status}</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-64">
          <option value="DRAFT">{t.productForm.draft}</option>
          <option value="PUBLISHED">{t.productForm.published}</option>
        </select>
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
