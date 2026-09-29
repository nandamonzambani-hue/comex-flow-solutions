-- Movimenta — Row Level Security
-- Regra geral:
--   * a aluna só lê e escreve os próprios dados;
--   * conteúdo publicado é visível para usuárias logadas (o detalhe premium e o
--     vídeo exigem assinatura ativa, conferida também na Edge Function stream-token);
--   * administradoras podem tudo.

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.videos enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.body_measurements enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_days enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.challenge_checkins enable row level security;
alter table public.favorites enable row level security;
alter table public.devices enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------- perfis
create policy "perfil: dona ou admin lê" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "perfil: dona ou admin atualiza" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- assinaturas
-- Somente leitura para a aluna; quem escreve é o webhook do Stripe (service role).
create policy "assinatura: dona ou admin lê" on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------- catálogo
-- Metadados de vídeo visíveis a quem está logada; o arquivo em si exige token assinado.
create policy "videos: logadas leem prontos" on public.videos
  for select to authenticated using (status = 'pronto' or public.is_admin());
create policy "videos: admin escreve" on public.videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "exercicios: logadas leem" on public.exercises
  for select to authenticated using (true);
create policy "exercicios: admin escreve" on public.exercises
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "treinos: publicados ou admin" on public.workouts
  for select to authenticated using (published or public.is_admin());
create policy "treinos: admin escreve" on public.workouts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- A lista de exercícios de um treino premium só aparece para assinantes.
create policy "treino_exercicios: gratuito, assinante ou admin" on public.workout_exercises
  for select to authenticated using (
    public.is_admin()
    or exists (
      select 1 from public.workouts w
      where w.id = workout_id
        and w.published
        and (w.is_free or public.has_active_subscription())
    )
  );
create policy "treino_exercicios: admin escreve" on public.workout_exercises
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Receita completa (ingredientes e preparo): gratuita, assinante ou admin.
create policy "receitas: gratuitas, assinante ou admin" on public.recipes
  for select to authenticated using (
    (published and (is_free or public.has_active_subscription())) or public.is_admin()
  );
create policy "receitas: admin escreve" on public.recipes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "cardapios: assinante ou admin" on public.meal_plans
  for select to authenticated using ((published and public.has_active_subscription()) or public.is_admin());
create policy "cardapios: admin escreve" on public.meal_plans
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "itens_cardapio: assinante ou admin" on public.meal_plan_items
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from public.meal_plans m
               where m.id = meal_plan_id and m.published and public.has_active_subscription())
  );
create policy "itens_cardapio: admin escreve" on public.meal_plan_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "desafios: publicados ou admin" on public.challenges
  for select to authenticated using (published or public.is_admin());
create policy "desafios: admin escreve" on public.challenges
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "dias_desafio: logadas leem" on public.challenge_days
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from public.challenges c where c.id = challenge_id and c.published)
  );
create policy "dias_desafio: admin escreve" on public.challenge_days
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Vitrine de receitas: só os campos públicos, para todas as logadas verem o catálogo
-- (inclusive as premium, com cadeado). A view roda com os privilégios do dono,
-- por isso expõe apenas colunas não sensíveis.
create view public.recipe_previews as
  select id, title, description, image_url, meal_type, prep_minutes, servings,
         calories, protein_g, carbs_g, fat_g, tags, is_free
  from public.recipes
  where published;
revoke all on public.recipe_previews from anon, public;
grant select on public.recipe_previews to authenticated;

-- ---------------------------------------------------------------- dados da aluna
create policy "participacao: dona" on public.challenge_participants
  for all to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() and public.has_active_subscription());

create policy "checkin: dona" on public.challenge_checkins
  for all to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "historico: dona" on public.workout_logs
  for all to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "medidas: dona" on public.body_measurements
  for all to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "favoritos: dona" on public.favorites
  for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "dispositivos: dona" on public.devices
  for all to authenticated using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy "notificacoes: admin" on public.notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- funções
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_active_subscription(uuid) to authenticated;
grant execute on function public.my_stats() to authenticated;
grant execute on function public.admin_dashboard() to authenticated;

-- ---------------------------------------------------------------- storage
-- Imagens (capas de treino, receitas, avatares) ficam no Storage do Supabase;
-- vídeos NÃO — eles vão para o Cloudflare Stream.
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true), ('avatares', 'avatares', true)
on conflict (id) do nothing;

create policy "imagens: leitura pública" on storage.objects
  for select using (bucket_id in ('imagens', 'avatares'));
create policy "imagens: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'imagens' and public.is_admin());
create policy "imagens: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'imagens' and public.is_admin());
create policy "imagens: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'imagens' and public.is_admin());
create policy "avatar: dona envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar: dona altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);
