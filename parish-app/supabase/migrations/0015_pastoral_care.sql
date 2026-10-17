-- =========================================================================
-- Cuidado pastoral (inspirado no módulo "Cuidado" da inChurch):
--   - pedidos de oração (com área e autorização de contato por WhatsApp);
--   - testemunhos (o fiel autoriza ou não a publicação; a equipe aprova);
--   - "Como você está se sentindo hoje?" (check-in de sentimento na Home,
--     que vira termômetro para a equipe pastoral).
-- Ficam sempre na paróquia/comunidade de quem enviou; a equipe da Matriz
-- acompanha também os das comunidades (is_staff_for, ver 0013).
-- =========================================================================

create type prayer_request_status as enum ('open', 'praying', 'answered', 'archived');
create type testimony_status as enum ('pending', 'approved', 'rejected');

create table prayer_requests (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  requester_name text not null,
  requester_email text,
  requester_phone text,
  area text not null default 'outros', -- familia, saude, trabalho, vida_espiritual, casamento, vida_financeira, falecidos, outros
  body text not null,
  allow_whatsapp_contact boolean not null default false,
  is_private boolean not null default true, -- false = pode ser lido no grupo de intercessão / Missa
  status prayer_request_status not null default 'open',
  staff_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_prayer_requests_parish on prayer_requests(parish_id, status, created_at desc);

create table testimonies (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid not null references parishes(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  author_name text not null,
  category text not null default 'outros',
  body text not null,
  allow_publish boolean not null default false,
  allow_whatsapp_contact boolean not null default false,
  status testimony_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_testimonies_parish on testimonies(parish_id, status, created_at desc);

create table mood_checkins (
  id uuid primary key default uuid_generate_v4(),
  parish_id uuid references parishes(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  mood text not null check (mood in ('grato', 'feliz', 'em_paz', 'cansado', 'ansioso', 'triste', 'precisando_de_oracao')),
  created_at timestamptz not null default now()
);

create index idx_mood_checkins_parish on mood_checkins(parish_id, created_at desc);

create trigger trg_prayer_requests_updated_at
  before update on prayer_requests
  for each row execute function set_updated_at();

-- A paróquia gravada é sempre a de quem envia (não confia no cliente).
create or replace function set_care_parish_from_author()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.profile_id is not null then
    new.parish_id := coalesce((select parish_id from profiles where id = new.profile_id), new.parish_id);
  end if;
  return new;
end;
$$;

create trigger trg_prayer_requests_parish before insert on prayer_requests
  for each row execute function set_care_parish_from_author();
create trigger trg_testimonies_parish before insert on testimonies
  for each row execute function set_care_parish_from_author();
create trigger trg_mood_checkins_parish before insert on mood_checkins
  for each row execute function set_care_parish_from_author();

alter table prayer_requests enable row level security;
alter table testimonies enable row level security;
alter table mood_checkins enable row level security;

create policy "prayer_insert_self" on prayer_requests for insert
  with check (profile_id = auth.uid());
create policy "prayer_select_self_or_staff" on prayer_requests for select
  using (profile_id = auth.uid() or is_staff_for(parish_id));
create policy "prayer_update_staff" on prayer_requests for update
  using (is_staff_for(parish_id));
create policy "prayer_delete_staff" on prayer_requests for delete
  using (is_staff_for(parish_id));

create policy "testimonies_insert_self" on testimonies for insert
  with check (profile_id = auth.uid() and status = 'pending');
create policy "testimonies_select_published" on testimonies for select
  using (status = 'approved' and allow_publish and parish_id = auth_parish_id());
create policy "testimonies_select_self_or_staff" on testimonies for select
  using (profile_id = auth.uid() or is_staff_for(parish_id));
create policy "testimonies_update_staff" on testimonies for update
  using (is_staff_for(parish_id));
create policy "testimonies_delete_staff" on testimonies for delete
  using (is_staff_for(parish_id));

create policy "mood_insert_self" on mood_checkins for insert
  with check (profile_id = auth.uid());
create policy "mood_select_self_or_staff" on mood_checkins for select
  using (profile_id = auth.uid() or is_staff_for(parish_id));
