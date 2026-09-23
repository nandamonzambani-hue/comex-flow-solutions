-- =========================================================================
-- Dados de exemplo para desenvolvimento. Rode com:
--   supabase db reset   (aplica migrations + este seed)
-- Troque os valores pela paróquia real antes de ir para produção.
-- =========================================================================

insert into parishes (id, name, slug, address, city, state, phone, email, primary_color, secondary_color)
values (
  '00000000-0000-0000-0000-000000000001',
  'Paróquia Nossa Senhora Aparecida',
  'nossa-senhora-aparecida',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '(11) 4000-0000',
  'contato@paroquiaexemplo.org.br',
  '#7A1F2B',
  '#C9A24B'
);

-- Grupos / pastorais padrão de uma paróquia católica
insert into groups (parish_id, name, slug, type, description, meeting_schedule) values
  ('00000000-0000-0000-0000-000000000001', 'Pastoral da Criança', 'pastoral-da-crianca', 'pastoral', 'Acompanhamento de gestantes e crianças de 0 a 6 anos.', 'Toda 2ª quinta-feira, 19h30'),
  ('00000000-0000-0000-0000-000000000001', 'Pastoral da Juventude', 'pastoral-da-juventude', 'pastoral', 'Encontros, formação e evangelização para jovens.', 'Sextas-feiras, 20h'),
  ('00000000-0000-0000-0000-000000000001', 'Pastoral Familiar', 'pastoral-familiar', 'pastoral', 'Apoio e formação para famílias, preparação para o casamento.', 'Mensal, 1º sábado'),
  ('00000000-0000-0000-0000-000000000001', 'Pastoral da Saúde', 'pastoral-da-saude', 'pastoral', 'Visita e acolhimento a enfermos.', 'Quartas-feiras, 15h'),
  ('00000000-0000-0000-0000-000000000001', 'Catequese', 'catequese', 'catechesis', 'Preparação para os sacramentos (1ª Eucaristia, Crisma).', 'Sábados, 14h'),
  ('00000000-0000-0000-0000-000000000001', 'Grupo de Liturgia', 'grupo-de-liturgia', 'ministry', 'Organização das celebrações litúrgicas.', 'Quintas-feiras, 19h'),
  ('00000000-0000-0000-0000-000000000001', 'Coral Paroquial', 'coral-paroquial', 'choir', 'Ministério de música nas missas.', 'Terças e quintas, 20h'),
  ('00000000-0000-0000-0000-000000000001', 'Ministério de Acolhida', 'ministerio-de-acolhida', 'ministry', 'Recepção dos fiéis nas celebrações.', 'Antes de cada missa'),
  ('00000000-0000-0000-0000-000000000001', 'Apostolado da Oração', 'apostolado-da-oracao', 'movement', 'Grupo de oração e adoração.', 'Segundas-feiras, 19h'),
  ('00000000-0000-0000-0000-000000000001', 'Notícias da Paróquia', 'noticias-da-paroquia', 'news', 'Comunicados oficiais e avisos gerais.', null);

-- Categorias financeiras
insert into financial_categories (parish_id, name, type) values
  ('00000000-0000-0000-0000-000000000001', 'Dízimo mensal', 'dizimo'),
  ('00000000-0000-0000-0000-000000000001', 'Oferta de missa', 'oferta'),
  ('00000000-0000-0000-0000-000000000001', 'Campanha da Fraternidade', 'campanha'),
  ('00000000-0000-0000-0000-000000000001', 'Festa do Padroeiro', 'festa'),
  ('00000000-0000-0000-0000-000000000001', 'Intenção de missa', 'missa_intencao'),
  ('00000000-0000-0000-0000-000000000001', 'Obras e reforma', 'outro');

-- Campanha ativa de exemplo
insert into campaigns (parish_id, name, slug, description, goal_amount, current_amount, start_date, end_date, status) values
  ('00000000-0000-0000-0000-000000000001', 'Reforma do Salão Paroquial', 'reforma-salao-paroquial', 'Ajude-nos a reformar o salão paroquial para melhor acolher nossa comunidade.', 50000.00, 12500.00, current_date, current_date + interval '90 days', 'active');

-- Versão bíblica (texto completo deve ser populado via função de
-- sincronização — ver supabase/functions/bible-sync). Aqui só o cadastro
-- da versão e dos livros, para a UI funcionar imediatamente.
insert into bible_versions (id, name, language) values
  ('ave-maria', 'Bíblia Ave Maria', 'pt-BR');

insert into bible_books (id, version_id, testament, name, abbreviation, order_index, chapters_count) values
  ('gn', 'ave-maria', 'AT', 'Gênesis', 'Gn', 1, 50),
  ('ex', 'ave-maria', 'AT', 'Êxodo', 'Ex', 2, 40),
  ('sl', 'ave-maria', 'AT', 'Salmos', 'Sl', 19, 150),
  ('mt', 'ave-maria', 'NT', 'Mateus', 'Mt', 40, 28),
  ('mc', 'ave-maria', 'NT', 'Marcos', 'Mc', 41, 16),
  ('lc', 'ave-maria', 'NT', 'Lucas', 'Lc', 42, 24),
  ('jo', 'ave-maria', 'NT', 'João', 'Jo', 43, 21);
-- Lista completa dos 73 livros deve ser inserida pela função de sync (ver docs/CONTENT_GUIDE.md).

-- Liturgia de hoje (exemplo estático — em produção, a Edge Function
-- daily-liturgy-sync roda diariamente via cron e preenche esta tabela)
insert into daily_liturgy (date, liturgical_color, liturgical_season, celebration, gospel_ref, gospel_text, reflection)
values (
  current_date,
  'Verde',
  'Tempo Comum',
  'Feria do Tempo Comum',
  'Lc 8, 4-15',
  'Texto do evangelho do dia a ser preenchido pela sincronização automática.',
  'Reflexão do dia a ser preenchida pela sincronização automática ou por um membro da equipe de liturgia.'
);
