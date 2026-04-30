import { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import { useAuth } from '../../../contexts/AuthContext';
import { AiConfigModel } from '../../../models/AiConfigModel';
import type { AiConfig } from '../../../lib/supabase/types';

type Domain = 'seo' | 'banned_words';

const DOMAIN_COLUMNS: Record<Domain, { ns: keyof AiConfig; id: keyof AiConfig }> = {
  seo: { ns: 'seo_vector_namespace', id: 'seo_vector_id' },
  banned_words: { ns: 'bannable_words_vector_namespace', id: 'bannable_words_vector_id' },
};

interface UploadResult {
  ok: boolean;
  namespace?: string;
  vector_id?: string;
  chunk_count?: number;
  message?: string;
}

interface Props {
  title: string;
  description: string;
  domain: Domain;
  activeNamespace: string | null;
  onUploaded: (namespace: string, vectorId: string) => void;
}

export default function KnowledgeUploadCard({ title, description, domain, activeNamespace, onUploaded }: Props) {
  const { activeOrg } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState<number | null>(null);

  async function handleFile(file: File) {
    if (!activeOrg) return;
    setUploading(true);
    setError(null);
    setChunkCount(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const form = new FormData();
      form.append('file', file);
      form.append('domain', domain);
      form.append('org_id', activeOrg.id);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/upload-knowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });

      const result: UploadResult = await res.json();
      if (!result.ok || !result.namespace || !result.vector_id) {
        throw new Error(result.message ?? 'Upload failed');
      }

      await AiConfigModel.upsert({
        organization_id: activeOrg.id,
        [DOMAIN_COLUMNS[domain].ns]: result.namespace,
        [DOMAIN_COLUMNS[domain].id]: result.vector_id,
      });

      setChunkCount(result.chunk_count ?? null);
      onUploaded(result.namespace, result.vector_id);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-ds-text">{title}</h2>
          <p className="text-ds-muted text-xs mt-0.5">{description}</p>
          <div className="mt-2.5 flex items-center gap-2">
            {activeNamespace ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-400 font-medium shrink-0">Active</span>
                <span className="text-[11px] text-ds-muted font-mono truncate">{activeNamespace}</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-ds-muted shrink-0" />
                <span className="text-[11px] text-ds-muted">No file uploaded</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".txt,.pdf,.md,.csv"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-xs gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? <><Loader2 size={13} className="animate-spin" /> Processing…</>
              : <><Upload size={13} /> {activeNamespace ? 'Replace file' : 'Upload file'}</>
            }
          </button>
          <span className="text-[11px] text-ds-muted">TXT, PDF, MD, CSV</span>
        </div>
      </div>

      {chunkCount !== null && !error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
          <CheckCircle2 size={13} className="shrink-0" />
          <span>Indexed <strong>{chunkCount}</strong> chunks into Pinecone.</span>
          <FileText size={13} className="ml-auto shrink-0 opacity-60" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
