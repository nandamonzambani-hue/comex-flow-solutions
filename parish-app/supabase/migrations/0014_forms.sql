-- =========================================================================
-- Formulários / fichas de inscrição (Secretaria de Evangelização)
--
-- Cobre o que a inChurch não tem e a Secretaria pediu:
--   - divisão por seções (cada seção com título, texto e imagem);
--   - lista suspensa longa (tipo 'dropdown', com busca no app e colagem
--     de opções em lote no painel);
--   - lógica "se responder X, ir para a seção Y" (go_to_section_id na
--     opção) ou "enviar o formulário" (submit_form);
--   - incluir imagem (na seção, na pergunta e em cada opção);
--   - modo quiz: opções corretas + pontos por pergunta, nota calculada
--     no servidor (o fiel nunca recebe o gabarito).
--
-- Formulário da Matriz aparece também nas comunidades (share_with_communities),
-- igual aos demais conteúdos (ver 0013).
-- =========================================================================

create type form_question_type as enum (
  'short_text', 'long_text', 'single_choice', 'multiple_choice', 'dropdown',
  'date', 'number', 'phone', 'email', 'image_upload', 'file_upload'
);

create table forms (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  event_id uuid references events(id) on delete set null, -- ficha de inscrição de um evento (opcional)
  title text not null,
  description text,
  cover_image_url text,
  category text default 'inscricao', -- inscricao, pesquisa, quiz, cadastro...
  is_quiz boolean not null default false,
  show_score_to_respondent boolean not null default true,
  allow_multiple_responses boolean not null default false,
  is_published boolean not null default false,
  share_with_communities boolean not null default true,
  opens_at timestamptz,
  closes_at timestamptz,
  confirmation_message text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_forms_parish on forms(parish_id, is_published);

create table form_sections (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references forms(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  -- Para onde ir ao terminar esta seção quando nenhuma opção escolhida
  -- define desvio: null = próxima seção pela ordem; outra seção = pular.
  next_section_id uuid references form_sections(id) on delete set null,
  submit_after boolean not null default false, -- true = terminar o formulário após esta seção
  created_at timestamptz not null default now()
);

create index idx_form_sections_form on form_sections(form_id, sort_order);

create table form_questions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references forms(id) on delete cascade,
  section_id uuid not null references form_sections(id) on delete cascade,
  question_type form_question_type not null default 'short_text',
  label text not null,
  help_text text,
  image_url text,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  points integer not null default 0, -- modo quiz
  created_at timestamptz not null default now()
);

create index idx_form_questions_section on form_questions(section_id, sort_order);

create table form_question_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid not null references form_questions(id) on delete cascade,
  label text not null,
  image_url text,
  sort_order integer not null default 0,
  is_correct boolean not null default false, -- modo quiz (nunca exposto ao fiel)
  go_to_section_id uuid references form_sections(id) on delete set null,
  submit_form boolean not null default false
);

create index idx_form_options_question on form_question_options(question_id, sort_order);

create table form_responses (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid not null references forms(id) on delete cascade,
  parish_id uuid references parishes(id) on delete set null, -- paróquia/comunidade de quem respondeu
  profile_id uuid references profiles(id) on delete set null,
  respondent_name text,
  respondent_email text,
  respondent_phone text,
  score integer,
  max_score integer,
  submitted_at timestamptz not null default now()
);

create index idx_form_responses_form on form_responses(form_id, submitted_at desc);

create table form_answers (
  id uuid primary key default uuid_generate_v4(),
  response_id uuid not null references form_responses(id) on delete cascade,
  question_id uuid not null references form_questions(id) on delete cascade,
  text_value text,
  option_ids uuid[] not null default '{}',
  file_url text,
  is_correct boolean,
  points_awarded integer not null default 0,
  unique (response_id, question_id)
);

