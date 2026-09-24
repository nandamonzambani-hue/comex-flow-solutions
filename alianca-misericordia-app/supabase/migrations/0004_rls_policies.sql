-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table profiles enable row level security;
alter table membership_levels enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table news_posts enable row level security;
alter table push_tokens enable row level security;
alter table notifications_log enable row level security;
alter table courses enable row level security;
alter table videos enable row level security;
alter table video_purchases enable row level security;
alter table video_progress enable row level security;
alter table downloads enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_attempts enable row level security;
alter table quiz_answers enable row level security;

-- ---------------------------------------------------------------------
-- Helpers (security definer — ver nota no app de paróquias sobre por que
-- isso é necessário pra evitar recursão infinita de RLS).
-- ---------------------------------------------------------------------
create or replace function auth_role()
returns member_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(auth_role() in ('staff', 'admin'), false);
$$;

-- Um usuário nunca deve conseguir se auto-promover a staff/admin ou mudar
-- sua própria cor/nível livremente após o cadastro inicial — mesma lógica
-- de trigger usada no app de paróquias, adaptada.
create or replace function enforce_profile_self_role_guard()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  jwt_role text := current_setting('request.jwt.claim.role', true);
begin
  if not (jwt_role in ('anon', 'authenticated')) then
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

-- ---------------------------------------------------------------------
-- profiles / membership_levels
-- ---------------------------------------------------------------------
create policy "profiles_select_self" on profiles for select using (id = auth.uid());
create policy "profiles_select_staff" on profiles for select using (is_staff());
create policy "profiles_update_self" on profiles for update using (id = auth.uid());
create policy "profiles_update_staff" on profiles for update using (is_staff());
create policy "profiles_insert_self" on profiles for insert with check (id = auth.uid());

create policy "membership_levels_select_active" on membership_levels for select
  using (is_active or is_staff());
create policy "membership_levels_write_staff" on membership_levels for all using (is_staff());

-- ---------------------------------------------------------------------
-- groups / group_members
-- ---------------------------------------------------------------------
create policy "groups_select_all" on groups for select using (true);
create policy "groups_write_staff" on groups for insert with check (is_staff());
create policy "groups_update_staff_or_leader" on groups for update
  using (is_staff() or leader_id = auth.uid());
create policy "groups_delete_staff" on groups for delete using (is_staff());

create policy "group_members_select_all" on group_members for select using (true);
create policy "group_members_self_join" on group_members for insert with check (profile_id = auth.uid());
create policy "group_members_manage_staff_or_leader" on group_members for all
  using (is_staff() or exists (select 1 from groups g where g.id = group_members.group_id and g.leader_id = auth.uid()));

-- ---------------------------------------------------------------------
-- events / event_registrations
-- ---------------------------------------------------------------------
create policy "events_select_all" on events for select using (true);
create policy "events_write_staff" on events for insert with check (is_staff());
create policy "events_update_staff" on events for update using (is_staff());
create policy "events_delete_staff" on events for delete using (is_staff());

create policy "event_reg_select_self_or_staff" on event_registrations for select
  using (profile_id = auth.uid() or is_staff());
create policy "event_reg_insert_self" on event_registrations for insert with check (profile_id = auth.uid());
create policy "event_reg_update_self_or_staff" on event_registrations for update
  using (profile_id = auth.uid() or is_staff());
create policy "event_reg_delete_self_or_staff" on event_registrations for delete
  using (profile_id = auth.uid() or is_staff());

-- ---------------------------------------------------------------------
-- news_posts
-- ---------------------------------------------------------------------
create policy "news_select_published" on news_posts for select using (published_at is not null);
create policy "news_select_staff_drafts" on news_posts for select using (is_staff());
create policy "news_write_staff" on news_posts for all using (is_staff());

-- ---------------------------------------------------------------------
-- push_tokens / notifications_log
-- ---------------------------------------------------------------------
create policy "push_tokens_self" on push_tokens for all using (profile_id = auth.uid());
create policy "notifications_log_select_staff" on notifications_log for select using (is_staff());
create policy "notifications_log_insert_staff" on notifications_log for insert with check (is_staff());

-- ---------------------------------------------------------------------
-- courses: leitura pública dos publicados; escrita só staff.
-- ---------------------------------------------------------------------
create policy "courses_select_published" on courses for select using (is_published or is_staff());
create policy "courses_write_staff" on courses for all using (is_staff());

-- ---------------------------------------------------------------------
-- videos: a linha só é visível pra quem tem direito de acesso —
-- público, cor/nível/grupo compatível, comprado, ou staff.
-- ---------------------------------------------------------------------
create or replace function can_access_video(v videos)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    v.is_published and (
      v.access_type = 'public'
      or (v.access_type = 'color' and exists (
           select 1 from profiles p where p.id = auth.uid() and p.evangelization_color = v.required_color))
      or (v.access_type = 'level' and exists (
           select 1 from profiles p where p.id = auth.uid() and p.membership_level_id = v.required_level_id))
      or (v.access_type = 'group' and exists (
           select 1 from group_members gm where gm.profile_id = auth.uid() and gm.group_id = v.required_group_id))
      or (v.access_type = 'paid' and exists (
           select 1 from video_purchases vp
           where vp.video_id = v.id and vp.profile_id = auth.uid() and vp.payment_status = 'completed'))
    )
    or is_staff();
