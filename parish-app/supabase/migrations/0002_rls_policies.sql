-- =========================================================================
-- Row Level Security — cada usuário só vê/edita o que deve.
-- Regra geral: leitura de conteúdo institucional é pública para autenticados;
-- escrita é restrita a staff/admin/pastor (e líderes, no escopo do seu grupo);
-- dados pessoais e financeiros só o próprio dono e a equipe da paróquia.
-- =========================================================================

alter table parishes enable row level security;
alter table profiles enable row level security;
alter table families enable row level security;
alter table family_members enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table financial_categories enable row level security;
alter table campaigns enable row level security;
alter table donations enable row level security;
alter table recurring_pledges enable row level security;
alter table media_content enable row level security;
alter table news_posts enable row level security;
alter table downloads enable row level security;
alter table bible_versions enable row level security;
alter table bible_books enable row level security;
alter table bible_verses enable row level security;
alter table daily_liturgy enable row level security;
alter table push_tokens enable row level security;
alter table notifications_log enable row level security;

-- Helpers: papel/paróquia do usuário autenticado atual.
--
-- security definer é essencial aqui: sem ele, a consulta a `profiles`
-- dentro da própria função dispara de novo as policies de RLS de
-- `profiles` (que chamam auth_role()/auth_parish_id()/is_staff()) e isso
-- gera recursão infinita ("stack depth limit exceeded") assim que
-- qualquer policy de staff é avaliada. Rodando como definer (dono da
-- função, sem RLS) a função lê a própria linha do usuário uma única vez,
-- sem reentrar nas policies.
create or replace function auth_role()
returns member_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_parish_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select parish_id from profiles where id = auth.uid();
$$;

create or replace function is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(auth_role() in ('staff', 'admin', 'pastor'), false);
$$;

-- ---------------------------------------------------------------------
-- parishes: leitura pública (necessário antes do login, ex. tela de
-- seleção de paróquia); escrita só admin da própria paróquia.
-- ---------------------------------------------------------------------
create policy "parishes_select_public" on parishes for select using (true);
create policy "parishes_update_admin" on parishes for update
  using (id = auth_parish_id() and auth_role() = 'admin');

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "profiles_select_self" on profiles for select
  using (id = auth.uid());
create policy "profiles_select_staff" on profiles for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "profiles_update_self" on profiles for update
  using (id = auth.uid());
create policy "profiles_update_staff" on profiles for update
  using (is_staff() and parish_id = auth_parish_id());
create policy "profiles_insert_self" on profiles for insert
  with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------
create policy "families_staff_all" on families for all
  using (is_staff() and parish_id = auth_parish_id());
create policy "family_members_staff_all" on family_members for all
  using (exists (
    select 1 from families f
    where f.id = family_members.family_id
      and f.parish_id = auth_parish_id() and is_staff()
  ));

-- ---------------------------------------------------------------------
-- groups / group_members
-- ---------------------------------------------------------------------
create policy "groups_select_parish" on groups for select
  using (parish_id = auth_parish_id());
create policy "groups_write_staff" on groups for insert
  with check (is_staff() and parish_id = auth_parish_id());
create policy "groups_update_staff_or_leader" on groups for update
  using (
    (is_staff() and parish_id = auth_parish_id())
    or leader_id = auth.uid()
  );
create policy "groups_delete_staff" on groups for delete
  using (is_staff() and parish_id = auth_parish_id());

create policy "group_members_select_parish" on group_members for select
  using (exists (
    select 1 from groups g where g.id = group_members.group_id
      and g.parish_id = auth_parish_id()
  ));
create policy "group_members_self_join" on group_members for insert
  with check (profile_id = auth.uid());
