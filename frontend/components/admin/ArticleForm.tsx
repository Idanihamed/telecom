'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  adminCreateArticle,
  adminUpdateArticle,
  adminUploadImage,
  type AdminArticleInput,
} from '../../lib/admin-api';
import { buildImageUrl } from '../../lib/api';
import { useLocale } from '../../lib/i18n/context';
import type { Article } from '../../lib/types';
import { RichTextEditor } from './RichTextEditor';

interface ArticleFormProps {
  mode: 'create' | 'edit';
  articleId?: string;
  initialArticle?: Article;
}

function toDateInput(iso?: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ArticleForm({ mode, articleId, initialArticle }: ArticleFormProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState(initialArticle?.title ?? '');
  const [image, setImage] = useState(initialArticle?.image ?? '');
  const [content, setContent] = useState(initialArticle?.content ?? '');
  const [author, setAuthor] = useState(initialArticle?.author ?? '');
  const [category, setCategory] = useState(initialArticle?.category ?? '');
  const [publishedAt, setPublishedAt] = useState(toDateInput(initialArticle?.publishedAt));
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(initialArticle?.status ?? 'DRAFT');
  const [seoTitle, setSeoTitle] = useState(initialArticle?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(initialArticle?.seoDescription ?? '');

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

    // `content` vient de RichTextEditor (TipTap), pas d'un <textarea> natif : un éditeur "vide"
    // produit tout de même `<p></p>`, donc `required`/`.trim()` seuls ne suffisent pas à
    // détecter l'absence réelle de texte.
    if (!content.replace(/<[^>]+>/g, '').trim()) {
      setError(t.articleForm.contentRequired);
      return;
    }

    const payload: AdminArticleInput = {
      title,
      image: image || undefined,
      content,
      author: author || undefined,
      category: category || undefined,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      status,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    setSaving(true);
    try {
      if (mode === 'create') {
        await adminCreateArticle(payload);
      } else if (articleId) {
        await adminUpdateArticle(articleId, payload);
      }
      router.push('/admin/actualites');
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
        <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.title}</label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.author}</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.category}</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.articleForm.date}</label>
          <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">{t.articleForm.coverImage}</label>
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
