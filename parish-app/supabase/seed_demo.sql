-- =========================================================================
-- DEMONSTRAÇÃO — Paróquia Sagrado Coração de Jesus (Matriz)
--   ├─ Comunidade Imaculado Coração de Maria
--   └─ Comunidade Castíssimo Coração de José
--
-- Usada na landing page e nas demonstrações para paróquias. Mostra a
-- hierarquia: o que a Matriz publica aparece nas comunidades; o que a
-- comunidade publica fica só nela.
--
-- Rode DEPOIS das migrations e do seed.sql (precisa dos planos):
--   psql "$DATABASE_URL" -f supabase/seed_demo.sql
-- ou cole no SQL Editor do Supabase. É idempotente (pode rodar de novo).
--
-- Logins de demonstração (senha de todos: Demo@2026):
--   matriz@demo.minhaparoquia.app     → Pároco da Matriz (vê tudo)
--   imaculado@demo.minhaparoquia.app  → Coordenação da comunidade Imaculado Coração
--   castissimo@demo.minhaparoquia.app → Coordenação da comunidade Castíssimo Coração
--   fiel@demo.minhaparoquia.app       → Fiel da comunidade Imaculado Coração
--
-- Tudo aqui é fictício. Para remover: delete from parishes where slug like 'sagrado-coracao-demo%';
-- (as comunidades e o conteúdo caem em cascata) e apague os 4 usuários em
-- Authentication → Users.
-- =========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Paróquias
-- ---------------------------------------------------------------------
insert into parishes (
  id, name, slug, kind, parent_parish_id, address, city, state, phone, email,
  primary_color, secondary_color, status, plan_id, subscription_status, join_code,
  patron_saint, mass_schedule, contact_name
) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Paróquia Sagrado Coração de Jesus', 'sagrado-coracao-demo', 'matriz', null,
   'Praça do Sagrado Coração, 100 – Centro', 'Cidade Exemplo', 'SP', '(11) 4000-1000', 'secretaria@sagradocoracao.demo',
   '#8B1E2D', '#D4A63A', 'active', '10000000-0000-0000-0000-000000000002', 'authorized', 'SAGRADO-DEMO',
   'Sagrado Coração de Jesus', 'Sáb 19h · Dom 7h, 9h30 e 19h · Ter a Sex 19h', 'Pe. João Batista (demo)'),
  ('d0000000-0000-0000-0000-0000000000a2', 'Comunidade Imaculado Coração de Maria', 'sagrado-coracao-demo-imaculado', 'comunidade', 'd0000000-0000-0000-0000-0000000000a1',
   'Rua das Rosas, 45 – Jardim Primavera', 'Cidade Exemplo', 'SP', '(11) 4000-1001', 'imaculado@sagradocoracao.demo',
   '#8B1E2D', '#D4A63A', 'active', '10000000-0000-0000-0000-000000000002', 'authorized', 'IMACULADO-DEMO',
   'Imaculado Coração de Maria', 'Dom 8h · Qua 19h30', 'Maria Aparecida (demo)'),
  ('d0000000-0000-0000-0000-0000000000a3', 'Comunidade Castíssimo Coração de José', 'sagrado-coracao-demo-castissimo', 'comunidade', 'd0000000-0000-0000-0000-0000000000a1',
   'Av. São José, 900 – Vila Operária', 'Cidade Exemplo', 'SP', '(11) 4000-1002', 'castissimo@sagradocoracao.demo',
   '#8B1E2D', '#D4A63A', 'active', '10000000-0000-0000-0000-000000000002', 'authorized', 'CASTISSIMO-DEMO',
   'São José', 'Sáb 17h · Qui 19h30', 'José Carlos (demo)')
on conflict (id) do update set
  name = excluded.name, kind = excluded.kind, parent_parish_id = excluded.parent_parish_id,
  status = excluded.status, plan_id = excluded.plan_id, subscription_status = excluded.subscription_status,
  patron_saint = excluded.patron_saint, mass_schedule = excluded.mass_schedule;

-- ---------------------------------------------------------------------
-- Usuários de demonstração (auth.users + identities). O trigger
-- handle_new_user (0007) cria o perfil; em seguida definimos paróquia e papel.
-- ---------------------------------------------------------------------
do $$
declare
  u record;
