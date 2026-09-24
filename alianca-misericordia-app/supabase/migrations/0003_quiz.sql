-- =========================================================================
-- Quiz: perguntas de múltipla escolha vinculadas a um vídeo (ou avulsas),
-- com histórico de tentativas e pontuação por pessoa.
-- =========================================================================

create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  title text not null,
  passing_score_percent integer not null default 70,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_quizzes_video on quizzes(video_id);

create table quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question_text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

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
