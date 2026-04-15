alter table organizations
  add column if not exists is_under_maintenance boolean not null default false;
