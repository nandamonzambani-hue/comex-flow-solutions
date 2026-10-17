-- =========================================================================
-- Hierarquia Matriz → Comunidades
--
-- Quem contrata a plataforma é a paróquia MATRIZ. Debaixo dela ficam as
-- comunidades (capelas) que respondem a ela. Regras:
--   - O que a Matriz publica (eventos, notícias, avisos, banners, vídeos,
--     downloads, quizzes, formulários, grupos, campanhas) aparece também
--     para os fiéis das comunidades — a não ser que a equipe desmarque
--     "share_with_communities" naquele item.
--   - O que uma comunidade publica fica só na comunidade: NÃO sobe para a
--     Matriz nem aparece para as outras comunidades.
--   - A equipe da Matriz administra as comunidades (vê membros, publica
--     e edita conteúdo nelas, nomeia a equipe local). A equipe de uma
--     comunidade só administra a própria comunidade.
--   - Comunidade não assina plano: herda status/plano da Matriz.
--
-- Um único nível: comunidade não tem sub-comunidade.
-- =========================================================================

create type parish_kind as enum ('matriz', 'comunidade');

alter table parishes add column kind parish_kind not null default 'matriz';
alter table parishes add column parent_parish_id uuid references parishes(id) on delete cascade;
alter table parishes add column patron_saint text;
alter table parishes add column mass_schedule text;
alter table parishes add constraint parishes_parent_not_self check (parent_parish_id is distinct from id);
alter table parishes add constraint parishes_kind_matches_parent check (
  (kind = 'matriz' and parent_parish_id is null) or (kind = 'comunidade' and parent_parish_id is not null)
);

create index idx_parishes_parent on parishes(parent_parish_id);

-- O pai de uma comunidade precisa ser uma Matriz (garante um nível só).
create or replace function enforce_parish_single_level()
returns trigger
language plpgsql
as $$
begin
  if new.parent_parish_id is not null and exists (
    select 1 from parishes p where p.id = new.parent_parish_id and p.kind <> 'matriz'
  ) then
    raise exception 'Uma comunidade só pode estar ligada a uma paróquia Matriz.';
  end if;
  return new;
end;
$$;

create trigger trg_parishes_single_level
  before insert or update of parent_parish_id on parishes
  for each row execute function enforce_parish_single_level();

-- ---------------------------------------------------------------------
-- Helpers de visibilidade/gestão (security definer pelo mesmo motivo
-- de auth_role()/auth_parish_id(): evitar recursão de RLS).
-- ---------------------------------------------------------------------
create or replace function auth_parent_parish_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select p.parent_parish_id from parishes p where p.id = auth_parish_id();
$$;

-- O fiel enxerga o conteúdo da própria paróquia/comunidade e, se for de
-- uma comunidade, o conteúdo compartilhado da Matriz.
create or replace function can_view_parish(p_parish_id uuid, p_shared boolean default true)
returns boolean
language sql stable security definer set search_path = public
as $$
  select p_parish_id is not null and (
    p_parish_id = auth_parish_id()
    or (coalesce(p_shared, true) and p_parish_id = auth_parent_parish_id())
  );
$$;

