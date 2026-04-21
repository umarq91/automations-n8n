import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const API_VERSION = '2024-10';
const PAGE_SIZE = 250;
const DESCRIPTION_MAX = 500;
const UPDATE_BATCH = 50;

function respond(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface ShopifyImage {
  src: string;
  alt?: string | null;
  position?: number;
}

interface ShopifyVariant {
  id: number;
  title?: string;
  sku?: string | null;
  price?: string | number;
  compare_at_price?: string | number | null;
  inventory_quantity?: number | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
}

interface ShopifyOption {
  name: string;
  position: number;
  values: string[];
}

interface ShopifyApiProduct {
  id: number;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  product_type: string;
  tags: string;
  body_html?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  images?: ShopifyImage[];
  image?: ShopifyImage | null;
  variants?: ShopifyVariant[];
  options?: ShopifyOption[];
}

function parseLinkHeader(link: string | null): string | null {
  if (!link) return null;
  for (const part of link.split(',')) {
    const [urlPart, relPart] = part.split(';').map((s) => s.trim());
    if (!urlPart || !relPart) continue;
    if (relPart.includes('rel="next"')) {
      const match = urlPart.match(/^<(.+)>$/);
      if (match) return match[1];
    }
  }
  return null;
}

function toNumeric(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : null;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

interface MappedProduct {
  organization_id: string;
  title: string;
  source: 'shopify';
  shopify_id: number;
  shopify_status: string | null;
  photo_url: string | null;
  shopify_product_url: string | null;
  shopify_admin_url: string | null;
  status: 'NOT_IMPORTED';
  colors: string[];
  sizes: string[];
  to_optimize: boolean;
  metadata: Record<string, unknown>;
  updated_at: string;
}

function mapProduct(
  orgId: string,
  shopDomain: string,
  currency: string | null,
  p: ShopifyApiProduct,
): MappedProduct {
  const variants = p.variants ?? [];
  const firstVariant = variants[0];
  const variantPrices = variants.map((v) => toNumeric(v.price)).filter((n): n is number => n !== null);
  const priceMin = variantPrices.length ? Math.min(...variantPrices) : null;
  const priceMax = variantPrices.length ? Math.max(...variantPrices) : null;
  const inventoryNums = variants
    .map((v) => (typeof v.inventory_quantity === 'number' ? v.inventory_quantity : null))
    .filter((n): n is number => n !== null);
  const totalInventory = inventoryNums.length ? inventoryNums.reduce((a, b) => a + b, 0) : null;

  const images = (p.images ?? []).map((img, i) => ({
    src: img.src,
    alt: img.alt ?? null,
    position: img.position ?? i + 1,
  }));
  const firstImage = images[0]?.src ?? p.image?.src ?? null;

  const variantSummaries = variants.map((v) => ({
    id: v.id,
    title: v.title ?? '',
    sku: v.sku ?? null,
    price: toNumeric(v.price),
    compare_at_price: toNumeric(v.compare_at_price ?? null),
    inventory_quantity: typeof v.inventory_quantity === 'number' ? v.inventory_quantity : null,
    option1: v.option1 ?? null,
    option2: v.option2 ?? null,
    option3: v.option3 ?? null,
  }));

  const options = (p.options ?? []).map((o) => ({
    name: o.name,
    position: o.position,
    values: o.values ?? [],
  }));

  const tags = typeof p.tags === 'string'
    ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const syncedAt = new Date().toISOString();

  return {
    organization_id: orgId,
    title: p.title ?? '',
    source: 'shopify',
    shopify_id: p.id,
    shopify_status: p.status ?? null,
    photo_url: firstImage,
    shopify_product_url: `https://${shopDomain}/products/${p.handle}`,
    shopify_admin_url: `https://admin.shopify.com/store/${shopDomain.replace(/\.myshopify\.com$/, '')}/products/${p.id}`,
    status: 'NOT_IMPORTED',
    colors: [],
    sizes: [],
    to_optimize: false,
    metadata: {
      handle: p.handle ?? null,
      vendor: p.vendor ?? null,
      product_type: p.product_type ?? null,
      tags,
      images,
      options,
      variants: variantSummaries,
      sku: firstVariant?.sku ?? null,
      price: toNumeric(firstVariant?.price),
      compare_at_price: toNumeric(firstVariant?.compare_at_price ?? null),
      price_min: priceMin,
      price_max: priceMax,
      total_inventory: totalInventory,
      currency,
      variants_count: variants.length,
      body_html: p.body_html ?? null,
      description: stripHtml(p.body_html).slice(0, DESCRIPTION_MAX),
      published_at: p.published_at ?? null,
      shopify_created_at: p.created_at ?? null,
      shopify_updated_at: p.updated_at ?? null,
      synced_at: syncedAt,
    },
    updated_at: syncedAt,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return respond({ ok: false, message: 'Method not allowed.' }, 405);

  const { org_id } = await req.json().catch(() => ({}));
  if (!org_id) return respond({ ok: false, message: 'org_id is required.' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: integration, error: fetchErr } = await supabase
    .from('integrations')
    .select('*')
    .eq('organization_id', org_id)
    .eq('provider', 'shopify')
    .maybeSingle();

  if (fetchErr) return respond({ ok: false, message: 'Failed to load integration.' }, 500);
  if (!integration || !integration.is_active) {
    return respond({ ok: false, message: 'Shopify is not connected for this organization.' }, 400);
  }

  const creds = integration.credentials as {
    shop_domain?: string;
    access_token?: string;
  };
  const shopDomain = creds.shop_domain;
  const accessToken = creds.access_token;

  if (!shopDomain || !accessToken) {
    return respond({ ok: false, message: 'Shopify credentials are incomplete. Reconnect the store.' }, 400);
  }

  // Fetch shop currency once (best-effort)
  let currency: string | null = null;
  try {
    const shopRes = await fetch(`https://${shopDomain}/admin/api/${API_VERSION}/shop.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken, 'Accept': 'application/json' },
    });
    if (shopRes.ok) {
      const j = await shopRes.json();
      currency = j?.shop?.currency ?? null;
    }
  } catch { /* non-fatal */ }

  // Paginate through /products.json
  const rows: MappedProduct[] = [];
  let nextUrl: string | null =
    `https://${shopDomain}/admin/api/${API_VERSION}/products.json?limit=${PAGE_SIZE}`;
  let pages = 0;

  while (nextUrl && pages < 50) {
    let res: Response;
    try {
      res = await fetch(nextUrl, {
        headers: { 'X-Shopify-Access-Token': accessToken, 'Accept': 'application/json' },
      });
    } catch {
      return respond({ ok: false, message: 'Failed to reach Shopify.' }, 502);
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      if (res.status === 401) return respond({ ok: false, message: 'Shopify rejected the access token. Reconnect the store.' }, 401);
      return respond({ ok: false, message: `Shopify returned ${res.status}. ${text}`.slice(0, 300) }, 502);
    }

    const { products } = (await res.json()) as { products: ShopifyApiProduct[] };
    for (const p of products ?? []) rows.push(mapProduct(org_id, shopDomain, currency, p));

    nextUrl = parseLinkHeader(res.headers.get('link'));
    pages += 1;
  }

  if (rows.length > 0) {
    // Get existing shopify_ids so we can split insert vs update
    const { data: existing, error: existErr } = await supabase
      .from('products')
      .select('shopify_id')
      .eq('organization_id', org_id)
      .eq('source', 'shopify')
      .not('shopify_id', 'is', null);

    if (existErr) return respond({ ok: false, message: `Failed to check existing products: ${existErr.message}` }, 500);

    const existingIds = new Set((existing ?? []).map((r: { shopify_id: number }) => r.shopify_id));
    const newRows = rows.filter((r) => !existingIds.has(r.shopify_id));
    const updateRows = rows.filter((r) => existingIds.has(r.shopify_id));

    // Insert new products — to_optimize always false on first insert
    if (newRows.length > 0) {
      const { error: insertErr } = await supabase.from('products').insert(newRows);
      if (insertErr) return respond({ ok: false, message: `Failed to insert products: ${insertErr.message}` }, 500);
    }

    // Update existing — never touch to_optimize or optimized_at
    for (let i = 0; i < updateRows.length; i += UPDATE_BATCH) {
      const batch = updateRows.slice(i, i + UPDATE_BATCH);
      const results = await Promise.all(
        batch.map(({ to_optimize: _to, ...fields }) =>
          supabase
            .from('products')
            .update(fields)
            .eq('organization_id', org_id)
            .eq('shopify_id', fields.shopify_id)
        ),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) return respond({ ok: false, message: `Failed to update products: ${failed.error.message}` }, 500);
    }
  }

  // Delete products removed from Shopify (not in this sync)
  const syncedShopifyIds = rows.map((r) => r.shopify_id);
  if (syncedShopifyIds.length > 0) {
    await supabase
      .from('products')
      .delete()
      .eq('organization_id', org_id)
      .eq('source', 'shopify')
      .not('shopify_id', 'in', `(${syncedShopifyIds.join(',')})`);
  } else {
    await supabase.from('products').delete().eq('organization_id', org_id).eq('source', 'shopify');
  }

  const syncedAt = new Date().toISOString();
  await supabase
    .from('integrations')
    .update({
      metadata: {
        ...(integration.metadata ?? {}),
        last_products_sync_at: syncedAt,
        last_products_sync_count: rows.length,
      },
      updated_at: syncedAt,
    })
    .eq('id', integration.id);

  return respond({ ok: true, count: rows.length, synced_at: syncedAt });
});