create trigger trg_forms_updated_at
  before update on forms
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Envio: uma única RPC grava resposta + respostas e calcula a nota.
-- p_answers = [{ "question_id": "...", "text": "...", "option_ids": ["..."], "file_url": "..." }]
-- ---------------------------------------------------------------------
create or replace function submit_form_response(
  p_form_id uuid,
  p_answers jsonb,
  p_name text default null,
  p_email text default null,
  p_phone text default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_form forms%rowtype;
  v_profile profiles%rowtype;
  v_response_id uuid;
  v_item jsonb;
  v_question form_questions%rowtype;
  v_selected uuid[];
  v_correct uuid[];
  v_is_correct boolean;
  v_points integer;
  v_score integer := 0;
  v_max integer := 0;
begin
  select * into v_form from forms where id = p_form_id;
  if v_form.id is null or not v_form.is_published or not can_view_parish(v_form.parish_id, v_form.share_with_communities) then
    raise exception 'Formulário não encontrado.';
  end if;
  if (v_form.opens_at is not null and v_form.opens_at > now())
     or (v_form.closes_at is not null and v_form.closes_at < now()) then
    raise exception 'Este formulário não está recebendo respostas agora.';
  end if;

  select * into v_profile from profiles where id = auth.uid();

  if not v_form.allow_multiple_responses and exists (
    select 1 from form_responses where form_id = p_form_id and profile_id = auth.uid()
  ) then
    raise exception 'Você já respondeu este formulário.';
  end if;

  insert into form_responses (form_id, parish_id, profile_id, respondent_name, respondent_email, respondent_phone)
  values (
    p_form_id, v_profile.parish_id, auth.uid(),
    coalesce(nullif(trim(p_name), ''), v_profile.full_name),
    coalesce(nullif(trim(p_email), ''), v_profile.email),
    coalesce(nullif(trim(p_phone), ''), v_profile.phone)
  )
  returning id into v_response_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) loop
    select * into v_question from form_questions
      where id = (v_item->>'question_id')::uuid and form_id = p_form_id;
    continue when v_question.id is null;

    v_selected := coalesce(
      (select array_agg(value::uuid) from jsonb_array_elements_text(
        case when jsonb_typeof(v_item->'option_ids') = 'array' then v_item->'option_ids' else '[]'::jsonb end
      )),
      '{}'
    );
    -- só aceita opções que pertencem à pergunta
    v_selected := coalesce(
      (select array_agg(o.id) from form_question_options o where o.question_id = v_question.id and o.id = any(v_selected)),
      '{}'
    );

    v_is_correct := null;
    v_points := 0;
    if v_form.is_quiz and v_question.question_type in ('single_choice', 'multiple_choice', 'dropdown') then
      select coalesce(array_agg(id order by id), '{}') into v_correct
        from form_question_options where question_id = v_question.id and is_correct;
      v_is_correct := cardinality(v_correct) > 0
        and (select coalesce(array_agg(x order by x), '{}') from unnest(v_selected) x) = v_correct;
      v_points := case when v_is_correct then v_question.points else 0 end;
    end if;

    insert into form_answers (response_id, question_id, text_value, option_ids, file_url, is_correct, points_awarded)
    values (v_response_id, v_question.id, v_item->>'text', v_selected, v_item->>'file_url', v_is_correct, v_points)
    on conflict (response_id, question_id) do nothing;
  end loop;

  if v_form.is_quiz then
    select coalesce(sum(points), 0) into v_max from form_questions
      where form_id = p_form_id and question_type in ('single_choice', 'multiple_choice', 'dropdown');
    select coalesce(sum(points_awarded), 0) into v_score from form_answers where response_id = v_response_id;
    update form_responses set score = v_score, max_score = v_max where id = v_response_id;
  end if;

  return jsonb_build_object(
    'response_id', v_response_id,
    'score', case when v_form.is_quiz and v_form.show_score_to_respondent then v_score end,
    'max_score', case when v_form.is_quiz and v_form.show_score_to_respondent then v_max end,
    'message', v_form.confirmation_message
  );
end;
$$;

