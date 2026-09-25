-- =========================================================================
-- Cria o perfil automaticamente quando um usuário se cadastra, via
-- trigger em auth.users — não depende do app inserir em profiles logo
-- após signUp().
--
-- Por que isso era necessário: por padrão o Supabase exige confirmação
-- de e-mail, e supabase.auth.signUp() só retorna uma sessão válida
-- DEPOIS da confirmação. Entre o signUp() e a confirmação, o cliente
-- não está autenticado (auth.uid() é nulo), então qualquer insert que o
-- app tentasse fazer em `profiles` logo em seguida batia na RLS
-- ("new row violates row-level security policy"). Um trigger em
-- auth.users roda com privilégio de sistema (security definer, dono
-- supabase_auth_admin) e não depende do cliente estar autenticado.
-- =========================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Corrige retroativamente qualquer conta criada ANTES desta migration que
-- ficou sem perfil (exatamente o caso que motivou essa correção: a
-- tentativa de cadastro anterior criou o usuário em auth.users, mas o
-- insert em profiles feito pelo app falhou por RLS).
insert into public.profiles (id, full_name, email)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
