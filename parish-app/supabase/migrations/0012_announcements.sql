-- =========================================================================
-- Avisos paroquiais (mural de avisos): comunicados curtos e por tempo
-- limitado da própria paróquia (ex: "Missa de sábado às 18h transferida
-- pra 19h", "Confissões neste horário especial") — diferente de
-- news_posts (notícias/artigos mais longos) e de banners (imagem
-- promocional). A equipe (staff) publica; todo mundo da paróquia vê os
-- avisos ativos e dentro da validade.
-- =========================================================================

create table announcements (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  title text not null,
  body text not null,
  is_pinned boolean not null default false,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_announcements_parish_active on announcements(parish_id, is_active, is_pinned, created_at desc);

alter table announcements enable row level security;

create policy "announcements_select_parish" on announcements for select
  using (
    parish_id = auth_parish_id()
    and is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
create policy "announcements_select_staff" on announcements for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "announcements_write_staff" on announcements for all
  using (is_staff() and parish_id = auth_parish_id())
  with check (is_staff() and parish_id = auth_parish_id());
