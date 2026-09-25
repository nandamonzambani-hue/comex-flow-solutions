-- =========================================================================
-- Quiz: perguntas de múltipla escolha, avulsas (estudo bíblico/catequese)
-- ou vinculadas a um conteúdo (media_content), com histórico de
-- tentativas por pessoa. Multi-tenant: cada quiz pertence a uma paróquia.
-- =========================================================================

create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  media_content_id uuid references media_content(id) on delete cascade,
  title text not null,
  description text,
  passing_score_percent integer not null default 70,
  is_published boolean not null default false,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_quizzes_parish on quizzes(parish_id);
create index idx_quizzes_media_content on quizzes(media_content_id);

create table quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_quiz_questions_quiz on quiz_questions(quiz_id);

create table quiz_options (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

create index idx_quiz_options_question on quiz_options(question_id);

-- Uma tentativa = uma vez que a pessoa respondeu o quiz inteiro.
create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  score_percent integer not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  passed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index idx_quiz_attempts_profile on quiz_attempts(profile_id);
create index idx_quiz_attempts_quiz on quiz_attempts(quiz_id);

create table quiz_answers (
  id uuid primary key default uuid_generate_v4(),
  attempt_id uuid references quiz_attempts(id) on delete cascade,
  question_id uuid references quiz_questions(id) on delete cascade,
  selected_option_id uuid references quiz_options(id) on delete set null,
  is_correct boolean not null default false,
  unique(attempt_id, question_id)
);

-- Calcula e grava o resultado final de uma tentativa a partir das
-- respostas já registradas (chamado pelo app ao enviar o quiz).
--
-- IMPORTANTE: o cliente nunca sabe qual opção é a correta (RLS de
-- quiz_options bloqueia isso pra não-staff — ver abaixo), então o
-- `is_correct` que ele manda ao inserir em quiz_answers não pode ser
-- confiável. Esta função primeiro RECALCULA is_correct de cada resposta
-- comparando selected_option_id com quiz_options.is_correct (que ela
-- consegue ler por ser security definer) e só então conta os acertos —
-- nunca confia no valor que já estava salvo na linha.
create or replace function finalize_quiz_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_quiz_id uuid;
  v_correct integer;
  v_total integer;
  v_percent integer;
  v_passing integer;
begin
  select quiz_id into v_quiz_id from quiz_attempts where id = p_attempt_id and profile_id = auth.uid();
  if v_quiz_id is null then
    raise exception 'Tentativa não encontrada ou não pertence a este usuário.';
  end if;

  update quiz_answers qa
  set is_correct = coalesce(qo.is_correct, false)
  from quiz_options qo
  where qa.attempt_id = p_attempt_id
    and qo.id = qa.selected_option_id;

  -- Respostas sem opção selecionada (selected_option_id nulo) contam como erradas.
  update quiz_answers
  set is_correct = false
  where attempt_id = p_attempt_id and selected_option_id is null;

  select count(*) filter (where is_correct), count(*)
    into v_correct, v_total
    from quiz_answers where attempt_id = p_attempt_id;

  select passing_score_percent into v_passing from quizzes where id = v_quiz_id;
  v_percent := case when v_total > 0 then round(v_correct::numeric / v_total * 100) else 0 end;

  update quiz_attempts
  set correct_count = v_correct,
      total_questions = v_total,
      score_percent = v_percent,
      passed = v_percent >= coalesce(v_passing, 70),
      completed_at = now()
  where id = p_attempt_id;
end;
$$;

revoke all on function finalize_quiz_attempt(uuid) from public;
grant execute on function finalize_quiz_attempt(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table quiz_attempts enable row level security;
alter table quiz_answers enable row level security;

create policy "quizzes_select_parish" on quizzes for select
  using (parish_id = auth_parish_id() and is_published);
create policy "quizzes_select_staff" on quizzes for select
  using (is_staff() and parish_id = auth_parish_id());
create policy "quizzes_write_staff" on quizzes for all
  using (is_staff() and parish_id = auth_parish_id())
  with check (is_staff() and parish_id = auth_parish_id());

create policy "quiz_questions_select_if_quiz_visible" on quiz_questions for select
  using (exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id
      and q.parish_id = auth_parish_id()
      and (q.is_published or is_staff())
  ));
create policy "quiz_questions_write_staff" on quiz_questions for all
  using (exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id and q.parish_id = auth_parish_id() and is_staff()
  ))
  with check (exists (
    select 1 from quizzes q
    where q.id = quiz_questions.quiz_id and q.parish_id = auth_parish_id() and is_staff()
  ));

-- RLS é por linha, não por coluna — não dá pra esconder só is_correct de
-- quem não é staff mantendo a tabela base legível. Por isso a tabela
-- base fica restrita a staff, e o app usa a view quiz_options_public
-- (sem is_correct) pra exibir as opções ao responder. O resultado é
-- sempre calculado no servidor via finalize_quiz_attempt(), nunca no
-- cliente, então a resposta correta nunca precisa chegar ao app.
create policy "quiz_options_select_staff" on quiz_options for select
  using (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and q.parish_id = auth_parish_id() and is_staff()
  ));
create policy "quiz_options_write_staff" on quiz_options for all
  using (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and q.parish_id = auth_parish_id() and is_staff()
  ))
  with check (exists (
    select 1 from quiz_questions qq join quizzes q on q.id = qq.quiz_id
    where qq.id = quiz_options.question_id and q.parish_id = auth_parish_id() and is_staff()
  ));

-- security_invoker não é setado (padrão "false"): a view roda com o
-- privilégio de quem a criou, então enxerga quiz_options mesmo a tabela
-- base sendo restrita a staff. Como ignora a RLS da tabela base, replica
-- manualmente a regra de "quiz publicado E da própria paróquia" no
-- WHERE — senão vazaria perguntas de quizzes de outras paróquias pra
-- qualquer pessoa autenticada. auth_parish_id() é security definer e lê
-- auth.uid() internamente, então continua avaliando pelo usuário real
-- que chamou, não pelo dono da view.
create view quiz_options_public as
  select qo.id, qo.question_id, qo.option_text, qo.sort_order
  from quiz_options qo
  join quiz_questions qq on qq.id = qo.question_id
  join quizzes q on q.id = qq.quiz_id
  where q.is_published and q.parish_id = auth_parish_id();

grant select on quiz_options_public to authenticated;

create policy "quiz_attempts_select_self_or_staff" on quiz_attempts for select
  using (profile_id = auth.uid() or is_staff());
create policy "quiz_attempts_insert_self" on quiz_attempts for insert
  with check (profile_id = auth.uid());
create policy "quiz_attempts_update_self" on quiz_attempts for update
  using (profile_id = auth.uid());

create policy "quiz_answers_select_self_or_staff" on quiz_answers for select
  using (is_staff() or exists (select 1 from quiz_attempts a where a.id = quiz_answers.attempt_id and a.profile_id = auth.uid()));
create policy "quiz_answers_insert_self" on quiz_answers for insert
  with check (exists (select 1 from quiz_attempts a where a.id = quiz_answers.attempt_id and a.profile_id = auth.uid()));
create policy "quiz_answers_update_self" on quiz_answers for update
  using (exists (select 1 from quiz_attempts a where a.id = quiz_answers.attempt_id and a.profile_id = auth.uid()));
