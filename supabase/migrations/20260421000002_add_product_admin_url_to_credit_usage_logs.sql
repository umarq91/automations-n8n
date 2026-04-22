ALTER TABLE credit_usage_logs
  ADD COLUMN product_id        uuid REFERENCES products(id) ON DELETE SET NULL,
  ADD COLUMN product_admin_url text;
