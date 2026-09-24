-- =========================================================================
-- Conteúdo de estudo: cursos, vídeos com controle de acesso (público,
-- por grupo/cor/nível, ou pago), progresso de estudo por pessoa.
-- =========================================================================

-- Cursos/trilhas agrupam vídeos em sequência (ex: "Formação Vermelho —
-- Módulo 1"). Um vídeo pode existir sem curso (avulso).
create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Tipo de acesso ao vídeo:
--   public   -> qualquer pessoa cadastrada
--   color    -> só quem tem a cor de evangelização indicada em required_color
--   level    -> só quem tem o nível de vínculo indicado em required_level_id
--   group    -> só quem participa do grupo indicado em required_group_id
--   paid     -> precisa ter comprado (ver video_purchases); price_amount define o valor
create type video_access_type as enum ('public', 'color', 'level', 'group', 'paid');

create table videos (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete set null,
  title text not null,
  slug text unique not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  access_type video_access_type not null default 'public',
  required_color evangelization_color,
  required_level_id uuid references membership_levels(id) on delete set null,
  required_group_id uuid references groups(id) on delete set null,
  price_amount numeric(10,2),
  currency text not null default 'BRL',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  author_id uuid references profiles(id) on delete set null,
  views_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint videos_paid_needs_price check (access_type <> 'paid' or price_amount is not null),
  constraint videos_color_needs_value check (access_type <> 'color' or required_color is not null),
  constraint videos_level_needs_value check (access_type <> 'level' or required_level_id is not null),
  constraint videos_group_needs_value check (access_type <> 'group' or required_group_id is not null)
);

create index idx_videos_course on videos(course_id);
create index idx_videos_published on videos(is_published, published_at desc);

-- ---------------------------------------------------------------------
-- Compras de vídeo avulso (pagamento único, ex: Pix via Mercado Pago)
-- ---------------------------------------------------------------------
create type payment_status as enum ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
create type payment_method as enum ('pix', 'credit_card', 'debit_card', 'boleto', 'other');

create table video_purchases (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null default 'BRL',
  payment_method payment_method not null default 'pix',
  payment_status payment_status not null default 'pending',
  external_payment_id text,
  external_payment_provider text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique(video_id, profile_id)
);

create index idx_video_purchases_profile on video_purchases(profile_id);

-- ---------------------------------------------------------------------
-- Progresso de estudo: quanto cada pessoa já assistiu de cada vídeo.
-- ---------------------------------------------------------------------
create table video_progress (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  watched_seconds integer not null default 0,
  completed_at timestamptz,
  last_watched_at timestamptz not null default now(),
  unique(video_id, profile_id)
);

create index idx_video_progress_profile on video_progress(profile_id);

-- ---------------------------------------------------------------------
-- Downloads (materiais de apoio)
-- ---------------------------------------------------------------------
create table downloads (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references courses(id) on delete set null,
  title text not null,
  description text,
  file_url text not null,
  file_type text,
  file_size_bytes bigint,
  category text default 'geral',
  uploaded_by uuid references profiles(id) on delete set null,
  download_count integer not null default 0,
  created_at timestamptz not null default now()
);
