-- =========================================================================
-- Camada SaaS: transforma o app de "uma paróquia" em produto que várias
-- paróquias assinam e personalizam (modelo de app único, estilo InChurch).
--
-- Conceitos novos:
--   - platform_admins: quem administra o NEGÓCIO (você), não uma paróquia
--     específica. É uma camada acima de profiles.role.
--   - subscription_plans: os planos que você vende.
--   - parishes ganha status de ciclo de vida (pendente/trial/ativa/
--     suspensa) e vínculo com plano/assinatura.
--   - join_code: código curto que a paróquia divulga pros fiéis
--     encontrarem ela no app sem precisar buscar por nome.
-- =========================================================================

-- ---------------------------------------------------------------------
-- Platform admins (equipe da empresa dona do produto)
-- ---------------------------------------------------------------------
create table platform_admins (
  profile_id uuid primary key references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table platform_admins is
  'Quem pode acessar o painel de dono da plataforma (aprovar paróquias, ver assinaturas de todas). Não é um role de profiles porque é ortogonal à paróquia da pessoa.';

-- ---------------------------------------------------------------------
-- Planos de assinatura
-- ---------------------------------------------------------------------
create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  price_amount numeric(10,2) not null,
  currency text not null default 'BRL',
  billing_interval recurrence_frequency not null default 'monthly',
  max_members integer, -- null = ilimitado
  trial_days integer not null default 14,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Paróquias: ciclo de vida comercial
-- ---------------------------------------------------------------------
create type parish_status as enum ('pending_approval', 'trial', 'active', 'past_due', 'suspended', 'cancelled');
create type subscription_status as enum ('none', 'trialing', 'authorized', 'paused', 'cancelled');

alter table parishes add column status parish_status not null default 'pending_approval';
alter table parishes add column plan_id uuid references subscription_plans(id) on delete set null;
alter table parishes add column subscription_status subscription_status not null default 'none';
alter table parishes add column external_subscription_id text; -- id da preapproval no Mercado Pago
alter table parishes add column trial_ends_at timestamptz;
alter table parishes add column join_code text unique;
alter table parishes add column created_by uuid references profiles(id) on delete set null;
alter table parishes add column approved_by uuid references profiles(id) on delete set null;
alter table parishes add column approved_at timestamptz;
alter table parishes add column contact_name text;
alter table parishes add column contact_phone text;

-- Gera um código curto e legível (ex: "ANA-7F2K") para a paróquia ser
-- encontrada/divulgada sem precisar buscar por nome.
create or replace function generate_join_code(parish_name text)
returns text
language plpgsql
as $$
declare
  prefix text;
  suffix text;
  candidate text;
begin
  prefix := upper(regexp_replace(coalesce(parish_name, 'IGR'), '[^a-zA-Z]', '', 'g'));
  prefix := left(coalesce(nullif(prefix, ''), 'IGR'), 4);
  loop
    suffix := upper(substr(md5(random()::text), 1, 4));
    candidate := prefix || '-' || suffix;
    exit when not exists (select 1 from parishes where join_code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function set_parish_join_code()
returns trigger
language plpgsql
as $$
begin
  if new.join_code is null then
    new.join_code := generate_join_code(new.name);
  end if;
  return new;
end;
$$;

create trigger trg_parishes_join_code
  before insert on parishes
  for each row execute function set_parish_join_code();

-- Log de eventos de assinatura (auditoria/depuração de webhooks)
create table parish_subscription_events (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  event_type text not null, -- created, authorized, paused, cancelled, payment_failed...
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Helper: é platform admin?
-- ---------------------------------------------------------------------
create or replace function is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from platform_admins where profile_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table platform_admins enable row level security;
alter table subscription_plans enable row level security;
alter table parish_subscription_events enable row level security;

create policy "platform_admins_select_self_or_admin" on platform_admins for select
  using (profile_id = auth.uid() or is_platform_admin());
create policy "platform_admins_manage_platform_admin" on platform_admins for all
  using (is_platform_admin());

create policy "subscription_plans_select_active_public" on subscription_plans for select
  using (is_active or is_platform_admin());
create policy "subscription_plans_manage_platform_admin" on subscription_plans for all
  using (is_platform_admin());

create policy "subscription_events_select_platform_admin" on parish_subscription_events for select
  using (is_platform_admin());
create policy "subscription_events_select_own_parish_admin" on parish_subscription_events for select
  using (parish_id = auth_parish_id() and is_staff());

-- --- parishes: novas regras --------------------------------------------
-- Leitura pública já existia ("parishes_select_public"). Ajustamos escrita:
drop policy if exists "parishes_update_admin" on parishes;

create policy "parishes_insert_self_service" on parishes for insert
  with check (true); -- qualquer usuário autenticado pode propor uma nova paróquia (fica pending_approval)

create policy "parishes_update_own_admin" on parishes for update
  using (id = auth_parish_id() and auth_role() in ('admin', 'pastor'))
  with check (id = auth_parish_id() and auth_role() in ('admin', 'pastor'));

create policy "parishes_manage_platform_admin" on parishes for all
  using (is_platform_admin())
  with check (is_platform_admin());

-- Protege as colunas de governança comercial (status, plano, assinatura,
-- aprovação): mesmo alguém com permissão de UPDATE/INSERT em `parishes`
-- (o próprio admin da paróquia, via policy acima) não consegue setar
-- essas colunas por fora do fluxo de aprovação/cobrança — a policy de
-- RLS só decide QUEM pode mexer na linha, não QUAIS colunas; isso aqui
-- garante que só platform admin (ou o backend via service_role) altera
-- status/plano/assinatura.
-- IMPORTANTE: dentro de uma função security definer, current_user vira o
-- DONO da função (quem a criou), não quem está chamando — então NÃO dá
-- pra usar current_user aqui para saber se é o backend/postgres chamando
-- (isso quase virou um bypass total sem querer). O sinal confiável é o
-- claim "role" do JWT que o PostgREST sempre injeta como GUC de sessão
-- (é o mesmo mecanismo do auth.role() do Supabase); esse GUC não é afetado
-- por security definer. Uma chamada direta via SQL (migration, Studio,
-- `supabase db push`) simplesmente não tem esse GUC setado, então já cai
-- fora da restrição — por isso restringimos so quando o papel é
-- explicitamente anon/authenticated.
create or replace function enforce_parish_governance_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  jwt_role text := current_setting('request.jwt.claim.role', true);
begin
  if not (jwt_role in ('anon', 'authenticated') and not is_platform_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending_approval';
    new.plan_id := null;
    new.subscription_status := 'none';
    new.external_subscription_id := null;
    new.trial_ends_at := null;
    new.approved_by := null;
    new.approved_at := null;
    new.created_by := auth.uid();
  elsif tg_op = 'UPDATE' then
    new.status := old.status;
    new.plan_id := old.plan_id;
    new.subscription_status := old.subscription_status;
    new.external_subscription_id := old.external_subscription_id;
    new.trial_ends_at := old.trial_ends_at;
    new.approved_by := old.approved_by;
    new.approved_at := old.approved_at;
    new.created_by := old.created_by;
    new.join_code := old.join_code;
  end if;

  return new;
end;
$$;

create trigger trg_parishes_enforce_governance
  before insert or update on parishes
  for each row execute function enforce_parish_governance_columns();

-- Com o cadastro self-service aberto pra qualquer pessoa, fica mais
-- importante fechar um buraco que já existia: as policies de
-- profiles_insert_self/profiles_update_self controlam QUEM pode
-- inserir/editar a própria linha, mas não QUAIS colunas — nada impedia
-- alguém de se auto-cadastrar (ou se auto-editar) com role='admin' e
-- assumir uma paróquia que não é dela. Este trigger fecha isso: ao
-- inserir/editar o PRÓPRIO perfil sem já ser staff, o papel é sempre
-- travado em 'member'.
create or replace function enforce_profile_self_role_guard()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  jwt_role text := current_setting('request.jwt.claim.role', true);
begin
  -- mesma ressalva do comentário acima: current_user não serve aqui
  -- porque a função é security definer. Usamos o claim do JWT. A flag
  -- app.bypass_role_guard só existe dentro da transação de uma chamada a
  -- claim_parish_admin() (ver abaixo) — nenhum cliente comum consegue
  -- setá-la por conta própria, porque o Supabase só expõe RPCs
  -- específicas, nunca SQL livre, pro papel authenticated.
  if not (jwt_role in ('anon', 'authenticated') and not is_platform_admin())
     or coalesce(current_setting('app.bypass_role_guard', true), 'false') = 'true' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.id = auth.uid() then
      new.role := 'member';
    end if;
  elsif tg_op = 'UPDATE' then
    if old.id = auth.uid() and not is_staff() then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_profiles_self_role_guard
  before insert or update on profiles
  for each row execute function enforce_profile_self_role_guard();

-- Platform admin também precisa enxergar perfis de outras paróquias (ex:
-- ver quem cadastrou uma paróquia pendente de aprovação, pra poder
-- contatar essa pessoa).
create policy "profiles_select_platform_admin" on profiles for select
  using (is_platform_admin());

comment on policy "parishes_insert_self_service" on parishes is
  'Cadastro self-service: qualquer autenticado pode propor uma paróquia; o trigger trg_parishes_enforce_governance força status=pending_approval e zera os campos de plano/assinatura, então a aprovação real só acontece via parishes_manage_platform_admin.';

-- ---------------------------------------------------------------------
-- claim_parish_admin: única forma de alguém virar admin de uma paróquia
-- recém-proposta por ela mesma. Faz suas próprias checagens (é dono da
-- proposta? a paróquia ainda está pendente? ainda não tem admin?) e só
-- então usa a flag de bypass pra conseguir setar role='admin' no próprio
-- perfil, driblando o trigger acima de forma controlada.
-- ---------------------------------------------------------------------
create or replace function claim_parish_admin(target_parish_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  my_profile profiles%rowtype;
  target_parish parishes%rowtype;
begin
  select * into my_profile from profiles where id = auth.uid();
  if my_profile.id is null then
    raise exception 'Perfil não encontrado. Crie sua conta antes de cadastrar uma paróquia.';
  end if;
  if my_profile.parish_id is not null then
    raise exception 'Você já pertence a uma paróquia.';
  end if;

  select * into target_parish from parishes where id = target_parish_id;
  if target_parish.id is null then
    raise exception 'Paróquia não encontrada.';
  end if;
  if target_parish.created_by is distinct from auth.uid() then
    raise exception 'Você só pode assumir a administração de uma paróquia que você mesmo cadastrou.';
  end if;
  if target_parish.status <> 'pending_approval' then
    raise exception 'Esta paróquia já foi processada e não pode mais ser reivindicada por este caminho.';
  end if;
  if exists (select 1 from profiles where parish_id = target_parish_id and role in ('admin', 'pastor')) then
    raise exception 'Esta paróquia já tem um administrador.';
  end if;

  perform set_config('app.bypass_role_guard', 'true', true); -- true = só dura esta transação
  update profiles set parish_id = target_parish_id, role = 'admin' where id = auth.uid();
end;
$$;

revoke all on function claim_parish_admin(uuid) from public;
grant execute on function claim_parish_admin(uuid) to authenticated;
