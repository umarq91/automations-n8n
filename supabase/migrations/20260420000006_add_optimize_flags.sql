-- products: flag to queue for AI optimization via n8n workflow
alter table public.products
  add column if not exists to_optimize boolean not null default false;

-- Index so n8n can efficiently poll the queue
create index if not exists products_to_optimize_idx
  on public.products(organization_id) where to_optimize = true;
