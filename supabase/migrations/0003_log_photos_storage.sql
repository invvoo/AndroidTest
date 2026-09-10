-- ============================================================
-- 0003 — Storage for log photos (build step 3).
--
-- The `logs` table and its RLS (logs_read / logs_write) already exist
-- from 0001; logging needs no new table. It does need a Storage bucket
-- for the drink photo, with policies that let a user manage only their
-- own files. Files are namespaced by user id: `<uid>/<uuid>.<ext>`.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('log-photos', 'log-photos', true)
on conflict (id) do nothing;

-- Photos are public (it's a social review app), like logs themselves.
create policy "log photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'log-photos');

-- A user may write only under their own <uid>/ prefix.
create policy "users upload own log photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own log photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own log photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'log-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
