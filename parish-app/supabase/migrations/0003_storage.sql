-- =========================================================================
-- Buckets de armazenamento: avatares, mídia (vídeo/thumb), downloads,
-- imagens de capa (eventos, grupos, campanhas).
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('avatars', 'avatars', true, 5242880),        -- 5MB
  ('media', 'media', true, 524288000),          -- 500MB (vídeos)
  ('downloads', 'downloads', true, 104857600),  -- 100MB
  ('covers', 'covers', true, 10485760)          -- 10MB
on conflict (id) do nothing;

-- Qualquer usuário autenticado pode ler arquivos públicos
create policy "public_read_avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "public_read_media" on storage.objects for select
  using (bucket_id = 'media');
create policy "public_read_downloads" on storage.objects for select
  using (bucket_id = 'downloads');
create policy "public_read_covers" on storage.objects for select
  using (bucket_id = 'covers');

-- Usuário só sobe/edita seu próprio avatar (pasta = seu uid)
create policy "user_manage_own_avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_update_own_avatar" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_delete_own_avatar" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Staff gerencia mídia, downloads e capas
create policy "staff_manage_media" on storage.objects for insert
  with check (bucket_id = 'media' and is_staff());
create policy "staff_update_media" on storage.objects for update
  using (bucket_id = 'media' and is_staff());
create policy "staff_delete_media" on storage.objects for delete
  using (bucket_id = 'media' and is_staff());

create policy "staff_manage_downloads" on storage.objects for insert
  with check (bucket_id = 'downloads' and is_staff());
create policy "staff_delete_downloads" on storage.objects for delete
  using (bucket_id = 'downloads' and is_staff());

create policy "staff_manage_covers" on storage.objects for insert
  with check (bucket_id = 'covers' and is_staff());
create policy "staff_delete_covers" on storage.objects for delete
  using (bucket_id = 'covers' and is_staff());