revoke all on function submit_form_response(uuid, jsonb, text, text, text) from public;
grant execute on function submit_form_response(uuid, jsonb, text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table forms enable row level security;
alter table form_sections enable row level security;
alter table form_questions enable row level security;
alter table form_question_options enable row level security;
alter table form_responses enable row level security;
alter table form_answers enable row level security;

create or replace function can_view_form(p_form_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from forms f where f.id = p_form_id
      and ((f.is_published and can_view_parish(f.parish_id, f.share_with_communities)) or is_staff_for(f.parish_id))
  );
$$;

create or replace function can_manage_form(p_form_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from forms f where f.id = p_form_id and is_staff_for(f.parish_id));
$$;

grant execute on function can_view_form(uuid) to authenticated;
grant execute on function can_manage_form(uuid) to authenticated;

create policy "forms_select_visible" on forms for select
  using ((is_published and can_view_parish(parish_id, share_with_communities)) or is_staff_for(parish_id));
create policy "forms_write_staff" on forms for all
  using (is_staff_for(parish_id))
  with check (is_staff_for(parish_id));

create policy "form_sections_select" on form_sections for select using (can_view_form(form_id));
create policy "form_sections_write" on form_sections for all
  using (can_manage_form(form_id)) with check (can_manage_form(form_id));

create policy "form_questions_select" on form_questions for select using (can_view_form(form_id));
create policy "form_questions_write" on form_questions for all
  using (can_manage_form(form_id)) with check (can_manage_form(form_id));

-- Opções: tabela completa (com gabarito) só para a equipe; o fiel lê a view pública.
create policy "form_options_select_staff" on form_question_options for select
  using (exists (select 1 from form_questions q where q.id = form_question_options.question_id and can_manage_form(q.form_id)));
create policy "form_options_write_staff" on form_question_options for all
  using (exists (select 1 from form_questions q where q.id = form_question_options.question_id and can_manage_form(q.form_id)))
  with check (exists (select 1 from form_questions q where q.id = form_question_options.question_id and can_manage_form(q.form_id)));

create view form_question_options_public as
  select o.id, o.question_id, o.label, o.image_url, o.sort_order, o.go_to_section_id, o.submit_form
  from form_question_options o
  join form_questions q on q.id = o.question_id
  where can_view_form(q.form_id);

revoke insert, update, delete, truncate on form_question_options_public from anon, authenticated;
grant select on form_question_options_public to authenticated;

-- Respostas: só via submit_form_response (sem policy de insert).
-- Quem vê: o próprio respondente; a equipe dona do formulário; e a
-- equipe da comunidade de quem respondeu.
create policy "form_responses_select" on form_responses for select
  using (
    profile_id = auth.uid()
    or is_staff_for(parish_id)
    or exists (select 1 from forms f where f.id = form_responses.form_id and is_staff_for(f.parish_id))
  );
create policy "form_responses_delete_staff" on form_responses for delete
  using (exists (select 1 from forms f where f.id = form_responses.form_id and is_staff_for(f.parish_id)));

create policy "form_answers_select" on form_answers for select
  using (exists (
    select 1 from form_responses r join forms f on f.id = r.form_id
    where r.id = form_answers.response_id
      and (r.profile_id = auth.uid() or is_staff_for(r.parish_id) or is_staff_for(f.parish_id))
  ));

-- ---------------------------------------------------------------------
-- Anexos enviados nas respostas (foto da certidão de batismo, etc.).
-- Bucket privado; caminho = {parish_id do respondente}/{uid}/{arquivo}.
-- O fiel sobe/vê só os próprios; a equipe da paróquia (e a Matriz) vê os
-- da sua jurisdição via signed URL.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('form-uploads', 'form-uploads', false, 10485760) -- 10MB
on conflict (id) do nothing;

create policy "form_uploads_insert_own" on storage.objects for insert
  with check (bucket_id = 'form-uploads' and (storage.foldername(name))[2] = auth.uid()::text);
create policy "form_uploads_select_own_or_staff" on storage.objects for select
  using (
    bucket_id = 'form-uploads'
    and (
      (storage.foldername(name))[2] = auth.uid()::text
      or is_staff_for(nullif((storage.foldername(name))[1], '')::uuid)
    )
  );
