-- =====================================================================
-- Weekendr – storage for event cover photos
-- Run once in Supabase: SQL Editor → New query → paste → Run
-- (after 0001 and 0002). Safe to run again.
-- =====================================================================

-- A public bucket: anyone can view the images, only organizers can upload.
-- Limits: 5 MB per file, JPEG / PNG / WebP only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Each organizer uploads into their own folder: event-images/<their user id>/<file>
drop policy if exists "Organizers upload event images" on storage.objects;
create policy "Organizers upload event images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'organizer')
  );

-- Needed so organizers can find (and then change or delete) their own files.
-- Viewing images through their public URL doesn't need this.
drop policy if exists "Organizers read own event images" on storage.objects;
create policy "Organizers read own event images" on storage.objects
  for select to authenticated
  using (bucket_id = 'event-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Organizers update own event images" on storage.objects;
create policy "Organizers update own event images" on storage.objects
  for update to authenticated
  using (bucket_id = 'event-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Organizers delete own event images" on storage.objects;
create policy "Organizers delete own event images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'event-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
