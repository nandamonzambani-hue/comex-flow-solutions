-- Assinaturas compradas dentro do app (App Store / Google Play), via RevenueCat.
-- Ficam separadas das assinaturas do site (Stripe, tabela subscriptions): a aluna
-- tem acesso premium se QUALQUER uma das duas estiver ativa.
create table public.store_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  store text not null,                 -- app_store | play_store | promotional | ...
  product_id text,
  status text not null default 'expired' check (status in ('active', 'trialing', 'expired')),
  current_period_end timestamptz,      -- null = sem expiração (ex.: vitalício/promocional)
  will_renew boolean not null default false,
  billing_issue boolean not null default false,
  is_sandbox boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.store_subscriptions enable row level security;

-- Somente leitura para a aluna; quem escreve é a Edge Function do RevenueCat (service role).
create policy "assinatura loja: dona ou admin lê" on public.store_subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

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
  ) or exists (
    select 1 from public.store_subscriptions s
    where s.user_id = uid
      and s.status in ('active', 'trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

-- Ids de todas as assinantes ativas (site + lojas). Usada pelo envio de push.
create or replace function public.active_subscriber_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select user_id from public.subscriptions
  where status in ('active', 'trialing') and (current_period_end is null or current_period_end > now())
  union
  select user_id from public.store_subscriptions
  where status in ('active', 'trialing') and (current_period_end is null or current_period_end > now());
$$;
revoke execute on function public.active_subscriber_ids() from public, anon, authenticated;
grant execute on function public.active_subscriber_ids() to service_role;

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
    (select count(*) from public.active_subscriber_ids()),
    (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    (select count(*) from public.workout_logs where completed_at > now() - interval '7 days'),
    (select count(*) from public.workouts where published),
    (select count(*) from public.videos where status = 'pronto');
end;
$$;

-- Lista de alunas: a coluna de assinatura passa a considerar também as lojas.
-- (o tipo de retorno mudou — nova coluna subscription_source —, por isso drop + create)
drop function public.admin_list_students(text, integer, integer);
create function public.admin_list_students(
  search text default null,
  page_size integer default 50,
  page_offset integer default 0
)
returns table (
  id uuid,
  full_name text,
  email text,
  goal public.fitness_goal,
  level public.fitness_level,
  created_at timestamptz,
  subscription_status text,
  current_period_end timestamptz,
  workouts_done bigint,
  last_workout_at timestamptz,
  total_count bigint,
  subscription_source text
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
  return query
  with filtered as (
    select p.id, p.full_name, u.email::text as email, p.goal, p.level, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'aluna'
      and (search is null or search = ''
           or p.full_name ilike '%' || search || '%'
           or u.email ilike '%' || search || '%')
  ),
  total as (select count(*) as n from filtered),
  page as (
    select * from filtered
    order by filtered.created_at desc
    limit least(greatest(page_size, 1), 200) offset greatest(page_offset, 0)
  )
  select pg.id, pg.full_name, pg.email, pg.goal, pg.level, pg.created_at,
         -- prioriza a assinatura ativa; se nenhuma estiver, mostra a do site
         case
           when st.status in ('active', 'trialing') and (st.current_period_end is null or st.current_period_end > now())
             then st.status
           else coalesce(s.status, st.status, 'inactive')
         end,
         case
           when st.status in ('active', 'trialing') and (st.current_period_end is null or st.current_period_end > now())
             then st.current_period_end
           else coalesce(s.current_period_end, st.current_period_end)
         end,
         (select count(*) from public.workout_logs l where l.user_id = pg.id),
         (select max(l.completed_at) from public.workout_logs l where l.user_id = pg.id),
         total.n,
         case
           when st.status in ('active', 'trialing') and (st.current_period_end is null or st.current_period_end > now())
             then st.store
           when s.user_id is not null then 'site'
           else st.store
         end
  from page pg
  cross join total
  left join public.subscriptions s on s.user_id = pg.id
  left join public.store_subscriptions st on st.user_id = pg.id
  order by pg.created_at desc;
end;
$$;

revoke execute on function public.admin_list_students(text, integer, integer) from public, anon;
grant execute on function public.admin_list_students(text, integer, integer) to authenticated;
