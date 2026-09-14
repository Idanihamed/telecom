'use client';

import { useEffect, useState } from 'react';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminUpdateCategory,
  adminUploadImage,
} from '../../../lib/admin-api';
import { buildImageUrl } from '../../../lib/api';
import type { Category } from '../../../lib/types';
import { usePermissions } from '../../../lib/permissions';
import { useLocale } from '../../../lib/i18n/context';

export default function AdminCategoriesPage() {
  const { t } = useLocale();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('categories:create');
  const canUpdate = hasPermission('categories:update');
  const canDelete = hasPermission('categories:delete');
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [uploadingNew, setUploadingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingImage, setEditingImage] = useState('');
  const [uploadingEditId, setUploadingEditId] = useState<string | null>(null);

  async function load() {
    try {
      setCategories(await adminListCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleNewImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingNew(true);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setNewImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploadingNew(false);
      e.target.value = '';
    }
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    setUploadingEditId(editingId);
    setError(null);
    try {
      const { url } = await adminUploadImage(file);
      setEditingImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.productForm.uploadError);
    } finally {
      setUploadingEditId(null);
      e.target.value = '';
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await adminCreateCategory({ name, image: newImage || undefined });
      setName('');
      setNewImage('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.error);
    }
  }

  async function handleToggleActive(category: Category) {
    await adminUpdateCategory(category.id, { isActive: !category.isActive });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t.categoriesPage.confirmDelete)) return;
    try {
      await adminDeleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.deleteError);
    }
  }

  async function handleSaveEdit(id: string) {
    await adminUpdateCategory(id, { name: editingName, image: editingImage || undefined });
    setEditingId(null);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-navy">{t.categoriesPage.title}</h1>

      {canCreate && (
        <form onSubmit={handleCreate} className="mb-6 flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.categoriesPage.namePlaceholder}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {newImage && (
            <div className="h-9 w-9 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={buildImageUrl(newImage)} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleNewImageChange}
            disabled={uploadingNew}
            className="text-xs"
          />
          <button type="submit" className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">
            {t.adminCommon.add}
          </button>
        </form>
      )}

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">{t.categoriesPage.image}</th>
              <th className="px-4 py-2">{t.adminCommon.name}</th>
              <th className="px-4 py-2">{t.adminCommon.slug}</th>
              <th className="px-4 py-2">{t.adminCommon.status}</th>
              <th className="px-4 py-2">{t.adminCommon.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                <td className="px-4 py-2">
                  {editingId === category.id ? (
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {editingImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={buildImageUrl(editingImage)} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleEditImageChange}
                        disabled={uploadingEditId === category.id}
                        className="w-32 text-xs"
                      />
                    </div>
                  ) : category.image ? (
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={buildImageUrl(category.image)} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg border border-dashed border-slate-200" />
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === category.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="rounded border border-slate-300 px-2 py-1"
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className="px-4 py-2 text-slate-400">{category.slug}</td>
                <td className="px-4 py-2">
                  {canUpdate ? (
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}
                    >
                      {category.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                    </button>
                  ) : (
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                      {category.isActive ? t.adminCommon.active : t.adminCommon.inactive}
                    </span>
                  )}
                </td>
                <td className="space-x-2 px-4 py-2">
                  {canUpdate &&
                    (editingId === category.id ? (
                      <button onClick={() => handleSaveEdit(category.id)} className="text-navy hover:underline">
                        {t.common.save}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setEditingName(category.name);
                          setEditingImage(category.image ?? '');
                        }}
                        className="text-navy hover:underline"
                      >
                        {t.common.edit}
                      </button>
                    ))}
                  {canDelete && (
                    <button onClick={() => handleDelete(category.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  )}
                  {!canUpdate && !canDelete && <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
