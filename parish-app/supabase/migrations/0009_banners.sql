-- =========================================================================
-- Banners rotativos exibidos no topo da Home (carrossel). Cada paróquia
-- gerencia os seus próprios; a equipe (staff) publica/edita/apaga, todo
-- mundo da paróquia enxerga os ativos.
-- =========================================================================

create table banners (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  image_url text not null,
  title text,
  link_url text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_banners_parish_active on banners(parish_id, is_active, order_index);

alter table banners enable row level security;

create policy "banners_select_parish" on banners for select
  using (
    parish_id = auth_parish_id()
    and is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
create policy "banners_select_staff" on banners for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "banners_write_staff" on banners for all
  using (is_staff() and parish_id = auth_parish_id())
  with check (is_staff() and parish_id = auth_parish_id());
