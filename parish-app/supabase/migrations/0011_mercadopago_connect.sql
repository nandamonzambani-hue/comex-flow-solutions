-- =========================================================================
-- Mercado Pago Connect (OAuth/Marketplace): cada paróquia autoriza sua
-- PRÓPRIA conta Mercado Pago para receber dízimo/doações diretamente —
-- sem passar pela conta da plataforma. Sem isso, toda doação de todo
-- fiel de toda paróquia cairia numa única conta (a da plataforma), o
-- que não é correto nem operacionalmente sustentável.
--
-- A assinatura da PARÓQUIA à PLATAFORMA (create-parish-subscription)
-- continua usando a conta Mercado Pago da plataforma — esse dinheiro é
-- seu mesmo, não muda.
-- =========================================================================

create table parish_payment_accounts (
  parish_id uuid primary key references parishes(id) on delete cascade,
  provider text not null default 'mercadopago',
  access_token text not null,
  refresh_token text,
  public_key text,
  mp_user_id bigint,
  expires_at timestamptz,
  connected_by uuid references profiles(id) on delete set null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table parish_payment_accounts enable row level security;

-- IMPORTANTE: nenhuma policy de select/insert/update/delete pra
-- anon/authenticated aqui — com RLS ligada e zero policies, ninguém além
-- do dono da tabela e do service_role consegue ler ou escrever. Só as
-- Edge Functions (que usam a service_role key) tocam access_token/
-- refresh_token diretamente. O app e o admin só enxergam o status via a
-- view abaixo, que nunca expõe os tokens.

-- security_invoker não é setado (padrão "false", mesmo padrão já usado em
-- quiz_options_public): a view roda com o privilégio de quem a criou,
-- então consegue ler parish_payment_accounts mesmo sem policy nenhuma
-- pra authenticated. Como ela ignora a RLS da tabela base, replica
-- manualmente a regra de acesso no WHERE (staff da própria paróquia) —
-- senão vazaria o status de conexão de outras paróquias.
create view parish_payment_status as
  select
    parish_id,
    provider,
    connected_at,
    updated_at,
    (expires_at is null or expires_at > now()) as is_active
  from parish_payment_accounts
  where parish_id = auth_parish_id() and is_staff();

-- A view não tem security_invoker, mas o Postgres ainda considera ela
-- "automaticamente atualizável" (é baseada numa única tabela) — sem este
-- revoke explícito, um UPDATE/INSERT direto na VIEW (não na tabela) seria
-- reescrito pelo Postgres como um UPDATE/INSERT na tabela base, ignorando
-- por completo o "zero policies = nega tudo" de parish_payment_accounts.
-- Confirmado via teste adversarial: sem este revoke, um staff autenticado
-- conseguia `update parish_payment_status set provider = ... where
-- parish_id = <sua própria paróquia>` e a mudança ia parar na tabela real.
revoke insert, update, delete, truncate on parish_payment_status from anon, authenticated;
grant select on parish_payment_status to authenticated;

comment on table parish_payment_accounts is
  'Tokens OAuth do Mercado Pago de cada paróquia (marketplace/split). Nunca exposta a anon/authenticated diretamente — só via parish_payment_status (sem tokens) ou pelas Edge Functions com service_role.';