begin
  for u in
    select * from (values
      ('d1000000-0000-0000-0000-000000000001'::uuid, 'matriz@demo.minhaparoquia.app', 'Pe. João Batista (demo)', 'd0000000-0000-0000-0000-0000000000a1'::uuid, 'pastor'::member_role),
      ('d1000000-0000-0000-0000-000000000002'::uuid, 'imaculado@demo.minhaparoquia.app', 'Maria Aparecida (demo)', 'd0000000-0000-0000-0000-0000000000a2'::uuid, 'admin'::member_role),
      ('d1000000-0000-0000-0000-000000000003'::uuid, 'castissimo@demo.minhaparoquia.app', 'José Carlos (demo)', 'd0000000-0000-0000-0000-0000000000a3'::uuid, 'admin'::member_role),
      ('d1000000-0000-0000-0000-000000000004'::uuid, 'fiel@demo.minhaparoquia.app', 'Ana Clara (demo)', 'd0000000-0000-0000-0000-0000000000a2'::uuid, 'member'::member_role)
    ) as t(id, email, full_name, parish_id, role)
  loop
    if not exists (select 1 from auth.users where id = u.id) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
        crypt('Demo@2026', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', u.full_name), now(), now(),
        '', '', '', ''
      );
      insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now());
    end if;

    insert into profiles (id, full_name, email) values (u.id, u.full_name, u.email) on conflict (id) do nothing;
    update profiles set parish_id = u.parish_id, role = u.role, full_name = u.full_name where id = u.id;
  end loop;
end $$;

-- Membros fictícios (sem login) para os relatórios do painel terem volume.
-- profiles exige um auth.users correspondente, então criamos usuários sem senha.
do $$
declare
  i int;
  v_id uuid;
  v_parish uuid;
  first_names text[] := array['Ana','Bruno','Carla','Daniel','Elisa','Felipe','Gabriela','Henrique','Isabela','João','Karina','Lucas','Mariana','Natália','Otávio','Paula','Rafael','Sofia','Tiago','Vitória'];
  last_names text[] := array['Silva','Souza','Oliveira','Santos','Pereira','Lima','Costa','Almeida','Ferreira','Rodrigues'];
begin
  for i in 1..60 loop
    v_id := ('d2000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid;
    v_parish := case when i % 3 = 0 then 'd0000000-0000-0000-0000-0000000000a3'::uuid
                     when i % 3 = 1 then 'd0000000-0000-0000-0000-0000000000a1'::uuid
                     else 'd0000000-0000-0000-0000-0000000000a2'::uuid end;
    if not exists (select 1 from auth.users where id = v_id) then
      insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at)
      values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
              'membro' || i || '@demo.minhaparoquia.app',
              jsonb_build_object('full_name', first_names[1 + (i % 20)] || ' ' || last_names[1 + (i % 10)] || ' (demo)'),
              now() - (i || ' days')::interval, now());
    end if;
    insert into profiles (id, full_name, email)
      values (v_id, first_names[1 + (i % 20)] || ' ' || last_names[1 + (i % 10)] || ' (demo)', 'membro' || i || '@demo.minhaparoquia.app')
      on conflict (id) do nothing;
    update profiles set
      parish_id = v_parish,
      birth_date = (current_date - ((14 + (i * 7) % 60) || ' years')::interval)::date,
      baptized = true,
      confirmed = i % 4 <> 0,
      joined_at = now() - (i * 5 || ' days')::interval
    where id = v_id;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Conteúdo: limpa e recria (idempotente)
-- ---------------------------------------------------------------------
delete from events where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from news_posts where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from announcements where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from groups where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from campaigns where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from forms where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from prayer_requests where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from testimonies where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');
delete from financial_categories where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3');

