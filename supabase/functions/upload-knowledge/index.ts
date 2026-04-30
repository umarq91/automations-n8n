import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Domain = 'general' | 'seo' | 'banned_words';
const VALID_DOMAINS: Domain[] = ['general', 'seo', 'banned_words'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function chunkText(text: string, maxChars = 800, overlap = 80): string[] {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 10);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars && current.length > 0) {
      chunks.push(current.trim());
      const words = current.split(' ');
      const overlapWords = words.slice(-Math.ceil(overlap / 6));
      current = overlapWords.join(' ') + '\n\n' + para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim().length > 10) chunks.push(current.trim());

  // Split oversized chunks by sentence
  const result: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChars * 2) {
      result.push(chunk);
      continue;
    }
    const sentences = chunk.split(/(?<=[.!?])\s+/);
    let sub = '';
    for (const sent of sentences) {
      if (sub.length + sent.length > maxChars && sub.length > 0) {
        result.push(sub.trim());
        sub = sent;
      } else {
        sub = sub ? sub + ' ' + sent : sent;
      }
    }
    if (sub.trim().length > 10) result.push(sub.trim());
  }

  return result;
}

async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    // Decode as latin1 to preserve byte values, then extract BT...ET text blocks
    const raw = new TextDecoder('latin1').decode(bytes);
    const parts: string[] = [];
    const btBlocks = raw.match(/BT[\s\S]*?ET/g) ?? [];
    for (const block of btBlocks) {
      // Extract literal strings: (text) and hex strings: <hex>
      const literals = block.match(/\((?:[^\\()]|\\.)*\)/g) ?? [];
      for (const lit of literals) {
        const inner = lit.slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\t/g, ' ')
          .replace(/\\\\/g, '\\')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')');
        if (/[a-zA-Z]/.test(inner)) parts.push(inner);
      }
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  return await file.text();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ ok: false, message: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('authorization');
  if (!authHeader) return json({ ok: false, message: 'Missing authorization header' }, 401);

  const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
  const PINECONE_KEY = Deno.env.get('PINECONE_API_KEY');
  const PINECONE_HOST = Deno.env.get('PINECONE_HOST');

  if (!OPENAI_KEY || !PINECONE_KEY || !PINECONE_HOST) {
    return json({ ok: false, message: 'Server misconfiguration: missing API keys' }, 500);
  }

  const jwt = authHeader.replace('Bearer ', '');
  let callerId: string;
  try {
    const [, payloadB64] = jwt.split('.');
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload?.sub) throw new Error('no sub');
    callerId = payload.sub as string;
  } catch {
    return json({ ok: false, message: 'Invalid token' }, 401);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json({ ok: false, message: 'Expected multipart/form-data' }, 400);
  }

  const file = formData.get('file') as File | null;
  const domain = formData.get('domain') as Domain | null;
  const orgId = formData.get('org_id') as string | null;

  if (!file || !domain || !orgId) {
    return json({ ok: false, message: 'Missing required fields: file, domain, org_id' }, 400);
  }
  if (!VALID_DOMAINS.includes(domain)) {
    return json({ ok: false, message: `domain must be one of: ${VALID_DOMAINS.join(', ')}` }, 400);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', callerId)
    .eq('status', 'active')
    .single();

  if (!membership) return json({ ok: false, message: 'Not a member of this organization' }, 403);
  if (membership.role !== 'owner' && membership.role !== 'admin') {
    return json({ ok: false, message: 'Only owners and admins can upload knowledge files' }, 403);
  }

  let text: string;
  try {
    text = await extractText(file);
  } catch (e: unknown) {
    return json({ ok: false, message: `Text extraction failed: ${(e as Error).message}` }, 400);
  }

  text = text.trim();
  if (!text) return json({ ok: false, message: 'File is empty or unreadable' }, 400);

  const chunks = chunkText(text);
  if (chunks.length === 0) return json({ ok: false, message: 'No usable text found in file' }, 400);

  // OpenAI embeddings — text-embedding-3-small produces 1536-dim vectors
  const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: chunks, dimensions: 1024 }),
  });

  if (!embeddingRes.ok) {
    const err = await embeddingRes.json().catch(() => ({})) as { error?: { message?: string } };
    return json({ ok: false, message: `OpenAI error: ${err?.error?.message ?? embeddingRes.status}` }, 502);
  }

  const embeddingData = await embeddingRes.json() as { data: { embedding: number[] }[] };
  const embeddings = embeddingData.data.map(d => d.embedding);

  const namespace = `${orgId}-${domain}`;
  const batchId = crypto.randomUUID();

  const vectors = chunks.map((chunk, i) => ({
    id: `${batchId}-${i}`,
    values: embeddings[i],
    metadata: { text: chunk, domain, org_id: orgId },
  }));

  // Clear existing vectors for this namespace before upserting
  await fetch(`${PINECONE_HOST}/vectors/delete`, {
    method: 'POST',
    headers: { 'Api-Key': PINECONE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ deleteAll: true, namespace }),
  });

  // Upsert in batches of 100 (Pinecone limit)
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    const upsertRes = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
      method: 'POST',
      headers: { 'Api-Key': PINECONE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ vectors: batch, namespace }),
    });

    if (!upsertRes.ok) {
      const err = await upsertRes.text().catch(() => '');
      return json({ ok: false, message: `Pinecone upsert failed: ${err.slice(0, 200)}` }, 502);
    }
  }

  return json({ ok: true, namespace, vector_id: batchId, chunk_count: chunks.length });
});
