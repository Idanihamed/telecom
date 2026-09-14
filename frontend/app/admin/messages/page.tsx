'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminDeleteMessage, adminListMessages } from '../../../lib/admin-api';
import { useLocale } from '../../../lib/i18n/context';
import type { ContactMessage, ContactMessageStatus } from '../../../lib/types';

const STATUS_CLASS: Record<ContactMessageStatus, string> = {
  NOUVEAU: 'bg-blue-100 text-blue-700',
  LU: 'bg-amber-100 text-amber-700',
  TRAITE: 'bg-green-100 text-green-700',
};

export default function AdminMessagesPage() {
  const { t } = useLocale();
  const STATUS_LABEL = t.messageTracking.status;
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const result = await adminListMessages(params);
      setMessages(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.adminCommon.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(t.messagesPage.confirmDelete)) return;
    try {
      await adminDeleteMessage(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messagesPage.deleteError);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">{t.messagesPage.title}</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="mb-4 flex flex-wrap gap-2"
      >
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">{t.adminCommon.allStatuses}</option>
          <option value="NOUVEAU">{STATUS_LABEL.NOUVEAU}</option>
          <option value="LU">{STATUS_LABEL.LU}</option>
          <option value="TRAITE">{STATUS_LABEL.TRAITE}</option>
        </select>
        <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
          {t.adminCommon.filter}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-accent">{error}</p>}

      {loading ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">{t.messagesPage.name}</th>
                <th className="px-4 py-2">{t.messagesPage.subject}</th>
                <th className="px-4 py-2">{t.adminCommon.date}</th>
                <th className="px-4 py-2">{t.adminCommon.status}</th>
                <th className="px-4 py-2">{t.adminCommon.actions}</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className="border-t border-slate-100 transition even:bg-slate-50/70 hover:bg-slate-100/80">
                  <td className="px-4 py-2 font-medium text-slate-800">{message.name}</td>
                  <td className="px-4 py-2 text-slate-600">
                    <span className="flex items-center gap-2">
                      {message.subject}
                      {message.voiceUrl && (
                        <span title={t.messagesPage.voiceLabel} aria-label={t.messagesPage.voiceLabel}>
                          🎤
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[message.status]}`}>
                      {STATUS_LABEL[message.status]}
                    </span>
                  </td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-2">
                    <Link href={`/admin/messages/${message.id}`} className="text-navy hover:underline">
                      {t.adminCommon.view}
                    </Link>
                    <button onClick={() => handleDelete(message.id)} className="text-accent hover:underline">
                      {t.common.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    {t.messagesPage.noMessages}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
