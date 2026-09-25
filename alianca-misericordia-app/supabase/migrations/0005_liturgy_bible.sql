-- =========================================================================
-- Liturgia diária e Bíblia (cache local, populado por Edge Functions).
-- =========================================================================

create table daily_liturgy (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  locale text not null default 'pt-BR',
  liturgical_color text,
  liturgical_season text,
  celebration text,
  saint_of_day text,
  first_reading_ref text,
  first_reading_text text,
  psalm_ref text,
  psalm_text text,
  second_reading_ref text,
  second_reading_text text,
  gospel_ref text,
  gospel_text text,
  reflection text,
  source text default 'liturgia.up.railway.app',
  synced_at timestamptz default now(),
  unique(date, locale)
);

create table bible_versions (
  id text primary key, -- ex: 'ave-maria', 'acf'
  name text not null,
  language text not null default 'pt-BR'
);

create table bible_books (
  id text primary key, -- ex: 'gn', 'mt'
  version_id text references bible_versions(id) on delete cascade,
  testament text not null check (testament in ('AT', 'NT')),
  name text not null,
  abbreviation text not null,
  order_index integer not null,
  chapters_count integer not null
);

create table bible_verses (
  id bigint generated always as identity primary key,
  book_id text references bible_books(id) on delete cascade,
  version_id text references bible_versions(id) on delete cascade,
  chapter integer not null,
  verse integer not null,
  text text not null
);

create index idx_bible_verses_lookup on bible_verses(version_id, book_id, chapter);

alter table daily_liturgy enable row level security;
alter table bible_versions enable row level security;
alter table bible_books enable row level security;
alter table bible_verses enable row level security;

-- Leitura pública (não é dado sensível); escrita só via service_role
-- (funções de sincronização) ou staff (tela Admin, se precisar corrigir algo).
create policy "daily_liturgy_select_all" on daily_liturgy for select using (true);
create policy "daily_liturgy_write_staff" on daily_liturgy for all using (is_staff());

create policy "bible_versions_select_all" on bible_versions for select using (true);
create policy "bible_books_select_all" on bible_books for select using (true);
create policy "bible_verses_select_all" on bible_verses for select using (true);
