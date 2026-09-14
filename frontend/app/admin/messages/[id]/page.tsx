'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  adminDeleteMessage,
  adminGetMessage,
  adminReplyMessage,
  adminSetMessageStatus,
  adminUploadReplyVoice,
} from '../../../../lib/admin-api';
import { buildImageUrl } from '../../../../lib/api';
import { VoiceRecorder } from '../../../../components/VoiceRecorder';
import { useLocale } from '../../../../lib/i18n/context';
import type { ContactMessage, ContactMessageStatus } from '../../../../lib/types';
import { useRouter } from 'next/navigation';

type ReplyMode = 'text' | 'voice';

const STATUS_CLASS: Record<ContactMessageStatus, string> = {
  NOUVEAU: 'bg-blue-100 text-blue-700',
  LU: 'bg-amber-100 text-amber-700',
  TRAITE: 'bg-green-100 text-green-700',
};

export default function AdminMessageDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLocale();
  const STATUS_LABEL = t.messageTracking.status;
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [replyMode, setReplyMode] = useState<ReplyMode>('text');
  const [reply, setReply] = useState('');
  const [replyVoiceBlob, setReplyVoiceBlob] = useState<Blob | null>(null);
  const [replyVoiceKey, setReplyVoiceKey] = useState(0);
  const [replying, setReplying] = useState(false);
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    // Le back-end fait automatiquement passer un message NOUVEAU à LU lors de cette
    // consultation (§29) : on affiche simplement le statut renvoyé par l'API.
    adminGetMessage(params.id)
      .then(setMessage)
      .catch((err) => setError(err.message));
  }, [params.id]);

  async function handleSetStatus(status: ContactMessageStatus) {
    if (!message) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminSetMessageStatus(message.id, status);
      setMessage(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messagesPage.statusUpdateError);
    } finally {
      setSaving(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    if (replyMode === 'text' && !reply.trim()) return;
    if (replyMode === 'voice' && !replyVoiceBlob) return;

    setReplying(true);
    setError(null);
    setReplySent(false);
    try {
      let replyVoiceUrl: string | undefined;
      if (replyVoiceBlob) {
        const uploaded = await adminUploadReplyVoice(replyVoiceBlob);
        replyVoiceUrl = uploaded.url;
      }
      const updated = await adminReplyMessage(message.id, {
        reply: replyMode === 'text' ? reply.trim() : undefined,
        replyVoiceUrl,
      });
      setMessage(updated);
      setReply('');
      setReplyVoiceBlob(null);
      setReplyVoiceKey((k) => k + 1);
      setReplySent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messagesPage.replyError);
    } finally {
      setReplying(false);
    }
  }

  async function handleDelete() {
    if (!message || !confirm(t.messagesPage.confirmDelete)) return;
    try {
      await adminDeleteMessage(message.id);
      router.push('/admin/messages');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messagesPage.deleteError);
    }
  }

  if (error && !message) return <p className="text-accent">{error}</p>;
  if (!message) return <p className="text-slate-500">{t.common.loading}</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">
          {t.messagesPage.messageOf} {message.name}
        </h1>
        <Link href="/admin/messages" className="text-sm text-slate-500 hover:text-navy">
          ← {t.adminCommon.back}
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[message.status]}`}>
            {STATUS_LABEL[message.status]}
          </span>
          <span className="text-xs text-slate-400">
            {t.messageTracking.sentOn} {new Date(message.createdAt).toLocaleString('fr-FR')}
          </span>
        </div>

        <p className="mb-4 text-xs text-slate-400">
          {t.messagesPage.trackingRefLabel} :{' '}
          <span className="font-mono font-medium tracking-widest text-slate-600">{message.reference}</span>
        </p>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t.messagesPage.name}</dt>
            <dd className="text-sm text-slate-800">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-slate-400">{t.messagesPage.contact}</dt>
            <dd className="text-sm text-slate-800">{message.contact}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-slate-400">{t.messagesPage.subject}</dt>
            <dd className="text-sm text-slate-800">{message.subject}</dd>
          </div>
        </dl>

        {message.voiceUrl && (
          <div className="mt-4">
            <dt className="text-xs font-medium uppercase text-slate-400">{t.messagesPage.voiceMessage}</dt>
            <dd className="mt-1 rounded-lg bg-slate-50 p-4">
              <audio controls src={buildImageUrl(message.voiceUrl)} className="w-full" />
            </dd>
          </div>
        )}

        {message.message && (
          <div className="mt-4">
            <dt className="text-xs font-medium uppercase text-slate-400">{t.messagesPage.message}</dt>
            <dd className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              {message.message}
            </dd>
          </div>
        )}

        {(message.replyMessage || message.replyVoiceUrl) && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium uppercase text-green-700">
              {t.messagesPage.replySentOn}
              {message.repliedAt && ` ${new Date(message.repliedAt).toLocaleString('fr-FR')}`} —{' '}
              {t.messagesPage.visibleOnTracking}
            </p>
            {message.replyMessage && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-green-900">{message.replyMessage}</p>
            )}
            {message.replyVoiceUrl && (
              <audio controls src={buildImageUrl(message.replyVoiceUrl)} className="mt-2 w-full" />
            )}
          </div>
        )}

        <form onSubmit={handleReply} className="mt-6 border-t border-slate-100 pt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {message.replyMessage || message.replyVoiceUrl ? t.messagesPage.editReply : t.messagesPage.reply}
          </label>
          <p className="mb-2 text-xs text-slate-400">
            {t.messagesPage.contactIfUrgent.replace('{contact}', message.contact)}
          </p>

          <div className="mb-3 flex gap-2" role="tablist" aria-label="Type de réponse">
            <button
              type="button"
              role="tab"
              aria-selected={replyMode === 'text'}
              onClick={() => setReplyMode('text')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                replyMode === 'text' ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.contactPage.writeTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={replyMode === 'voice'}
              onClick={() => setReplyMode('voice')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                replyMode === 'voice' ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.contactPage.voiceTab}
            </button>
          </div>

          {replyMode === 'text' ? (
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t.messagesPage.writeReplyHere}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          ) : (
            <VoiceRecorder key={replyVoiceKey} onChange={setReplyVoiceBlob} />
          )}

          {replySent && <p className="mt-1 text-sm text-green-700">{t.messagesPage.replySaved}</p>}
          <button
            type="submit"
            disabled={replying || (replyMode === 'text' ? !reply.trim() : !replyVoiceBlob)}
            className="mt-2 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {replying ? t.checkout.sending : t.messagesPage.saveReply}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {message.status !== 'TRAITE' && (
            <button
              disabled={saving}
              onClick={() => handleSetStatus('TRAITE')}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t.messagesPage.markTreated}
            </button>
          )}
          {message.status === 'TRAITE' && (
            <button
              disabled={saving}
              onClick={() => handleSetStatus('LU')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              {t.messagesPage.reopen}
            </button>
          )}
          <button onClick={handleDelete} className="rounded-lg border border-accent px-4 py-2 text-sm text-accent">
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
