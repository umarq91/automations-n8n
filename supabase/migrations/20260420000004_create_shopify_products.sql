-- ─────────────────────────────────────────────────────────────────────────────
-- shopify_products
--   Cache of products pulled from each organization's connected Shopify store.
--   Populated by the `shopify-sync-products` edge function on user-triggered
--   resync. One row per (organization_id, shopify_product_id).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.shopify_products (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  shopify_product_id   bigint not null,
  title                text not null default '',
  handle               text,
  status               text,
  vendor               text,
  product_type         text,
  tags                 text[] not null default '{}',
  image_url            text,
  price                numeric,
  compare_at_price     numeric,
  currency             text,
  variants_count       integer not null default 0,
  admin_url            text,
  storefront_url       text,
  shopify_created_at   timestamptz,
  shopify_updated_at   timestamptz,
  synced_at            timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (organization_id, shopify_product_id)
);

create index if not exists shopify_products_org_idx
  on public.shopify_products(organization_id);

create index if not exists shopify_products_synced_at_idx
  on public.shopify_products(synced_at desc);

-- RLS intentionally not enabled on this table.
