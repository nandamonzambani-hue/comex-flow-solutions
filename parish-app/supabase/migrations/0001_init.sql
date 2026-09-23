-- =========================================================================
-- Paróquia App — schema inicial
-- Multi-paróquia por padrão (parish_id em quase toda tabela) para permitir
-- vender o mesmo app para várias paróquias/comunidades no futuro.
-- =========================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Paróquias (tenant)
-- ---------------------------------------------------------------------
create table parishes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  address text,
  city text,
  state text,
  phone text,
  email text,
  logo_url text,
  primary_color text default '#7A1F2B',
  secondary_color text default '#C9A24B',
  timezone text default 'America/Sao_Paulo',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Perfis (estende auth.users)
-- ---------------------------------------------------------------------
create type member_role as enum ('member', 'group_leader', 'staff', 'admin', 'pastor');
create type member_status as enum ('active', 'inactive', 'pending');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  parish_id uuid references parishes(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  birth_date date,
  address text,
  city text,
  neighborhood text,
  role member_role not null default 'member',
  status member_status not null default 'active',
  baptized boolean default false,
  confirmed boolean default false,
  marital_status text,
  notes text,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_parish on profiles(parish_id);

-- Famílias (agrupam perfis para cadastro/relatórios pastorais)
create table families (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  family_name text not null,
  address text,
  created_at timestamptz not null default now()
);

create table family_members (
  family_id uuid references families(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  relationship text,
  primary key (family_id, profile_id)
);

-- ---------------------------------------------------------------------
-- Grupos: pastorais, movimentos, coral, catequese, notícias etc.
-- ---------------------------------------------------------------------
create type group_type as enum ('pastoral', 'movement', 'ministry', 'choir', 'catechesis', 'news', 'other');

create table groups (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  name text not null,
  slug text not null,
  type group_type not null default 'pastoral',
  description text,
  cover_image_url text,
  leader_id uuid references profiles(id) on delete set null,
  meeting_schedule text,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  unique(parish_id, slug)
);

create type group_member_role as enum ('member', 'coordinator', 'leader');

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role_in_group group_member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, profile_id)
);

-- ---------------------------------------------------------------------
-- Eventos (inclui missas, encontros, retiros — recorrentes ou não)
-- ---------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  title text not null,
  description text,
  location text,
  category text default 'geral', -- missa, encontro, retiro, festa, catequese...
  cover_image_url text,
  start_at timestamptz not null,
  end_at timestamptz,
  is_recurring boolean default false,
  recurrence_rule text, -- iCal RRULE, ex: FREQ=WEEKLY;BYDAY=SU
  capacity integer,
  requires_registration boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_events_parish_start on events(parish_id, start_at);

create type registration_status as enum ('confirmed', 'waitlist', 'cancelled');

create table event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status registration_status not null default 'confirmed',
  guests_count integer default 0,
  registered_at timestamptz not null default now(),
  checked_in_at timestamptz,
  unique(event_id, profile_id)
);

-- ---------------------------------------------------------------------
-- Financeiro: dízimo, ofertas, campanhas, festas
-- ---------------------------------------------------------------------
create type financial_category_type as enum ('dizimo', 'oferta', 'campanha', 'festa', 'missa_intencao', 'outro');

create table financial_categories (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  name text not null,
  type financial_category_type not null default 'outro',
  is_active boolean default true
);

create type campaign_status as enum ('draft', 'active', 'completed', 'cancelled');

create table campaigns (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  goal_amount numeric(12,2),
  current_amount numeric(12,2) not null default 0,
  cover_image_url text,
  start_date date,
  end_date date,
  status campaign_status not null default 'active',
  created_at timestamptz not null default now(),
  unique(parish_id, slug)
);

create type payment_method as enum ('pix', 'credit_card', 'debit_card', 'boleto', 'cash', 'bank_transfer', 'other');
create type payment_status as enum ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
create type recurrence_frequency as enum ('once', 'weekly', 'monthly', 'yearly');

create table donations (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null, -- null = doação anônima
  campaign_id uuid references campaigns(id) on delete set null,
  category_id uuid references financial_categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'BRL',
  payment_method payment_method not null default 'pix',
  payment_status payment_status not null default 'pending',
  is_recurring boolean default false,
  recurrence_frequency recurrence_frequency default 'once',
  external_payment_id text, -- id no gateway (Pix/Mercado Pago/Stripe)
  external_payment_provider text,
  receipt_url text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_donations_parish on donations(parish_id, created_at desc);
create index idx_donations_profile on donations(profile_id);

-- Compromisso de dízimo recorrente (assinatura mensal)
create table recurring_pledges (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  category_id uuid references financial_categories(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  frequency recurrence_frequency not null default 'monthly',
  payment_method payment_method not null default 'pix',
  external_subscription_id text,
  is_active boolean default true,
  next_charge_at date,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Conteúdo: vídeos, artigos/textos, notícias
-- ---------------------------------------------------------------------
create type content_type as enum ('video', 'article', 'audio', 'live');

create table media_content (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  title text not null,
  slug text not null,
  description text,
  content_type content_type not null default 'article',
  body text, -- markdown, para artigos
  video_url text,
  audio_url text,
  thumbnail_url text,
  duration_seconds integer,
  category text,
  tags text[] default '{}',
  author_id uuid references profiles(id) on delete set null,
  is_featured boolean default false,
  views_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(parish_id, slug)
);

create index idx_media_parish_published on media_content(parish_id, published_at desc);

create table news_posts (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  title text not null,
  slug text not null,
  subtitle text,
  body text not null,
  cover_image_url text,
  category text default 'geral',
  author_id uuid references profiles(id) on delete set null,
  is_pinned boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(parish_id, slug)
);

-- ---------------------------------------------------------------------
-- Downloads (materiais, apostilas, partituras, editais)
-- ---------------------------------------------------------------------
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  title text not null,
  description text,
  file_url text not null,
  file_type text, -- pdf, docx, mp3...
  file_size_bytes bigint,
  category text default 'geral',
  uploaded_by uuid references profiles(id) on delete set null,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Bíblia (cache local; populado via função de sincronização)
-- ---------------------------------------------------------------------
create table bible_versions (
  id text primary key, -- ex: 'ave-maria', 'nvi', 'acf'
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

-- ---------------------------------------------------------------------
-- Liturgia diária
-- ---------------------------------------------------------------------
create table daily_liturgy (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  liturgical_color text,
  liturgical_season text,
  celebration text, -- ex: "Domingo XXV do Tempo Comum"
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
  source text default 'cnbb',
  synced_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Notificações push
-- ---------------------------------------------------------------------
create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  token text not null unique,
  device_type text, -- ios, android
  created_at timestamptz not null default now()
);

create type notification_target_type as enum ('all', 'group', 'role', 'profile');

create table notifications_log (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  title text not null,
  body text not null,
  target_type notification_target_type not null default 'all',
  target_id text, -- group_id, role name, ou profile_id conforme target_type
  data jsonb default '{}',
  sent_by uuid references profiles(id) on delete set null,
  sent_at timestamptz not null default now(),
  recipients_count integer default 0
);

-- ---------------------------------------------------------------------
-- updated_at trigger genérico
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
