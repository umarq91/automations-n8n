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

function mapProduct(
  orgId: string,
  shopDomain: string,
  currency: string | null,
  p: ShopifyApiProduct,
) {
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

  const description = stripHtml(p.body_html).slice(0, DESCRIPTION_MAX);

  return {
    organization_id: orgId,
    shopify_product_id: p.id,
    title: p.title ?? '',
    handle: p.handle ?? null,
    status: p.status ?? null,
    vendor: p.vendor ?? null,
    product_type: p.product_type ?? null,
    tags,
    image_url: firstImage,
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
    admin_url: `https://admin.shopify.com/store/${shopDomain.replace(/\.myshopify\.com$/, '')}/products/${p.id}`,
    storefront_url: `https://${shopDomain}/products/${p.handle}`,
    shopify_created_at: p.created_at ?? null,
    shopify_updated_at: p.updated_at ?? null,
    published_at: p.published_at ?? null,
    body_html: p.body_html ?? null,
    description,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  const rows: ReturnType<typeof mapProduct>[] = [];
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

  // Upsert batch
  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from('shopify_products')
      .upsert(rows, { onConflict: 'organization_id,shopify_product_id' });
    if (upsertErr) {
      return respond({ ok: false, message: `Failed to save products: ${upsertErr.message}` }, 500);
    }
  }

  // Delete rows that no longer exist in Shopify (removed products)
  const ids = rows.map((r) => r.shopify_product_id);
  if (ids.length > 0) {
    await supabase
      .from('shopify_products')
      .delete()
      .eq('organization_id', org_id)
      .not('shopify_product_id', 'in', `(${ids.join(',')})`);
  } else {
    await supabase.from('shopify_products').delete().eq('organization_id', org_id);
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