-- Grupos / pastorais
insert into groups (parish_id, name, slug, type, description, meeting_schedule, share_with_communities) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Pastoral da Juventude (paroquial)', 'pj', 'pastoral', 'Jovens de toda a paróquia — Matriz e comunidades.', 'Sextas, 20h, na Matriz', true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Catequese Paroquial', 'catequese', 'catechesis', 'Preparação para a 1ª Eucaristia e Crisma em todas as comunidades.', 'Sábados, 14h', true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Coral da Matriz', 'coral-matriz', 'choir', 'Anima as missas de domingo na Matriz.', 'Quintas, 20h', false),
  ('d0000000-0000-0000-0000-0000000000a2', 'Terço dos Homens – Imaculado', 'terco-homens', 'movement', 'Terço semanal na comunidade.', 'Segundas, 20h', true),
  ('d0000000-0000-0000-0000-0000000000a2', 'Legião de Maria', 'legiao-de-maria', 'movement', 'Visitas e oração.', 'Terças, 15h', true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Pastoral Familiar – São José', 'pastoral-familiar', 'pastoral', 'Encontros de casais na comunidade.', '1º sábado do mês, 19h', true);

-- Eventos: Matriz (compartilhados) e de cada comunidade (locais)
insert into events (parish_id, title, description, location, category, start_at, end_at, requires_registration, capacity, share_with_communities) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Festa do Sagrado Coração de Jesus', 'Missa solene, procissão e quermesse com todas as comunidades.', 'Matriz Sagrado Coração', 'festa', date_trunc('day', now()) + interval '12 days 18 hours', date_trunc('day', now()) + interval '12 days 23 hours', false, null, true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Retiro Paroquial de Advento', 'Um dia de oração e silêncio para toda a paróquia. Inscrição pelo formulário.', 'Casa de Retiro Santa Clara', 'retiro', date_trunc('day', now()) + interval '30 days 8 hours', date_trunc('day', now()) + interval '30 days 17 hours', true, 120, true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Reunião do Conselho Pastoral (CPP)', 'Somente coordenadores da Matriz.', 'Salão paroquial', 'encontro', date_trunc('day', now()) + interval '5 days 20 hours', null, false, null, false),
  ('d0000000-0000-0000-0000-0000000000a2', 'Novena do Imaculado Coração', 'Nove dias de oração na comunidade.', 'Capela Imaculado Coração', 'missa', date_trunc('day', now()) + interval '3 days 19 hours 30 minutes', null, false, null, true),
  ('d0000000-0000-0000-0000-0000000000a2', 'Bazar Beneficente', 'Roupas e utilidades a preço simbólico.', 'Salão da comunidade', 'festa', date_trunc('day', now()) + interval '9 days 9 hours', null, false, null, true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Missa de São José Operário', 'Bênção das carteiras de trabalho.', 'Capela São José', 'missa', date_trunc('day', now()) + interval '6 days 19 hours 30 minutes', null, false, null, true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Encontro de Casais', 'Tema: a família, Igreja doméstica.', 'Capela São José', 'encontro', date_trunc('day', now()) + interval '15 days 19 hours', null, true, 40, true);

-- Avisos
insert into announcements (parish_id, title, body, is_pinned, share_with_communities) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Horário especial de confissões', 'Nesta semana, confissões na Matriz de terça a sexta, das 15h às 18h.', true, true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Secretaria fechada na segunda', 'Atendimento retorna na terça às 8h.', false, true),
  ('d0000000-0000-0000-0000-0000000000a2', 'Missa de quarta transferida', 'Nesta quarta a missa será às 20h (e não 19h30).', true, true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Mutirão de limpeza da capela', 'Sábado às 8h. Traga luvas!', false, true);

-- Notícias
insert into news_posts (parish_id, title, slug, subtitle, body, category, published_at, share_with_communities) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Palavra do Pároco: o Coração que tanto amou', 'palavra-do-paroco', 'Mensagem do mês para toda a paróquia',
   'Queridos irmãos da Matriz e das comunidades Imaculado Coração e Castíssimo Coração: neste mês contemplamos o Coração de Jesus, que tanto amou os homens. Que cada família se consagre a Ele!', 'geral', now() - interval '2 days', true),
  ('d0000000-0000-0000-0000-0000000000a1', 'Inscrições abertas para a Crisma 2027', 'inscricoes-crisma', 'Para jovens a partir de 15 anos',
   'A ficha de inscrição está no app, em Formulários. Ela vale para a Matriz e para as duas comunidades.', 'catequese', now() - interval '1 day', true),
  ('d0000000-0000-0000-0000-0000000000a2', 'Comunidade Imaculado Coração celebra 25 anos', 'imaculado-25-anos', 'Bodas de prata da nossa capela',
   'Obrigado a todos que construíram esta comunidade com tanto amor a Nossa Senhora.', 'geral', now() - interval '3 days', true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Nova pintura da Capela São José', 'nova-pintura', 'Obra concluída com a ajuda de todos',
   'A pintura foi concluída graças às doações da comunidade.', 'geral', now() - interval '4 days', true);

