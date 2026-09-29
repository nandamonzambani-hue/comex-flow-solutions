-- Movimenta — esquema inicial
-- Dados no Supabase (PostgreSQL). Vídeos ficam no Cloudflare Stream; aqui guardamos só o UID.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tipos
-- =========================================================================
create type public.user_role as enum ('aluna', 'admin');
create type public.fitness_goal as enum ('emagrecer', 'ganhar_massa', 'condicionamento', 'saude', 'flexibilidade');
create type public.fitness_level as enum ('iniciante', 'intermediario', 'avancado');
create type public.meal_type as enum ('cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia');
create type public.video_status as enum ('aguardando_upload', 'processando', 'pronto', 'erro');
create type public.favorite_type as enum ('treino', 'receita', 'exercicio');
create type public.push_audience as enum ('todas', 'assinantes', 'nao_assinantes');

-- =========================================================================
-- Perfis
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  birth_date date,
  height_cm numeric(5, 1) check (height_cm is null or height_cm between 100 and 250),
  goal public.fitness_goal,
  level public.fitness_level not null default 'iniciante',
  training_days_per_week smallint check (training_days_per_week between 1 and 7),
  role public.user_role not null default 'aluna',
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cria o perfil automaticamente quando a usuária se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- A aluna não pode se promover a admin.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Pedidos vindos do app têm auth.uid(); o SQL Editor e a service role não,
  -- e por isso podem promover a primeira administradora.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Somente administradoras podem alterar o papel de um perfil';
  end if;
  return new;
end;
$$;

-- =========================================================================
-- Assinaturas (espelho do Stripe, escrito somente pelo webhook)
-- =========================================================================
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- Funções de autorização (usadas pelas políticas RLS)
-- =========================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_active_subscription(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- =========================================================================
-- Vídeos (metadados; o arquivo fica no Cloudflare Stream)
-- =========================================================================
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cloudflare_uid text unique,
  status public.video_status not null default 'aguardando_upload',
  duration_seconds integer,
  thumbnail_url text,
  category text,
  muscle_group text,
  level public.fitness_level,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger videos_touch before update on public.videos
  for each row execute function public.touch_updated_at();

-- =========================================================================
-- Exercícios e treinos
-- =========================================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  instructions text[] not null default '{}',
  video_id uuid references public.videos (id) on delete set null,
  muscle_group text,
  equipment text,
  level public.fitness_level not null default 'iniciante',
  created_at timestamptz not null default now()
);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  category text,
  goal public.fitness_goal,
  level public.fitness_level not null default 'iniciante',
  duration_minutes smallint,
  is_free boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workouts_touch before update on public.workouts
  for each row execute function public.touch_updated_at();

create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position smallint not null,
  sets smallint not null default 3 check (sets > 0),
  reps text,                       -- ex.: "12", "10-12", "até a falha"
  duration_seconds integer,        -- para exercícios por tempo
  rest_seconds integer not null default 45,
  notes text,
  unique (workout_id, position)
);

create index workout_exercises_workout_idx on public.workout_exercises (workout_id, position);

-- =========================================================================
-- Histórico e evolução da aluna
-- =========================================================================
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,
  completed_at timestamptz not null default now(),
  duration_seconds integer,
  feeling smallint check (feeling between 1 and 5),
  notes text
);

create index workout_logs_user_idx on public.workout_logs (user_id, completed_at desc);

create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_at date not null default current_date,
  weight_kg numeric(5, 2) check (weight_kg is null or weight_kg between 25 and 350),
  waist_cm numeric(5, 1),
  hip_cm numeric(5, 1),
  chest_cm numeric(5, 1),
  arm_cm numeric(5, 1),
  thigh_cm numeric(5, 1),
  body_fat_pct numeric(4, 1) check (body_fat_pct is null or body_fat_pct between 2 and 70),
  created_at timestamptz not null default now()
);

create index body_measurements_user_idx on public.body_measurements (user_id, measured_at desc);

-- =========================================================================
-- Nutrição
-- =========================================================================
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  meal_type public.meal_type,
  prep_minutes smallint,
  servings smallint default 1,
  calories integer,
  protein_g numeric(6, 1),
  carbs_g numeric(6, 1),
  fat_g numeric(6, 1),
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  tags text[] not null default '{}',
  is_free boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  goal public.fitness_goal,
  daily_calories integer,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references public.meal_plans (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  meal_type public.meal_type not null,
  recipe_id uuid references public.recipes (id) on delete set null,
  description text
);

-- =========================================================================
-- Desafios
-- =========================================================================
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_url text,
  duration_days smallint not null check (duration_days between 1 and 365),
  goal_description text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.challenge_days (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  day_number smallint not null,
  title text not null,
  task text,
  workout_id uuid references public.workouts (id) on delete set null,
  unique (challenge_id, day_number)
);

create table public.challenge_participants (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.challenge_checkins (
  challenge_id uuid not null,
  user_id uuid not null,
  day_number smallint not null,
  completed_at timestamptz not null default now(),
  primary key (challenge_id, user_id, day_number),
  foreign key (challenge_id, user_id)
    references public.challenge_participants (challenge_id, user_id) on delete cascade
);

-- =========================================================================
-- Favoritos, dispositivos e notificações
-- =========================================================================
create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type public.favorite_type not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

create table public.devices (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text check (platform in ('android', 'ios', 'web')),
  updated_at timestamptz not null default now()
);

create index devices_user_idx on public.devices (user_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience public.push_audience not null default 'todas',
  deep_link text,
  sent_by uuid references auth.users (id) on delete set null,
  sent_at timestamptz,
  recipients integer,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Views úteis
-- =========================================================================

-- Sequência de dias com treino e totais da aluna logada.
create or replace function public.my_stats()
returns table (
  total_workouts bigint,
  workouts_this_week bigint,
  current_streak integer,
  last_weight_kg numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with days as (
    select distinct (completed_at at time zone 'America/Sao_Paulo')::date as d
    from public.workout_logs
    where user_id = auth.uid()
  ),
  ordered as (
    -- datas consecutivas (em ordem decrescente) somadas ao número da linha geram o mesmo valor
    select d, d + (row_number() over (order by d desc))::int as grp
    from days
  ),
  streak as (
    select count(*)::int as n
    from ordered
    where grp = (
      select grp from ordered
      where d >= (now() at time zone 'America/Sao_Paulo')::date - 1
      order by d desc limit 1
    )
  )
  select
    (select count(*) from public.workout_logs where user_id = auth.uid()),
    (select count(*) from public.workout_logs
       where user_id = auth.uid()
         and completed_at >= date_trunc('week', now() at time zone 'America/Sao_Paulo')),
    coalesce((select n from streak), 0),
    (select weight_kg from public.body_measurements
       where user_id = auth.uid() and weight_kg is not null
       order by measured_at desc, created_at desc limit 1);
$$;

-- Indicadores para o painel administrativo.
create or replace function public.admin_dashboard()
returns table (
  total_users bigint,
  active_subscribers bigint,
  new_users_30d bigint,
  workouts_done_7d bigint,
  published_workouts bigint,
  videos_ready bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso negado';
  end if;
  return query select
    (select count(*) from public.profiles where role = 'aluna'),
    (select count(*) from public.subscriptions
       where status in ('active', 'trialing')
         and (current_period_end is null or current_period_end > now())),
    (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    (select count(*) from public.workout_logs where completed_at > now() - interval '7 days'),
    (select count(*) from public.workouts where published),
    (select count(*) from public.videos where status = 'pronto');
end;
$$;
