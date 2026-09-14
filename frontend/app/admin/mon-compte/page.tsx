'use client';

import { useState } from 'react';
import { changeMyPassword } from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';

export default function MyAccountPage() {
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.myAccountPage.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-navy">{t.myAccountPage.title}</h1>
      <p className="mb-6 text-sm text-slate-500">{t.myAccountPage.subtitle}</p>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.myAccountPage.currentPassword}</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.myAccountPage.newPassword}</label>
          <input
            type="password"
            required
            minLength={10}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">{t.myAccountPage.newPasswordHint}</p>
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}
        {success && <p className="text-sm text-green-600">{t.myAccountPage.saved}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {saving ? t.myAccountPage.saving : t.myAccountPage.save}
        </button>
      </form>
    </div>
  );
}
