import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { varLabel } from '../emailHelpers';

interface VisualEditorProps {
  html: string;
  onChange: (html: string) => void;
  variables: string[];
}

export default function VisualEditor({ html, onChange, variables }: VisualEditorProps) {
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const onChangeRef = useRef(onChange);
  const dropRef     = useRef<HTMLDivElement>(null);
  const [varDropOpen, setVarDropOpen] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setVarDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cleanHtml = (raw: string) =>
    raw
      .replace(/<style id="__editor">[\s\S]*?<\/style>/g, '')
      .replace(/ contenteditable="true"/g, '')
      .replace(/ style="outline: none; cursor: text;"/g, '');

  const execCmd = (cmd: string, val?: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.execCommand(cmd, false, val ?? '');
    onChangeRef.current(cleanHtml(doc.documentElement.outerHTML));
  };

  const insertVar = (varName: string) => {
    execCmd('insertText', `{{${varName}}}`);
    setVarDropOpen(false);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const init = () => {
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) return;

      doc.open();
      doc.write(html || '<p style="color:#6b7280;font-family:sans-serif;padding:24px 32px;">No content yet.</p>');
      doc.close();

      doc.querySelectorAll<HTMLElement>('p, li, h1, h2, h3, td').forEach((el) => {
        el.contentEditable = 'true';
        el.style.outline = 'none';
        el.style.cursor = 'text';
      });

      const style = doc.createElement('style');
      style.id = '__editor';
      style.textContent = `
        [contenteditable]:hover { outline: 1px dashed #4DA3FF !important; border-radius: 3px; }
        [contenteditable]:focus { outline: 2px solid  #4DA3FF !important; border-radius: 3px; }
        ::selection { background: rgba(77,163,255,0.2); }
      `;
      doc.head.appendChild(style);

      doc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName === 'TD') e.preventDefault();
      });

      doc.addEventListener('input', () => {
        onChangeRef.current(cleanHtml(doc.documentElement.outerHTML));
      });
    };

    if (iframe.contentDocument?.readyState === 'complete' || !iframe.src) {
      init();
    } else {
      iframe.addEventListener('load', init, { once: true });
    }
  }, []); // run once — key prop on TemplateDetail handles template switching

  return (
    <div className="rounded-xl border border-ds-borderSoft overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 bg-ds-surface2 border-b border-ds-borderSoft">
        {([
          { label: 'B', title: 'Bold (Ctrl+B)',      cmd: 'bold',      cls: 'font-bold' },
          { label: 'I', title: 'Italic (Ctrl+I)',    cmd: 'italic',    cls: 'italic' },
          { label: 'U', title: 'Underline (Ctrl+U)', cmd: 'underline', cls: 'underline decoration-current' },
        ] as const).map(({ label, title, cmd, cls }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd); }}
            className={`w-7 h-7 rounded text-ds-text2 hover:bg-ds-hover hover:text-ds-text transition-colors text-xs flex items-center justify-center ${cls}`}
          >
            {label}
          </button>
        ))}

        <div className="w-px h-4 bg-ds-borderSoft mx-1.5 shrink-0" />

        {variables.length > 0 && (
          <div className="relative" ref={dropRef}>
            <button
              type="button"
              title="Insert a personalization field at the cursor position"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setVarDropOpen((o) => !o)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded text-xs text-ds-accent hover:bg-ds-accent/10 transition-colors font-medium"
            >
              <span className="font-mono leading-none">{'{}'}</span>
              Insert Field
              <ChevronDown size={11} className={`transition-transform duration-150 ${varDropOpen ? 'rotate-180' : ''}`} />
            </button>

            {varDropOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-ds-surface border border-ds-border rounded-xl shadow-card overflow-hidden min-w-[210px]">
                <p className="px-3 py-2 text-xs text-ds-muted border-b border-ds-borderSoft">
                  Click to insert at cursor
                </p>
                {variables.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertVar(v)}
                    className="w-full text-left px-3 py-2 hover:bg-ds-hover transition-colors flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-ds-text">{varLabel(v)}</span>
                    <span className="text-xs font-mono text-ds-muted shrink-0">{`{{${v}}}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-xs text-ds-muted select-none">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Click text in the email to edit
        </div>
      </div>

      <div className="bg-white">
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin"
          title="Email visual editor"
          className="w-full"
          style={{ height: 460, border: 'none', display: 'block' }}
        />
      </div>
    </div>
  );
}
