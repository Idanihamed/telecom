'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../lib/auth';
import { DecorativeBlobs } from '../../../components/DecorativeBlobs';
import { AdminOrb3D } from '../../../components/three/AdminOrb3D';
import { PreferencesToggle } from '../../../components/PreferencesToggle';
import { useLocale } from '../../../lib/i18n/context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminLogin.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-3xl">
      <DecorativeBlobs variant="login" />
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute right-[8%] top-1/2 h-72 w-72 -translate-y-1/2">
          <AdminOrb3D />
        </div>
      </div>
      <div className="glass-panel relative z-10 mx-auto w-full max-w-sm rounded-xl p-8 shadow-lg">
        <div className="mb-4 flex justify-center">
          <PreferencesToggle />
        </div>
        <h1 className="mb-6 text-center text-xl font-bold text-navy">{t.adminLogin.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.adminLogin.email}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">{t.adminLogin.password}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-50"
        >
          {loading ? t.adminLogin.submitting : t.adminLogin.submit}
        </button>
        </form>
      </div>
    </div>
  );
}
