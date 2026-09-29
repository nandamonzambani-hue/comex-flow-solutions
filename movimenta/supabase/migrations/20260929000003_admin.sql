-- Lista de alunas para o painel (inclui o e-mail, que fica em auth.users).
-- Paginada e com busca por nome ou e-mail, para funcionar bem com 100 mil alunas.
create or replace function public.admin_list_students(
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
  total_count bigint
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
         coalesce(s.status, 'inactive'), s.current_period_end,
         (select count(*) from public.workout_logs l where l.user_id = pg.id),
         (select max(l.completed_at) from public.workout_logs l where l.user_id = pg.id),
         total.n
  from page pg
  cross join total
  left join public.subscriptions s on s.user_id = pg.id
  order by pg.created_at desc;
end;
$$;

revoke execute on function public.admin_list_students(text, integer, integer) from public, anon;
grant execute on function public.admin_list_students(text, integer, integer) to authenticated;

-- Índices para as consultas mais frequentes em escala.
create index if not exists profiles_created_idx on public.profiles (created_at desc);