-- Campanhas e categorias financeiras
insert into financial_categories (parish_id, name, type) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Dízimo', 'dizimo'),
  ('d0000000-0000-0000-0000-0000000000a1', 'Oferta', 'oferta'),
  ('d0000000-0000-0000-0000-0000000000a2', 'Dízimo', 'dizimo'),
  ('d0000000-0000-0000-0000-0000000000a3', 'Dízimo', 'dizimo');

insert into campaigns (parish_id, name, slug, description, goal_amount, current_amount, start_date, end_date, status, share_with_communities) values
  ('d0000000-0000-0000-0000-0000000000a1', 'Restauro do altar da Matriz', 'restauro-altar', 'Campanha de toda a paróquia para restaurar o altar-mor.', 80000, 31250, current_date - 30, current_date + 60, 'active', true),
  ('d0000000-0000-0000-0000-0000000000a3', 'Telhado da Capela São José', 'telhado-capela', 'Troca do telhado antes do período de chuvas.', 15000, 9800, current_date - 20, current_date + 40, 'active', true);

insert into donations (parish_id, profile_id, amount, payment_method, payment_status, paid_at, created_at)
select
  case when g % 3 = 0 then 'd0000000-0000-0000-0000-0000000000a3'::uuid when g % 3 = 1 then 'd0000000-0000-0000-0000-0000000000a1'::uuid else 'd0000000-0000-0000-0000-0000000000a2'::uuid end,
  ('d2000000-0000-0000-0000-' || lpad((1 + g % 60)::text, 12, '0'))::uuid,
  (20 + (g * 37) % 280)::numeric,
  (array['pix','credit_card','pix','boleto']::payment_method[])[1 + g % 4],
  'completed', now() - (g || ' days')::interval, now() - (g || ' days')::interval
from generate_series(1, 45) g
where not exists (select 1 from donations d where d.parish_id = 'd0000000-0000-0000-0000-0000000000a1' and d.notes = 'demo');

update donations set notes = 'demo'
where parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3') and notes is null;

-- ---------------------------------------------------------------------
-- Formulário da Secretaria de Evangelização (mostra seções, lista longa,
-- desvio condicional, imagem e quiz) — publicado pela Matriz, aparece
-- nas comunidades.
-- ---------------------------------------------------------------------
insert into forms (id, parish_id, title, description, category, is_published, share_with_communities, confirmation_message) values
  ('d3000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-0000000000a1',
   'Ficha de Inscrição – Crisma 2027',
   'Secretaria de Evangelização. Preencha com calma; leva cerca de 3 minutos.',
   'inscricao', true, true,
   'Inscrição recebida! A Secretaria de Evangelização entrará em contato pelo WhatsApp.');

