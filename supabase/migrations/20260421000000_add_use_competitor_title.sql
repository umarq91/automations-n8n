alter table public.products
  add column if not exists use_competitor_title boolean not null default false;