$$;

create policy "videos_select_if_allowed" on videos for select using (can_access_video(videos));
create policy "videos_write_staff" on videos for insert with check (is_staff());
create policy "videos_update_staff" on videos for update using (is_staff());
create policy "videos_delete_staff" on videos for delete using (is_staff());

comment on function can_access_video is
  'Linhas de vídeo só aparecem pra quem já tem direito de acesso (ou staff) — não existe hoje uma "vitrine" mostrando vídeos bloqueados como preview; ver docs/CONTENT_GUIDE.md.';

-- ---------------------------------------------------------------------
-- video_purchases / video_progress
-- ---------------------------------------------------------------------
create policy "video_purchases_select_self_or_staff" on video_purchases for select
  using (profile_id = auth.uid() or is_staff());
create policy "video_purchases_insert_self" on video_purchases for insert with check (profile_id = auth.uid());
create policy "video_purchases_update_staff" on video_purchases for update using (is_staff());

create policy "video_progress_select_self_or_staff" on video_progress for select
  using (profile_id = auth.uid() or is_staff());
create policy "video_progress_upsert_self" on video_progress for insert with check (profile_id = auth.uid());
create policy "video_progress_update_self" on video_progress for update using (profile_id = auth.uid());

-- ---------------------------------------------------------------------
-- downloads
-- ---------------------------------------------------------------------
create policy "downloads_select_all" on downloads for select using (true);
create policy "downloads_write_staff" on downloads for all using (is_staff());

-- ---------------------------------------------------------------------
-- quizzes: só é visível se o vídeo associado também for (mesma regra de
-- acesso), pra não vazar perguntas de conteúdo bloqueado.
-- ---------------------------------------------------------------------
create policy "quizzes_select_if_video_allowed" on quizzes for select
  using (
    is_published and (
      video_id is null
      or exists (select 1 from videos v where v.id = quizzes.video_id and can_access_video(v))
    )
    or is_staff()
  );
create policy "quizzes_write_staff" on quizzes for all using (is_staff());

create policy "quiz_questions_select_if_quiz_allowed" on quiz_questions for select
  using (exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id) or is_staff());
create policy "quiz_questions_write_staff" on quiz_questions for all using (is_staff());

-- RLS é por linha, não por coluna — não dá pra esconder só a coluna
-- is_correct de quem não é staff mantendo a tabela base legível. Por
-- isso a tabela base fica restrita a staff, e o app usa a view abaixo
-- (sem is_correct) pra exibir as opções ao responder o quiz. O resultado
-- é sempre calculado no servidor via finalize_quiz_attempt(), nunca no
-- cliente, então a resposta correta nunca precisa chegar ao app.
create policy "quiz_options_select_staff" on quiz_options for select using (is_staff());
create policy "quiz_options_write_staff" on quiz_options for all using (is_staff());

-- security_invoker NÃO é setado (fica no padrão "false"): a view roda
-- com o privilégio de quem a criou (dono da migration), então ela
-- enxerga as linhas de quiz_options mesmo a tabela base sendo restrita a
-- staff — é assim que expomos as opções (sem is_correct) pra qualquer
-- pessoa responder o quiz sem violar a RLS da tabela base. Como a view
-- ignora a RLS da tabela base, ela replica manualmente a mesma regra de
-- acesso de "quizzes_select_if_video_allowed" no WHERE — senão vazaria
-- perguntas/opções de quizzes de conteúdo bloqueado pra qualquer pessoa
-- autenticada. can_access_video() é security definer e lê auth.uid()
-- internamente, então continua avaliando pelo usuário real que chamou,
-- não pelo dono da view.
create view quiz_options_public as
  select qo.id, qo.question_id, qo.option_text, qo.sort_order
  from quiz_options qo
  join quiz_questions qq on qq.id = qo.question_id
  join quizzes q on q.id = qq.quiz_id
  where q.is_published
    and (q.video_id is null or exists (select 1 from videos v where v.id = q.video_id and can_access_video(v)));

grant select on quiz_options_public to authenticated;

create policy "quiz_attempts_select_self_or_staff" on quiz_attempts for select
  using (profile_id = auth.uid() or is_staff());
create policy "quiz_attempts_insert_self" on quiz_attempts for insert with check (profile_id = auth.uid());
create policy "quiz_attempts_update_self" on quiz_attempts for update using (profile_id = auth.uid());

create policy "quiz_answers_select_self_or_staff" on quiz_answers for select
  using (is_staff() or exists (select 1 from quiz_attempts a where a.id = quiz_answers.attempt_id and a.profile_id = auth.uid()));
create policy "quiz_answers_insert_self" on quiz_answers for insert
  with check (exists (select 1 from quiz_attempts a where a.id = quiz_answers.attempt_id and a.profile_id = auth.uid()));