create policy "group_members_manage_staff_or_leader" on group_members for all
  using (
    is_staff()
    or exists (
      select 1 from groups g where g.id = group_members.group_id
        and g.leader_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- events / event_registrations
-- ---------------------------------------------------------------------
create policy "events_select_parish" on events for select
  using (parish_id = auth_parish_id());
create policy "events_write_staff_or_leader" on events for insert
  with check (
    parish_id = auth_parish_id()
    and (is_staff() or exists (
      select 1 from groups g where g.id = events.group_id and g.leader_id = auth.uid()
    ))
  );
create policy "events_update_staff_or_leader" on events for update
  using (
    is_staff()
    or exists (select 1 from groups g where g.id = events.group_id and g.leader_id = auth.uid())
  );
create policy "events_delete_staff" on events for delete
  using (is_staff() and parish_id = auth_parish_id());

create policy "event_reg_select_self_or_staff" on event_registrations for select
  using (profile_id = auth.uid() or is_staff());
create policy "event_reg_insert_self" on event_registrations for insert
  with check (profile_id = auth.uid());
create policy "event_reg_update_self_or_staff" on event_registrations for update
  using (profile_id = auth.uid() or is_staff());
create policy "event_reg_delete_self_or_staff" on event_registrations for delete
  using (profile_id = auth.uid() or is_staff());

-- ---------------------------------------------------------------------
-- financeiro: só o próprio doador vê a própria doação; staff vê tudo
-- da paróquia. Categorias e campanhas: leitura pública, escrita staff.
-- ---------------------------------------------------------------------
create policy "fin_categories_select" on financial_categories for select
  using (parish_id = auth_parish_id());
create policy "fin_categories_write_staff" on financial_categories for all
  using (is_staff() and parish_id = auth_parish_id());

create policy "campaigns_select" on campaigns for select
  using (parish_id = auth_parish_id());
create policy "campaigns_write_staff" on campaigns for all
  using (is_staff() and parish_id = auth_parish_id());

create policy "donations_select_self_or_staff" on donations for select
  using (profile_id = auth.uid() or is_staff());
create policy "donations_insert_self" on donations for insert
  with check (profile_id = auth.uid() or profile_id is null);
create policy "donations_update_staff" on donations for update
  using (is_staff() and parish_id = auth_parish_id());

create policy "pledges_select_self_or_staff" on recurring_pledges for select
  using (profile_id = auth.uid() or is_staff());
create policy "pledges_insert_self" on recurring_pledges for insert
  with check (profile_id = auth.uid());
create policy "pledges_update_self_or_staff" on recurring_pledges for update
  using (profile_id = auth.uid() or is_staff());

-- ---------------------------------------------------------------------
-- conteúdo (mídia, notícias, downloads): leitura pública para
-- autenticados da paróquia; escrita staff ou líder do grupo dono do
-- conteúdo.
-- ---------------------------------------------------------------------
create policy "media_select_parish" on media_content for select
  using (parish_id = auth_parish_id() and published_at is not null);
create policy "media_select_staff_drafts" on media_content for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "media_write_staff_or_leader" on media_content for insert
  with check (
    parish_id = auth_parish_id()
    and (is_staff() or exists (
      select 1 from groups g where g.id = media_content.group_id and g.leader_id = auth.uid()
    ))
  );
create policy "media_update_staff_or_author" on media_content for update
  using (is_staff() or author_id = auth.uid());
create policy "media_delete_staff" on media_content for delete
  using (is_staff() and parish_id = auth_parish_id());

create policy "news_select_parish" on news_posts for select
  using (parish_id = auth_parish_id() and published_at is not null);
create policy "news_select_staff_drafts" on news_posts for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "news_write_staff" on news_posts for all
  using (is_staff() and parish_id = auth_parish_id());

create policy "downloads_select_parish" on downloads for select
  using (parish_id = auth_parish_id());
create policy "downloads_write_staff_or_leader" on downloads for insert
  with check (
    parish_id = auth_parish_id()
    and (is_staff() or exists (
      select 1 from groups g where g.id = downloads.group_id and g.leader_id = auth.uid()
    ))
  );
create policy "downloads_delete_staff" on downloads for delete
  using (is_staff() and parish_id = auth_parish_id());

-- ---------------------------------------------------------------------
-- bíblia e liturgia: leitura pública (não é dado sensível), escrita
-- só via service_role (funções de sincronização).
-- ---------------------------------------------------------------------
create policy "bible_versions_select_all" on bible_versions for select using (true);
create policy "bible_books_select_all" on bible_books for select using (true);
create policy "bible_verses_select_all" on bible_verses for select using (true);
create policy "daily_liturgy_select_all" on daily_liturgy for select using (true);

-- ---------------------------------------------------------------------
-- notificações
-- ---------------------------------------------------------------------
create policy "push_tokens_self" on push_tokens for all
  using (profile_id = auth.uid());

create policy "notifications_log_select_staff" on notifications_log for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "notifications_log_insert_staff" on notifications_log for insert
  with check (is_staff() and parish_id = auth_parish_id());