insert into form_sections (id, form_id, title, description, image_url, sort_order) values
  ('d3100000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', 'Dados do crismando', 'Informações pessoais de quem vai receber o sacramento.', null, 1),
  ('d3100000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', 'Batismo', 'Precisamos da certidão de batismo para a Crisma.', 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800', 2),
  ('d3100000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'Ainda não sou batizado', 'Sem problema! Você fará primeiro a preparação para o Batismo.', null, 3),
  ('d3100000-0000-0000-0000-000000000004', 'd3000000-0000-0000-0000-000000000001', 'Disponibilidade', 'Escolha a turma.', null, 4);

-- a seção 3 (não batizado) termina o formulário depois dela
update form_sections set submit_after = true where id = 'd3100000-0000-0000-0000-000000000003';
-- a seção 2 (batizado) pula a 3 e vai direto para Disponibilidade
update form_sections set next_section_id = 'd3100000-0000-0000-0000-000000000004' where id = 'd3100000-0000-0000-0000-000000000002';

insert into form_questions (id, form_id, section_id, question_type, label, help_text, is_required, sort_order) values
  ('d3200000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', 'short_text', 'Nome completo', null, true, 1),
  ('d3200000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', 'date', 'Data de nascimento', null, true, 2),
  ('d3200000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', 'phone', 'WhatsApp', null, true, 3),
  ('d3200000-0000-0000-0000-000000000004', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', 'dropdown', 'Em qual cidade você nasceu?', 'Lista longa com busca — digite para filtrar.', true, 4),
  ('d3200000-0000-0000-0000-000000000005', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000001', 'single_choice', 'Você é batizado(a)?', 'Sua resposta define a próxima etapa.', true, 5),
  ('d3200000-0000-0000-0000-000000000006', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000002', 'short_text', 'Paróquia onde foi batizado(a)', null, true, 1),
  ('d3200000-0000-0000-0000-000000000007', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000002', 'image_upload', 'Foto da certidão de batismo', 'Pode ser foto do celular.', false, 2),
  ('d3200000-0000-0000-0000-000000000008', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000003', 'long_text', 'Conte um pouco sobre você e sua família', null, false, 1),
  ('d3200000-0000-0000-0000-000000000009', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000004', 'single_choice', 'Em qual comunidade deseja fazer os encontros?', null, true, 1),
  ('d3200000-0000-0000-0000-000000000010', 'd3000000-0000-0000-0000-000000000001', 'd3100000-0000-0000-0000-000000000004', 'multiple_choice', 'Quais turnos você pode?', null, true, 2);

insert into form_question_options (question_id, label, sort_order, go_to_section_id, submit_form) values
  ('d3200000-0000-0000-0000-000000000005', 'Sim', 1, 'd3100000-0000-0000-0000-000000000002', false),
  ('d3200000-0000-0000-0000-000000000005', 'Não', 2, 'd3100000-0000-0000-0000-000000000003', false),
  ('d3200000-0000-0000-0000-000000000009', 'Matriz Sagrado Coração', 1, null, false),
  ('d3200000-0000-0000-0000-000000000009', 'Comunidade Imaculado Coração', 2, null, false),
  ('d3200000-0000-0000-0000-000000000009', 'Comunidade Castíssimo Coração', 3, null, false),
  ('d3200000-0000-0000-0000-000000000010', 'Manhã de sábado', 1, null, false),
  ('d3200000-0000-0000-0000-000000000010', 'Tarde de sábado', 2, null, false),
  ('d3200000-0000-0000-0000-000000000010', 'Noite durante a semana', 3, null, false);

-- Lista longa: capitais e cidades grandes (exemplo de lista suspensa extensa)
insert into form_question_options (question_id, label, sort_order)
select 'd3200000-0000-0000-0000-000000000004', city, row_number() over ()
from unnest(array[
  'Aracaju','Belém','Belo Horizonte','Boa Vista','Brasília','Campinas','Campo Grande','Cuiabá','Curitiba','Feira de Santana',
  'Florianópolis','Fortaleza','Goiânia','Guarulhos','João Pessoa','Joinville','Juiz de Fora','Londrina','Macapá','Maceió',
  'Manaus','Natal','Niterói','Osasco','Palmas','Porto Alegre','Porto Velho','Recife','Ribeirão Preto','Rio Branco',
  'Rio de Janeiro','Salvador','Santo André','Santos','São Bernardo do Campo','São José dos Campos','São Luís','São Paulo',
  'Sorocaba','Teresina','Uberlândia','Vitória','Outra cidade'
]) as city;

-- Quiz de exemplo (formulário em modo quiz)
insert into forms (id, parish_id, title, description, category, is_quiz, is_published, share_with_communities, confirmation_message) values
  ('d3000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-0000000000a1',
   'Quiz: Você conhece o Sagrado Coração?', 'Três perguntas rápidas para a festa do padroeiro.', 'quiz', true, true, true,
   'Obrigado por participar! Sagrado Coração de Jesus, eu confio em vós.');
insert into form_sections (id, form_id, title, sort_order, image_url) values
  ('d3100000-0000-0000-0000-000000000010', 'd3000000-0000-0000-0000-000000000002', 'Perguntas', 1, 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800');
insert into form_questions (id, form_id, section_id, question_type, label, is_required, sort_order, points) values
  ('d3200000-0000-0000-0000-000000000020', 'd3000000-0000-0000-0000-000000000002', 'd3100000-0000-0000-0000-000000000010', 'single_choice', 'A qual santa Jesus revelou a devoção ao Sagrado Coração?', true, 1, 10),
  ('d3200000-0000-0000-0000-000000000021', 'd3000000-0000-0000-0000-000000000002', 'd3100000-0000-0000-0000-000000000010', 'single_choice', 'Em que dia se celebra a solenidade do Sagrado Coração?', true, 2, 10),
  ('d3200000-0000-0000-0000-000000000022', 'd3000000-0000-0000-0000-000000000002', 'd3100000-0000-0000-0000-000000000010', 'single_choice', 'Quantas primeiras sextas-feiras compõem a devoção?', true, 3, 10);
insert into form_question_options (question_id, label, sort_order, is_correct) values
  ('d3200000-0000-0000-0000-000000000020', 'Santa Margarida Maria Alacoque', 1, true),
  ('d3200000-0000-0000-0000-000000000020', 'Santa Teresinha', 2, false),
  ('d3200000-0000-0000-0000-000000000020', 'Santa Faustina', 3, false),
  ('d3200000-0000-0000-0000-000000000021', 'Na sexta-feira após a solenidade de Corpus Christi', 1, true),
  ('d3200000-0000-0000-0000-000000000021', 'No dia 8 de dezembro', 2, false),
  ('d3200000-0000-0000-0000-000000000021', 'No primeiro domingo do Advento', 3, false),
  ('d3200000-0000-0000-0000-000000000022', 'Três', 1, false),
  ('d3200000-0000-0000-0000-000000000022', 'Nove', 2, true),
  ('d3200000-0000-0000-0000-000000000022', 'Doze', 3, false);

-- Formulário LOCAL de uma comunidade (não aparece na Matriz nem na outra comunidade)
insert into forms (id, parish_id, title, description, category, is_published, share_with_communities) values
  ('d3000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-0000000000a2',
   'Escala de leitores – Imaculado Coração', 'Quer ler nas missas da comunidade? Deixe seu nome.', 'cadastro', true, true);
insert into form_sections (id, form_id, title, sort_order) values
  ('d3100000-0000-0000-0000-000000000020', 'd3000000-0000-0000-0000-000000000003', 'Disponibilidade', 1);
insert into form_questions (form_id, section_id, question_type, label, is_required, sort_order) values
  ('d3000000-0000-0000-0000-000000000003', 'd3100000-0000-0000-0000-000000000020', 'short_text', 'Seu nome', true, 1);

-- ---------------------------------------------------------------------
-- Cuidado pastoral
-- ---------------------------------------------------------------------
insert into prayer_requests (parish_id, profile_id, requester_name, requester_phone, area, body, allow_whatsapp_contact, status) values
  ('d0000000-0000-0000-0000-0000000000a2', 'd1000000-0000-0000-0000-000000000004', 'Ana Clara (demo)', '(11) 90000-0004', 'saude', 'Pela recuperação da minha avó, que está internada.', true, 'open'),
  ('d0000000-0000-0000-0000-0000000000a1', 'd2000000-0000-0000-0000-000000000001', 'Bruno Souza (demo)', '(11) 90000-0101', 'trabalho', 'Por uma nova oportunidade de emprego.', false, 'praying'),
  ('d0000000-0000-0000-0000-0000000000a3', 'd2000000-0000-0000-0000-000000000003', 'Daniel Santos (demo)', '(11) 90000-0103', 'familia', 'Pela paz na minha família.', true, 'open');

insert into testimonies (parish_id, profile_id, author_name, category, body, allow_publish, status) values
  ('d0000000-0000-0000-0000-0000000000a2', 'd1000000-0000-0000-0000-000000000004', 'Ana Clara (demo)', 'saude', 'Minha avó recebeu alta! Obrigada a todos que rezaram.', true, 'approved'),
  ('d0000000-0000-0000-0000-0000000000a1', 'd2000000-0000-0000-0000-000000000004', 'Elisa Pereira (demo)', 'vida_espiritual', 'Depois do retiro voltei a me confessar depois de 10 anos.', true, 'pending');

insert into mood_checkins (parish_id, profile_id, mood, created_at)
select
  p.parish_id, p.id,
  (array['grato','feliz','em_paz','cansado','ansioso','triste','precisando_de_oracao'])[1 + (abs(hashtext(p.id::text)) % 7)],
  now() - ((abs(hashtext(p.id::text)) % 6) || ' days')::interval
from profiles p
where p.parish_id in ('d0000000-0000-0000-0000-0000000000a1','d0000000-0000-0000-0000-0000000000a2','d0000000-0000-0000-0000-0000000000a3')
  and not exists (select 1 from mood_checkins m where m.profile_id = p.id);
