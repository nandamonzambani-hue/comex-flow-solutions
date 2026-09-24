-- =========================================================================
-- Aliança da Misericórdia — schema inicial
-- Produto exclusivo (single-tenant, não é multi-organização como o app de
-- paróquias). No cadastro, a pessoa escolhe cidade + nível de vínculo +
-- cor de evangelização, em vez de escolher uma paróquia.
-- =========================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Cores de evangelização: cada cor é um grupo/expressão de serviço.
-- Fixo (definido pela Aliança), não editável pelo usuário final.
-- ---------------------------------------------------------------------
create type evangelization_color as enum (
  'vermelho',  -- Servos
  'laranja',   -- Artistas
  'amarelo',   -- Adoradores
  'verde',     -- Pastores
  'azul',      -- Anunciadores
  'rosa',      -- Construtores de Paz
  'violeta'    -- Vítimas
);

-- ---------------------------------------------------------------------
-- Níveis de vínculo: configurável pelo admin (nomes/ordem podem mudar),
-- por isso é tabela e não enum.
-- ---------------------------------------------------------------------
create table membership_levels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Perfis (estende auth.users)
-- ---------------------------------------------------------------------
create type member_role as enum ('member', 'leader', 'staff', 'admin');
create type member_status as enum ('active', 'inactive', 'pending');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  birth_date date,
  city text,
  state text,
  evangelization_color evangelization_color,
  membership_level_id uuid references membership_levels(id) on delete set null,
  role member_role not null default 'member',
  status member_status not null default 'active',
  notes text,
  preferred_locale text default 'pt-BR',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_city on profiles(city);
create index idx_profiles_color on profiles(evangelization_color);

-- ---------------------------------------------------------------------
-- Grupos locais (por cidade/célula) — opcional, útil pra encontros
-- presenciais dentro de uma cidade.
-- ---------------------------------------------------------------------
create type group_type as enum ('celula', 'coordenacao', 'evento_local', 'other');

create table groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  type group_type not null default 'celula',
  city text,
  description text,
  cover_image_url text,
  leader_id uuid references profiles(id) on delete set null,
  meeting_schedule text,
  is_active boolean default true,
  created_at timestamptz not null default now()
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
-- Eventos (encontros, retiros, formações)
-- ---------------------------------------------------------------------
create table events (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid references groups(id) on delete set null,
  title text not null,
  description text,
  location text,
  city text,
  category text default 'geral',
  cover_image_url text,
  start_at timestamptz not null,
  end_at timestamptz,
  capacity integer,
  requires_registration boolean default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_events_start on events(start_at);

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
-- Notícias / comunicados
-- ---------------------------------------------------------------------
create table news_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  subtitle text,
  body text not null,
  cover_image_url text,
  category text default 'geral',
  author_id uuid references profiles(id) on delete set null,
  is_pinned boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Notificações push
-- ---------------------------------------------------------------------
create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  token text not null unique,
  device_type text,
  created_at timestamptz not null default now()
);

create type notification_target_type as enum ('all', 'group', 'color', 'level', 'profile');

create table notifications_log (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  target_type notification_target_type not null default 'all',
  target_id text,
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
