'use client';

import { useEffect, useRef, useState } from 'react';

// Enregistrement vocal pour les personnes ne sachant pas écrire (proposition
// accessibilité, en complément du §23) : Start/Stop, aperçu audio avant envoi,
// possibilité de recommencer. Le bouton reste masqué si le navigateur ne supporte pas
// MediaRecorder plutôt que d'afficher un contrôle qui plantera au clic.
const PREFERRED_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];

function pickSupportedMimeType(): string | null {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return null;
  return PREFERRED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null;
}

// getUserMedia rejette avec des DOMException dont le `name` distingue les causes réelles —
// un message générique ("micro inaccessible") ne permet pas de savoir s'il faut changer un
// réglage navigateur, brancher un micro, ou si la page n'est simplement pas servie en HTTPS.
function describeRecordingError(err: unknown): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Le micro nécessite une connexion sécurisée (HTTPS) ou "localhost" — cette page est chargée en HTTP simple.';
  }
  const name = err instanceof DOMException ? err.name : undefined;
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Accès au microphone refusé. Clique sur l’icône 🔒 à côté de l’adresse du site et autorise le microphone, puis recharge la page.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'Aucun microphone détecté sur cet appareil.';
    case 'NotReadableError':
      return 'Le microphone est déjà utilisé par une autre application.';
    default:
      return `Micro inaccessible${name ? ` (${name})` : ''} : vérifie que tu as autorisé l’accès au microphone.`;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VoiceRecorder({ onChange }: { onChange: (blob: Blob | null) => void }) {
  // null = pas encore vérifié (rendu serveur / avant hydratation) ; true/false après.
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(!!pickSupportedMimeType() && !!navigator.mediaDevices?.getUserMedia);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      previewUrl && URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType ?? 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onChange(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      setError(describeRecordingError(err));
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function reset() {
    previewUrl && URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setDuration(0);
    onChange(null);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        Message vocal <span className="font-normal text-slate-400">(optionnel si tu écris déjà un message)</span>
      </label>

      {supported === false ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {typeof window !== 'undefined' && !window.isSecureContext
            ? 'L’enregistrement vocal nécessite une connexion sécurisée (HTTPS) ou "localhost" — indisponible sur cette adresse.'
            : 'L’enregistrement vocal n’est pas disponible dans ce navigateur. Essaie avec Chrome, Edge ou Firefox.'}
        </p>
      ) : !previewUrl ? (
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
            recording
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-slate-300 text-slate-600 hover:border-navy hover:text-navy'
          }`}
        >
          <span aria-hidden>{recording ? '⏹️' : '🎤'}</span>
          {recording ? `Arrêter (${formatDuration(duration)})` : 'Enregistrer un message vocal'}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-300 p-3">
          <audio controls src={previewUrl} className="h-9 flex-1 min-w-[200px]" />
          <button type="button" onClick={reset} className="text-sm font-medium text-accent hover:underline">
            Supprimer et recommencer
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-accent">{error}</p>}
    </div>
  );
}