-- Equipe com poder de gestão sobre a paróquia informada: a própria, ou
-- (se for equipe da Matriz) qualquer comunidade dela.
create or replace function is_staff_for(p_parish_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select is_staff() and p_parish_id is not null and (
    p_parish_id = auth_parish_id()
    or exists (select 1 from parishes c where c.id = p_parish_id and c.parent_parish_id = auth_parish_id())
  );
$$;

-- IDs que a equipe logada administra (usado pelo painel pra montar o
-- seletor "Publicar em").
create or replace function managed_parish_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select id from parishes
  where is_staff() and (id = auth_parish_id() or parent_parish_id = auth_parish_id());
$$;

grant execute on function auth_parent_parish_id() to authenticated;
grant execute on function can_view_parish(uuid, boolean) to authenticated;
grant execute on function is_staff_for(uuid) to authenticated;
grant execute on function managed_parish_ids() to authenticated;

-- ---------------------------------------------------------------------
-- Flag de compartilhamento nos conteúdos
-- ---------------------------------------------------------------------
alter table events add column share_with_communities boolean not null default true;
alter table news_posts add column share_with_communities boolean not null default true;
alter table media_content add column share_with_communities boolean not null default true;
alter table downloads add column share_with_communities boolean not null default true;
alter table banners add column share_with_communities boolean not null default true;
alter table announcements add column share_with_communities boolean not null default true;
alter table quizzes add column share_with_communities boolean not null default true;
alter table groups add column share_with_communities boolean not null default true;
alter table campaigns add column share_with_communities boolean not null default true;

-- ---------------------------------------------------------------------
-- Governança: comunidades herdam status/plano da Matriz
-- ---------------------------------------------------------------------
-- O trigger de governança (0006) zera status/plano de qualquer paróquia
-- criada por um usuário comum. create_community() precisa criar a
-- comunidade já com o status da Matriz, então ganha uma flag de bypass
-- que só existe dentro da transação dela (mesmo padrão de
-- app.bypass_role_guard em claim_parish_admin).
create or replace function enforce_parish_governance_columns()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  -- coalesce: fora do PostgREST (SQL Editor, seed, migration) o GUC vem
  -- nulo/vazio; sem o coalesce a comparação dava NULL e a restrição era
  -- aplicada por engano (o seed criava paróquias como pending_approval).
  jwt_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
begin
  if not (jwt_role in ('anon', 'authenticated') and not is_platform_admin())
     or coalesce(current_setting('app.bypass_governance', true), 'false') = 'true' then
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
    new.kind := 'matriz';
    new.parent_parish_id := null;
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
    new.kind := old.kind;
    new.parent_parish_id := old.parent_parish_id;
  end if;

  return new;
end;
$$;

-- Quando o status/plano da Matriz muda (aprovação, inadimplência,
-- cancelamento), as comunidades acompanham.
create or replace function cascade_matriz_status_to_communities()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform set_config('app.bypass_governance', 'true', true);
  update parishes
  set status = new.status,
      plan_id = new.plan_id,
      subscription_status = new.subscription_status,
      trial_ends_at = new.trial_ends_at
  where parent_parish_id = new.id;
  perform set_config('app.bypass_governance', 'false', true);
  return new;
end;
$$;

create trigger trg_parishes_cascade_status
  after update of status, plan_id, subscription_status, trial_ends_at on parishes
  for each row
  when (new.kind = 'matriz')
  execute function cascade_matriz_status_to_communities();

-- Admin/pároco da Matriz cria uma comunidade debaixo dela.
create or replace function create_community(
  p_name text,
  p_address text default null,
  p_city text default null,
  p_state text default null,
  p_patron_saint text default null,
  p_mass_schedule text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_matriz parishes%rowtype;
  v_id uuid;
  v_slug text;
begin
  if coalesce(auth_role() in ('admin', 'pastor'), false) is not true then
    raise exception 'Apenas o admin ou o pároco da Matriz pode criar comunidades.';
  end if;

  select * into v_matriz from parishes where id = auth_parish_id();
  if v_matriz.id is null or v_matriz.kind <> 'matriz' then
    raise exception 'Somente uma paróquia Matriz pode ter comunidades.';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'Informe o nome da comunidade.';
  end if;

  v_slug := v_matriz.slug || '-' || trim(both '-' from lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g')));
  while exists (select 1 from parishes where slug = v_slug) loop
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 3);
  end loop;

  perform set_config('app.bypass_governance', 'true', true);
  insert into parishes (
    name, slug, kind, parent_parish_id, address, city, state, patron_saint, mass_schedule,
    phone, email, logo_url, primary_color, secondary_color, timezone,
    status, plan_id, subscription_status, trial_ends_at, created_by
  ) values (
    trim(p_name), v_slug, 'comunidade', v_matriz.id,
    coalesce(p_address, v_matriz.address), coalesce(p_city, v_matriz.city), coalesce(p_state, v_matriz.state),
    p_patron_saint, p_mass_schedule,
    v_matriz.phone, v_matriz.email, v_matriz.logo_url, v_matriz.primary_color, v_matriz.secondary_color, v_matriz.timezone,
    v_matriz.status, v_matriz.plan_id, v_matriz.subscription_status, v_matriz.trial_ends_at, auth.uid()
  )
  returning id into v_id;
  perform set_config('app.bypass_governance', 'false', true);

  return v_id;
end;
$$;

revoke all on function create_community(text, text, text, text, text, text) from public;
grant execute on function create_community(text, text, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Policies: leitura herdada da Matriz, gestão pela Matriz
-- ---------------------------------------------------------------------

-- parishes
drop policy if exists "parishes_update_own_admin" on parishes;
create policy "parishes_update_own_admin" on parishes for update
  using (is_staff_for(id) and auth_role() in ('admin', 'pastor'))
  with check (is_staff_for(id) and auth_role() in ('admin', 'pastor'));

-- profiles: equipe da Matriz enxerga e gerencia membros das comunidades
drop policy if exists "profiles_select_staff" on profiles;
create policy "profiles_select_staff" on profiles for select
  using (is_staff_for(parish_id));
drop policy if exists "profiles_update_staff" on profiles;
create policy "profiles_update_staff" on profiles for update
  using (is_staff_for(parish_id));

-- groups
drop policy if exists "groups_select_parish" on groups;
create policy "groups_select_parish" on groups for select
  using (can_view_parish(parish_id, share_with_communities) or is_staff_for(parish_id));
drop policy if exists "groups_write_staff" on groups;
create policy "groups_write_staff" on groups for insert
  with check (is_staff_for(parish_id));
drop policy if exists "groups_update_staff_or_leader" on groups;
create policy "groups_update_staff_or_leader" on groups for update
  using (is_staff_for(parish_id) or leader_id = auth.uid());
drop policy if exists "groups_delete_staff" on groups;
create policy "groups_delete_staff" on groups for delete
  using (is_staff_for(parish_id));

drop policy if exists "group_members_select_parish" on group_members;
create policy "group_members_select_parish" on group_members for select
  using (exists (
    select 1 from groups g where g.id = group_members.group_id
      and (can_view_parish(g.parish_id, g.share_with_communities) or is_staff_for(g.parish_id))
  ));

-- events
drop policy if exists "events_select_parish" on events;
create policy "events_select_parish" on events for select
  using (can_view_parish(parish_id, share_with_communities) or is_staff_for(parish_id));
drop policy if exists "events_write_staff_or_leader" on events;
create policy "events_write_staff_or_leader" on events for insert
  with check (
    is_staff_for(parish_id)
    or (parish_id = auth_parish_id() and exists (
      select 1 from groups g where g.id = events.group_id and g.leader_id = auth.uid()
    ))
  );
drop policy if exists "events_update_staff_or_leader" on events;
create policy "events_update_staff_or_leader" on events for update
  using (
    is_staff_for(parish_id)
    or exists (select 1 from groups g where g.id = events.group_id and g.leader_id = auth.uid())
  );
drop policy if exists "events_delete_staff" on events;
create policy "events_delete_staff" on events for delete
  using (is_staff_for(parish_id));

-- campaigns
drop policy if exists "campaigns_select" on campaigns;
create policy "campaigns_select" on campaigns for select
  using (can_view_parish(parish_id, share_with_communities) or is_staff_for(parish_id));
drop policy if exists "campaigns_write_staff" on campaigns;
create policy "campaigns_write_staff" on campaigns for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

-- financeiro: equipe da Matriz vê as doações das comunidades
drop policy if exists "donations_select_self_or_staff" on donations;
create policy "donations_select_self_or_staff" on donations for select
  using (profile_id = auth.uid() or is_staff_for(parish_id));

-- media_content
drop policy if exists "media_select_parish" on media_content;
create policy "media_select_parish" on media_content for select
  using (can_view_parish(parish_id, share_with_communities) and published_at is not null);
drop policy if exists "media_select_staff_drafts" on media_content;
create policy "media_select_staff_drafts" on media_content for select
  using (is_staff_for(parish_id));
drop policy if exists "media_write_staff_or_leader" on media_content;
create policy "media_write_staff_or_leader" on media_content for insert
  with check (
    is_staff_for(parish_id)
    or (parish_id = auth_parish_id() and exists (
      select 1 from groups g where g.id = media_content.group_id and g.leader_id = auth.uid()
    ))
  );
drop policy if exists "media_update_staff_or_author" on media_content;
create policy "media_update_staff_or_author" on media_content for update
  using (is_staff_for(parish_id) or author_id = auth.uid());
drop policy if exists "media_delete_staff" on media_content;
create policy "media_delete_staff" on media_content for delete
  using (is_staff_for(parish_id));

-- news_posts
drop policy if exists "news_select_parish" on news_posts;
create policy "news_select_parish" on news_posts for select
  using (can_view_parish(parish_id, share_with_communities) and published_at is not null);
drop policy if exists "news_select_staff_drafts" on news_posts;
create policy "news_select_staff_drafts" on news_posts for select
  using (is_staff_for(parish_id));
drop policy if exists "news_write_staff" on news_posts;
create policy "news_write_staff" on news_posts for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

-- downloads
drop policy if exists "downloads_select_parish" on downloads;
create policy "downloads_select_parish" on downloads for select
  using (can_view_parish(parish_id, share_with_communities) or is_staff_for(parish_id));
drop policy if exists "downloads_write_staff_or_leader" on downloads;
create policy "downloads_write_staff_or_leader" on downloads for insert
  with check (
    is_staff_for(parish_id)
    or (parish_id = auth_parish_id() and exists (
      select 1 from groups g where g.id = downloads.group_id and g.leader_id = auth.uid()
    ))
  );
drop policy if exists "downloads_delete_staff" on downloads;
create policy "downloads_delete_staff" on downloads for delete
  using (is_staff_for(parish_id));

-- banners
drop policy if exists "banners_select_parish" on banners;
create policy "banners_select_parish" on banners for select
  using (
    can_view_parish(parish_id, share_with_communities)
    and is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
drop policy if exists "banners_select_staff" on banners;
create policy "banners_select_staff" on banners for select
  using (is_staff_for(parish_id));
drop policy if exists "banners_write_staff" on banners;
create policy "banners_write_staff" on banners for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

-- announcements
drop policy if exists "announcements_select_parish" on announcements;
create policy "announcements_select_parish" on announcements for select
  using (
    can_view_parish(parish_id, share_with_communities)
    and is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );
drop policy if exists "announcements_select_staff" on announcements;
create policy "announcements_select_staff" on announcements for select
  using (is_staff_for(parish_id));
drop policy if exists "announcements_write_staff" on announcements;
create policy "announcements_write_staff" on announcements for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

-- quizzes
drop policy if exists "quizzes_select_parish" on quizzes;
create policy "quizzes_select_parish" on quizzes for select
  using (can_view_parish(parish_id, share_with_communities) and is_published);
drop policy if exists "quizzes_select_staff" on quizzes;
create policy "quizzes_select_staff" on quizzes for select
  using (is_staff_for(parish_id));
drop policy if exists "quizzes_write_staff" on quizzes;
create policy "quizzes_write_staff" on quizzes for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

drop policy if exists "quiz_questions_select_if_quiz_visible" on quiz_questions;
create policy "quiz_questions_select_if_quiz_visible" on quiz_questions for select
  using (exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id
      and ((q.is_published and can_view_parish(q.parish_id, q.share_with_communities)) or is_staff_for(q.parish_id))
  ));
drop policy if exists "quiz_questions_write_staff" on quiz_questions;
create policy "quiz_questions_write_staff" on quiz_questions for all
  using (exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and is_staff_for(q.parish_id)))
  with check (exists (select 1 from quizzes q where q.id = quiz_questions.quiz_id and is_staff_for(q.parish_id)));

drop policy if exists "quiz_options_select_staff" on quiz_options;
create policy "quiz_options_select_staff" on quiz_options for select
  using (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and is_staff_for(q.parish_id)
  ));
drop policy if exists "quiz_options_write_staff" on quiz_options;
create policy "quiz_options_write_staff" on quiz_options for all
  using (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and is_staff_for(q.parish_id)
  ))
  with check (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and is_staff_for(q.parish_id)
  ));

create or replace view quiz_options_public as
  select qo.id, qo.question_id, qo.option_text, qo.sort_order
  from quiz_options qo
  join quiz_questions qq on qq.id = qo.question_id
  join quizzes q on q.id = qq.quiz_id
  where q.is_published and can_view_parish(q.parish_id, q.share_with_communities);

-- notificações: Matriz consulta o histórico das comunidades também
drop policy if exists "notifications_log_select_staff" on notifications_log;
create policy "notifications_log_select_staff" on notifications_log for select
  using (is_staff_for(parish_id));
drop policy if exists "notifications_log_insert_staff" on notifications_log;
create policy "notifications_log_insert_staff" on notifications_log for insert
  with check (is_staff_for(parish_id));

comment on column parishes.parent_parish_id is
  'Matriz à qual esta comunidade responde. Null = é uma Matriz (quem assina a plataforma).';
