-- =========================================================================
-- Suporte a múltiplos idiomas:
-- 1) idioma preferido do membro (para notificações/relatórios futuros)
-- 2) traduções opcionais de conteúdo (jsonb, preenchidas pela equipe)
-- 3) liturgia diária por idioma (uma linha por data+idioma)
-- =========================================================================

alter table profiles add column preferred_locale text default 'pt-BR';

alter table groups add column translations jsonb not null default '{}';
alter table events add column translations jsonb not null default '{}';
alter table campaigns add column translations jsonb not null default '{}';
alter table media_content add column translations jsonb not null default '{}';
alter table news_posts add column translations jsonb not null default '{}';

comment on column groups.translations is
  'Ex: {"en": {"name": "...", "description": "..."}, "es": {...}}';
comment on column media_content.translations is
  'Ex: {"en": {"title": "...", "description": "...", "body": "..."}}';
comment on column news_posts.translations is
  'Ex: {"en": {"title": "...", "subtitle": "...", "body": "..."}}';

-- Liturgia diária: uma linha por (data, idioma). Antes havia uma linha só
-- por data; migramos para pt-BR e trocamos a unicidade.
alter table daily_liturgy add column locale text not null default 'pt-BR';
alter table daily_liturgy drop constraint daily_liturgy_date_key;
alter table daily_liturgy add constraint daily_liturgy_date_locale_key unique (date, locale);
