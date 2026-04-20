-- ─────────────────────────────────────────────────────────────────────────────
-- Expand shopify_products with richer detail for the monitoring view.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.shopify_products
  add column if not exists description      text,
  add column if not exists body_html        text,
  add column if not exists sku              text,
  add column if not exists images           jsonb       not null default '[]'::jsonb,
  add column if not exists options          jsonb       not null default '[]'::jsonb,
  add column if not exists variants         jsonb       not null default '[]'::jsonb,
  add column if not exists total_inventory  integer,
  add column if not exists price_min        numeric,
  add column if not exists price_max        numeric,
  add column if not exists published_at     timestamptz;

comment on column public.shopify_products.description is
  'Plain-text preview stripped from body_html, safe to render in cards.';

comment on column public.shopify_products.variants is
  'JSON array of variant summaries: {id,title,sku,price,compare_at_price,inventory_quantity,option1,option2,option3}.';

comment on column public.shopify_products.options is
  'JSON array of product options: {name,position,values[]}.';

comment on column public.shopify_products.images is
  'JSON array of image objects: {src,alt,position}.';
