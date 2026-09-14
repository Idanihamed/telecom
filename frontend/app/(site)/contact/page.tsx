'use client';

import Link from 'next/link';
import { useState } from 'react';
import { submitContactMessage, uploadVoiceMessage } from '../../../lib/api';
import { VoiceRecorder } from '../../../components/VoiceRecorder';
import { useLocale } from '../../../lib/i18n/context';

type ContactMode = 'text' | 'voice';

export default function ContactPage() {
  const { t } = useLocale();
  // Choix explicite du mode plutôt que deux champs "optionnels" affichés en même temps :
  // évite que le visiteur pense avoir fini après l'enregistrement du vocal alors qu'il reste
  // des champs texte requis (cause du blocage silencieux "remplir les champs vides").
  const [mode, setMode] = useState<ContactMode>('text');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceKey, setVoiceKey] = useState(0); // force le VoiceRecorder à se réinitialiser après envoi
  const [website, setWebsite] = useState(''); // honeypot : doit rester vide (voir lib/api.ts)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [sentContact, setSentContact] = useState('');

  function switchMode(next: ContactMode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'text' && !message.trim()) {
      setError(t.contactPage.errorWriteMessage);
      return;
    }
    if (mode === 'voice' && !voiceBlob) {
      setError(t.contactPage.errorRecordVoice);
      return;
    }

    setSaving(true);
    try {
      let voiceUrl: string | undefined;
      if (voiceBlob) {
        const uploaded = await uploadVoiceMessage(voiceBlob);
        voiceUrl = uploaded.url;
      }
      // Comme un vocal WhatsApp (§accessibilité) : avec un enregistrement, seul le contact
      // (pour pouvoir rappeler) reste obligatoire — nom et sujet reçoivent une valeur par
      // défaut plutôt que de bloquer l'envoi.
      const result = await submitContactMessage({
        name: name.trim() || t.contactPage.visitorDefaultName,
        contact,
        subject: subject.trim() || t.contactPage.voiceDefaultSubject,
        message: message || undefined,
        voiceUrl,
        website,
      });
      setSuccess(true);
      setReference(result.reference ?? null);
      setSentContact(contact);
      setName('');
      setContact('');
      setSubject('');
      setMessage('');
      setVoiceBlob(null);
      setVoiceKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.contactPage.errorGeneric);
    } finally {
      setSaving(false);
    }
  }

  const tabBase = 'flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition';
  const tabActive = 'bg-navy text-white';
  const tabInactive = 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold text-navy">{t.contactPage.title}</h1>
      <p className="mb-6 text-sm text-slate-500">{t.contactPage.subtitle}</p>

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-700">
          <p className="font-semibold">{t.contactPage.successTitle.replace('{contact}', sentContact)}</p>

          {reference && (
            <div className="mt-4 rounded-lg border border-green-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-green-600">{t.contactPage.trackingNumber}</p>
              <p className="mt-1 text-lg font-bold tracking-widest text-navy">{reference}</p>
              <p className="mt-2 text-xs text-slate-500">
                {t.contactPage.trackingNote}{' '}
                <Link href={`/suivi?ref=${reference}`} className="font-medium text-navy underline">
                  {t.contactPage.trackingLink}
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex gap-2" role="tablist" aria-label="Type de message">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'text'}
              onClick={() => switchMode('text')}
              className={`${tabBase} ${mode === 'text' ? tabActive : tabInactive}`}
            >
              {t.contactPage.writeTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'voice'}
              onClick={() => switchMode('voice')}
              className={`${tabBase} ${mode === 'voice' ? tabActive : tabInactive}`}
            >
              {t.contactPage.voiceTab}
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t.contactPage.contact} <span className="font-normal text-slate-400">({t.contactPage.contactHint})</span>
            </label>
            <input
              required
              minLength={3}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {mode === 'text' ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.contactPage.name}</label>
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.contactPage.subject}</label>
                <input
                  required
                  minLength={2}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{t.contactPage.message}</label>
                <textarea
                  required
                  minLength={5}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {t.contactPage.name} <span className="font-normal text-slate-400">({t.contactPage.optional})</span>
                </label>
                <input
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <VoiceRecorder key={voiceKey} onChange={setVoiceBlob} />
              <p className="text-xs text-slate-400">{t.contactPage.voiceNote}</p>
            </>
          )}

          {/* Champ honeypot anti-spam : invisible et non atteignable pour un utilisateur humain
              (tabIndex -1, hors écran), mais un bot qui remplit tous les champs le remplira.
              Le back-end accepte silencieusement sans notifier ni enregistrer si ce champ est rempli. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
            <label htmlFor="website">Ne pas remplir ce champ</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? t.contactPage.sending : t.contactPage.send}
          </button>
        </form>
      )}
    </div>
  );
}
