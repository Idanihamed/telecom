'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const TOOLBAR_BUTTON = 'rounded px-2 py-1 text-sm font-medium hover:bg-slate-100';
const TOOLBAR_BUTTON_ACTIVE = 'bg-slate-200';

/**
 * Éditeur de texte riche pour Actualités/Pages. Configuré pour ne produire QUE le
 * sous-ensemble de balises accepté par le nettoyage HTML côté serveur (voir
 * backend/src/common/utils/sanitize-html.util.ts : p, br, strong, em, u, ul, ol, li, h2, h3,
 * blockquote, a) — tout ce que l'utilisateur peut produire ici survit donc intact à
 * l'assainissement serveur, sans surprise pour l'admin qui tapait auparavant du HTML brut.
 */
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Retiré : pas dans la liste blanche serveur, produirait du contenu supprimé au
        // moment de l'enregistrement (surprise pour l'admin qui verrait sa mise en forme
        // disparaître après coup plutôt que de ne jamais l'avoir).
        strike: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // Pas de plugin @tailwindcss/typography installé dans ce projet (voir
        // tailwind.config.ts) : styles minimaux ciblés directement plutôt qu'une classe
        // `prose` qui n'aurait aucun effet.
        class:
          'min-h-[220px] px-3 py-2 text-sm focus:outline-none ' +
          '[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy ' +
          '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy ' +
          '[&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 ' +
          '[&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 ' +
          '[&_a]:text-navy [&_a]:underline',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Resynchronise l'éditeur quand `value` change depuis l'extérieur (ex. chargement initial
  // asynchrone des données existantes) — sans ça, l'éditeur resterait vide si `value` arrive
  // après le montage du composant.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  function setLink() {
    const previousUrl = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL du lien', previousUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="rounded-lg border border-slate-300">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('bold') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          <strong>G</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('italic') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('underline') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          <span className="underline">S</span>
        </button>
        <span className="mx-1 w-px bg-slate-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('heading', { level: 2 }) ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('heading', { level: 3 }) ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          H3
        </button>
        <span className="mx-1 w-px bg-slate-200" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('bulletList') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          • Liste
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('orderedList') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          1. Liste
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${TOOLBAR_BUTTON} ${editor.isActive('blockquote') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          Citation
        </button>
        <span className="mx-1 w-px bg-slate-200" />
        <button type="button" onClick={setLink} className={`${TOOLBAR_BUTTON} ${editor.isActive('link') ? TOOLBAR_BUTTON_ACTIVE : ''}`}>
          Lien
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
