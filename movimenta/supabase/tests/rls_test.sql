-- Testes das regras de acesso. Cada bloco simula uma usuária.
\set ON_ERROR_STOP on
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@x.com', '{"full_name":"Admin"}'),
  ('00000000-0000-0000-0000-00000000000b', 'assinante@x.com', '{"full_name":"Bia"}'),
  ('00000000-0000-0000-0000-00000000000c', 'gratis@x.com', '{"full_name":"Carla"}');
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
insert into public.subscriptions (user_id, status, current_period_end)
  values ('00000000-0000-0000-0000-00000000000b', 'active', now() + interval '20 days');
insert into public.exercises (id, name) values ('10000000-0000-0000-0000-000000000001', 'Agachamento');
insert into public.workouts (id, title, published, is_free) values
  ('20000000-0000-0000-0000-000000000001', 'Treino grátis', true, true),
  ('20000000-0000-0000-0000-000000000002', 'Treino premium', true, false),
  ('20000000-0000-0000-0000-000000000003', 'Rascunho', false, false);
insert into public.workout_exercises (workout_id, exercise_id, position) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1);
insert into public.recipes (id, title, ingredients, is_free, published) values
  ('30000000-0000-0000-0000-000000000001', 'Receita grátis', '{ovo}', true, true),
  ('30000000-0000-0000-0000-000000000002', 'Receita premium', '{aveia}', false, true);

create function pg_temp.check(label text, ok boolean) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FALHOU: %', label; end if;
  raise notice 'ok: %', label;
end $$;

-- ---------------- aluna sem assinatura
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);
select pg_temp.check('gratuita vê 2 treinos publicados', (select count(*) from public.workouts) = 2);
select pg_temp.check('gratuita vê exercícios só do treino grátis', (select count(*) from public.workout_exercises) = 1);
select pg_temp.check('gratuita não é assinante', not public.has_active_subscription());
select pg_temp.check('gratuita lê só a receita grátis completa', (select count(*) from public.recipes) = 1);
select pg_temp.check('gratuita vê as 2 receitas na vitrine', (select count(*) from public.recipe_previews) = 2);
select pg_temp.check('gratuita vê só o próprio perfil', (select count(*) from public.profiles) = 1);
insert into public.workout_logs (user_id, workout_id) values ('00000000-0000-0000-0000-00000000000c', '20000000-0000-0000-0000-000000000001');
insert into public.body_measurements (user_id, weight_kg) values ('00000000-0000-0000-0000-00000000000c', 68.5);
select pg_temp.check('estatísticas próprias', (select total_workouts = 1 and current_streak = 1 and last_weight_kg = 68.5 from public.my_stats()));
do $$ begin
  update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000c';
  raise exception 'deveria ter bloqueado a promoção a admin';
exception when others then
  if sqlerrm like 'deveria%' then raise; end if;
  raise notice 'ok: aluna não consegue virar admin';
end $$;
do $$ begin
  insert into public.workout_logs (user_id) values ('00000000-0000-0000-0000-00000000000b');
  raise exception 'deveria ter bloqueado registro em nome de outra';
exception when others then
  if sqlerrm like 'deveria%' then raise; end if;
  raise notice 'ok: não registra treino em nome de outra aluna';
end $$;
do $$ begin
  insert into public.workouts (title) values ('invasão');
  raise exception 'deveria ter bloqueado';
exception when others then
  if sqlerrm like 'deveria%' then raise; end if;
  raise notice 'ok: aluna não cria treino';
end $$;
reset role;

-- ---------------- assinante
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.check('assinante lê as 2 receitas completas', (select count(*) from public.recipes) = 2);
select pg_temp.check('assinante vê exercícios dos 2 treinos', (select count(*) from public.workout_exercises) = 2);
select pg_temp.check('assinante é assinante', public.has_active_subscription());
select pg_temp.check('assinante não vê histórico de outra', (select count(*) from public.workout_logs) = 0);
reset role;

-- ---------------- admin
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
select pg_temp.check('admin vê os 3 treinos', (select count(*) from public.workouts) = 3);
select pg_temp.check('admin vê todos os perfis', (select count(*) from public.profiles) = 3);
select pg_temp.check('painel: 2 alunas, 1 assinante', (select total_users = 2 and active_subscribers = 1 from public.admin_dashboard()));
insert into public.workouts (title) values ('Novo treino pela admin');
reset role;

-- ---------------- assinatura expirada
update public.subscriptions set current_period_end = now() - interval '1 day';
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.check('assinatura vencida perde o premium', (select count(*) from public.workout_exercises) = 1);
reset role;
\echo TODOS OS TESTES PASSARAM
