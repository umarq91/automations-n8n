create table public.workflow_logs (
  id                  uuid                     not null default gen_random_uuid(),
  organization_id     uuid                     null,
  workflow_id         text                     null,
  workflow_name       text                     null,
  execution_id        text                     null,
  execution_url       text                     null,
  type                text                     null,
  error_description   text                     null,
  last_node_executed  text                     null,
  error_message       text                     null,
  product_id          uuid                     null,
  product_title       text                     null,
  created_at          timestamp with time zone null default now(),

  constraint workflow_logs_pkey
    primary key (id),

  constraint workflow_logs_organization_id_fkey
    foreign key (organization_id)
    references organizations (id)
    on delete cascade,

  constraint workflow_logs_product_id_fkey
    foreign key (product_id)
    references products (id)
    on delete set null
) tablespace pg_default;

create index workflow_logs_organization_id_idx on public.workflow_logs (organization_id);
create index workflow_logs_product_id_idx      on public.workflow_logs (product_id);
create index workflow_logs_type_idx            on public.workflow_logs (type);
create index workflow_logs_created_at_idx      on public.workflow_logs (created_at desc);
