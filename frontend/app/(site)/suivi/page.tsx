'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildImageUrl, trackContactMessage } from '../../../lib/api';
import { useLocale } from '../../../lib/i18n/context';
import type { ContactMessageTracking } from '../../../lib/types';

const STATUS_CLASS: Record<ContactMessageTracking['status'], string> = {
  NOUVEAU: 'bg-blue-100 text-blue-700',
  LU: 'bg-amber-100 text-amber-700',
  TRAITE: 'bg-green-100 text-green-700',
};

function SuiviForm() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [reference, setReference] = useState(searchParams.get('ref') ?? '');
  const [contact, setContact] = useState('');
  const [result, setResult] = useState<ContactMessageTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const tracking = await trackContactMessage(reference.trim(), contact.trim());
      setResult(tracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messageTracking.searchError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold text-navy">{t.messageTracking.title}</h1>
      <p className="mb-6 text-sm text-slate-500">{t.messageTracking.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t.messageTracking.trackingNumber}</label>
          <input
            required
            minLength={8}
            maxLength={8}
            value={reference}
            onChange={(e) => setReference(e.target.value.toUpperCase())}
            placeholder="ex. A3K9F7Q2"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase tracking-widest"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.messageTracking.contact}{' '}
            <span className="font-normal text-slate-400">({t.messageTracking.contactHint})</span>
          </label>
          <input
            required
            minLength={3}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? t.orderTracking.searching : t.messageTracking.verify}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[result.status]}`}>
              {t.messageTracking.status[result.status]}
            </span>
            <span className="text-xs text-slate-400">
              {t.messageTracking.sentOn} {new Date(result.createdAt).toLocaleString('fr-FR')}
            </span>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">{t.messageTracking.subject} :</span> {result.subject}
          </p>

          {result.reply || result.replyVoiceUrl ? (
            <div className="mt-4 rounded-lg border border-navy/20 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-400">
                {t.messageTracking.reply}
                {result.repliedAt && ` · ${new Date(result.repliedAt).toLocaleString('fr-FR')}`}
              </p>
              {result.reply && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{result.reply}</p>}
              {result.replyVoiceUrl && (
                <audio controls src={buildImageUrl(result.replyVoiceUrl)} className="mt-2 w-full" />
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">{t.messageTracking.noReply}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuiviPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">…</p>}>
      <SuiviForm />
    </Suspense>
  );
}
