-- Merge shopify_products into products table

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS source         text        NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS shopify_id     bigint      NULL,
  ADD COLUMN IF NOT EXISTS shopify_status text        NULL,
  ADD COLUMN IF NOT EXISTS optimized_at   timestamptz NULL,
  ADD COLUMN IF NOT EXISTS metadata       jsonb       NULL;

-- Unique index for upsert on resync (org + shopify_id)
CREATE UNIQUE INDEX IF NOT EXISTS products_org_shopify_id_idx
  ON products (organization_id, shopify_id)
  WHERE shopify_id IS NOT NULL;

DROP TABLE IF EXISTS shopify_products;
